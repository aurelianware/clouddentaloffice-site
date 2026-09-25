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
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("c-name").value.trim();
    const practice = document.getElementById("c-practice").value.trim();
    const email = document.getElementById("c-email").value.trim();
    const message = document.getElementById("c-message").value.trim();
    const err = document.getElementById("contact-error");
    if (!name || !practice || !email || !message) {
      err.hidden = false;
      err.textContent = "Please fill in name, practice, email, and message.";
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      err.hidden = false;
      err.textContent = "Please enter a valid email address.";
      return;
    }
    err.hidden = true;
    const subject = encodeURIComponent("Pilot inquiry — " + practice);
    const body = encodeURIComponent("Name: " + name + "\nPractice: " + practice + "\nEmail: " + email + "\n\n" + message);
    window.location.href = "mailto:sales@aurelianware.com?subject=" + subject + "&body=" + body;
    form.hidden = true;
    document.getElementById("contact-thanks").hidden = false;
  });
});
