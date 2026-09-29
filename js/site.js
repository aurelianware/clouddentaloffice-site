document.addEventListener("DOMContentLoaded", () => {
  const bar = document.getElementById("stickyCta");
  const hero = document.querySelector(".hero-section");
  const next = document.getElementById("next-step");
  if (bar && hero) {
    const update = () => {
      let show = hero.getBoundingClientRect().bottom < 0;
      if (show && next) {
        const r = next.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) show = false;
      }
      bar.classList.toggle("visible", show);
    };
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  const form = document.getElementById("contact-form");
  if (!form) return;
  // The markup uses native `required` validation so the no-JS post to Formspree
  // is still checked. With the script running, show our own messages instead.
  form.noValidate = true;

  // "Join the Zocdoc pilot" links arrive as /contact?interest=zocdoc.
  const zocdoc = document.getElementById("c-zocdoc");
  if (zocdoc && new URLSearchParams(location.search).get("interest") === "zocdoc") zocdoc.checked = true;
  const SALES = "sales@cloudhealthoffice.com";
  const submit = document.getElementById("contact-submit");
  const err = document.getElementById("contact-error");
  const showError = (msg, mailto) => {
    err.textContent = msg;
    if (mailto) {
      const a = document.createElement("a");
      a.href = mailto;
      a.textContent = "Email " + SALES;
      err.append(" ", a, ".");
    }
    err.hidden = false;
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("c-name").value.trim();
    const practice = document.getElementById("c-practice").value.trim();
    const email = document.getElementById("c-email").value.trim();
    const message = document.getElementById("c-message").value.trim();
    err.hidden = true;
    if (!name || !practice || !email || !message) {
      showError("Please fill in name, practice, email, and message.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError("Please enter a valid email address.");
      return;
    }

    // Fallback if Formspree is unreachable or rejects the post: a prefilled message
    // to the same inbox, so the inquiry is never lost.
    const subject = encodeURIComponent("Pilot inquiry — " + practice);
    const body = encodeURIComponent("Name: " + name + "\nPractice: " + practice + "\nEmail: " + email +
      (zocdoc && zocdoc.checked ? "\nZocdoc pilot: yes" : "") + "\n\n" + message);
    const mailto = "mailto:" + SALES + "?subject=" + subject + "&body=" + body;

    submit.disabled = true;
    submit.textContent = "Sending…";
    try {
      const data = new FormData(form);
      data.set("_replyto", email);
      const res = await fetch(form.action, { method: "POST", headers: { Accept: "application/json" }, body: data });
      if (!res.ok) throw new Error("Formspree returned " + res.status);
      form.style.display = "none"; // .cho-leadform sets display, which overrides [hidden]
      document.getElementById("contact-thanks").hidden = false;
    } catch (_) {
      showError("We could not send the form.", mailto);
      submit.disabled = false;
      submit.textContent = "Send message";
    }
  });
});
