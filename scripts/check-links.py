#!/usr/bin/env python3
"""Internal link check for the static site. Standard library only.

Resolves every internal href/src in every *.html file the way Cloudflare
Pages serves them, and fails if any target is missing. Also checks
sitemap.xml and robots.txt, and guards against the .html rewrite rules
that caused the redirect loop.

Rules:
  - "/"            -> index.html
  - "/platform"    -> platform.html (or platform/index.html)
  - "/css/x.css"   -> the file itself
  - "#id"          -> an element with that id on the target page
  - Links ending in ".html" fail: Pages 308-redirects them to the clean
    URL, so they cost a hop and hide typos. Link to "/platform", not
    "/platform.html".
  - A _redirects file with a ".html" 200 rewrite fails: it fights Pages'
    built-in clean URLs and loops.

Usage: python3 scripts/check-links.py [site_root]
"""

import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
SKIP_DIRS = {".git", ".github", "node_modules", "scripts"}
LINK_ATTRS = {"href", "src", "srcset", "content", "poster", "action"}
# <meta content> is only a link for these properties.
META_URL_PROPS = {"og:image", "og:url", "twitter:image"}
EXTERNAL = re.compile(r"^(?:[a-z][a-z0-9+.-]*:|//)", re.I)
# Absolute URLs on these hosts are checked as internal links.
OWN_HOSTS = {
    "clouddentaloffice.com",
    "www.clouddentaloffice.com",
    "clouddental.io",
    "clouddentaloffice-www.pages.dev",
}


class Collector(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.links = []  # (line, attr, value)
        self.ids = set()

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if "id" in a:
            self.ids.add(a["id"])
        if tag == "a" and "name" in a:
            self.ids.add(a["name"])
        line = self.getpos()[0]
        for key, val in attrs:
            if val is None or key not in LINK_ATTRS:
                continue
            if key == "content":
                prop = a.get("property") or a.get("name") or ""
                if tag != "meta" or prop not in META_URL_PROPS:
                    continue
            if key == "srcset":
                for part in val.split(","):
                    url = part.strip().split(" ")[0]
                    if url:
                        self.links.append((line, key, url))
                continue
            self.links.append((line, key, val))

    handle_startendtag = handle_starttag


def html_files():
    for p in sorted(ROOT.rglob("*.html")):
        if not SKIP_DIRS.intersection(p.relative_to(ROOT).parts):
            yield p


def resolve(path):
    """Map a URL path to the file Cloudflare Pages would serve, or None."""
    rel = unquote(path).lstrip("/")
    if rel == "" or rel.endswith("/"):
        candidates = [rel + "index.html"]
    else:
        candidates = [rel, rel + ".html", rel + "/index.html"]
    for c in candidates:
        f = (ROOT / c).resolve()
        # "../" must not escape the upload root: Pages never serves files above it.
        if not f.is_relative_to(ROOT):
            continue
        if f.is_file():
            return f
    return None


def main():
    parsed = {}
    for f in html_files():
        c = Collector()
        c.feed(f.read_text(encoding="utf-8"))
        parsed[f] = c

    errors = []
    checked = 0
    for page, c in parsed.items():
        page_rel = page.relative_to(ROOT)
        page_dir = "/" + page_rel.parent.as_posix().strip(".")
        for line, attr, raw in c.links:
            url = raw.strip()
            where = f"{page_rel}:{line}"
            # Template placeholders are filled in before launch; skip them.
            if "{{" in url or url.startswith(("mailto:", "tel:", "javascript:", "data:")):
                continue
            if EXTERNAL.match(url):
                # Absolute URLs to our own site are treated as internal.
                parts = urlsplit(url)
                if parts.hostname not in OWN_HOSTS:
                    continue
                path, frag = parts.path or "/", parts.fragment
            else:
                parts = urlsplit(url)
                path, frag = parts.path, parts.fragment
                if path and not path.startswith("/"):
                    path = page_dir.rstrip("/") + "/" + path
            checked += 1
            if path == "":
                target = page
            else:
                if path.endswith(".html"):
                    errors.append(f"{where}: {attr}=\"{raw}\" uses .html; link to the clean URL instead")
                    continue
                target = resolve(path)
                if target is None:
                    errors.append(f"{where}: {attr}=\"{raw}\" -> no file for {path}")
                    continue
            if frag and target.suffix == ".html":
                ids = parsed.get(target).ids if target in parsed else set()
                if frag not in ids:
                    errors.append(f"{where}: {attr}=\"{raw}\" -> no id=\"{frag}\" on {target.relative_to(ROOT)}")

    # sitemap.xml: every <loc> must map to a page.
    sitemap = ROOT / "sitemap.xml"
    if sitemap.is_file():
        for loc in re.findall(r"<loc>\s*([^<\s]+)\s*</loc>", sitemap.read_text(encoding="utf-8")):
            if "{{" in loc:
                path = re.sub(r"^\{\{[A-Z_]+\}\}", "", loc)
            else:
                path = urlsplit(loc).path
            checked += 1
            if (path or "/").endswith(".html") or resolve(path or "/") is None:
                errors.append(f"sitemap.xml: {loc} -> no page for {path or '/'}")

    # robots.txt: every Sitemap: line must point at a file we ship.
    robots = ROOT / "robots.txt"
    if robots.is_file():
        for n, rule in enumerate(robots.read_text(encoding="utf-8").splitlines(), 1):
            key, _, value = rule.partition(":")
            if key.strip().lower() != "sitemap":
                continue
            loc = value.strip()
            parts = urlsplit(loc)
            checked += 1
            if parts.hostname not in OWN_HOSTS and "{{" not in loc:
                errors.append(f"robots.txt:{n}: Sitemap {loc} is not on a site host")
            elif resolve(parts.path) is None:
                errors.append(f"robots.txt:{n}: Sitemap {loc} -> no file for {parts.path}")

    # 404.html must exist: Cloudflare Pages serves it for unknown paths.
    if not (ROOT / "404.html").is_file():
        errors.append("404.html is missing; Cloudflare Pages would fall back to SPA mode (serving index.html for every path)")

    # Guard against the redirect loop coming back.
    redirects = ROOT / "_redirects"
    if redirects.is_file():
        for n, rule in enumerate(redirects.read_text(encoding="utf-8").splitlines(), 1):
            fields = rule.split()
            if len(fields) >= 2 and not rule.lstrip().startswith("#") and fields[1].endswith(".html"):
                errors.append(
                    f"_redirects:{n}: '{rule.strip()}' rewrites to a .html file. Cloudflare Pages already "
                    "serves clean URLs; this rule causes a redirect loop."
                )

    if errors:
        print(f"Link check failed: {len(errors)} problem(s) in {checked} internal links\n")
        print("\n".join(errors))
        return 1
    print(f"Link check passed: {checked} internal links across {len(parsed)} pages")
    return 0


if __name__ == "__main__":
    sys.exit(main())
