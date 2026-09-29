// Mobile Navigation Handler
// Shared across all site pages

function initMobileMenu() {
  const menuToggle = document.getElementById('mobileMenuToggle');
  const mainNav = document.getElementById('mainNav');

  if (!menuToggle || !mainNav) return;

  // Helper: collapse the mobile menu
  function closeMenu() {
    mainNav.classList.remove('mobile-menu-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.textContent = '☰';
  }

  // Toggle menu on button click
  menuToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = mainNav.classList.toggle('mobile-menu-open');
    menuToggle.setAttribute('aria-expanded', isOpen);
    menuToggle.textContent = isOpen ? '✕' : '☰';
  });

  // Close menu when clicking any link inside mainNav
  mainNav.addEventListener('click', (e) => {
    if (e.target.closest('a')) {
      closeMenu();
    }
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('nav') && mainNav.classList.contains('mobile-menu-open')) {
      closeMenu();
    }
  });

  // Close menu on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mainNav.classList.contains('mobile-menu-open')) {
      closeMenu();
      menuToggle.focus();
    }
  });
}

// "For developers & partners" disclosure menu
function initNavGroups() {
  document.querySelectorAll('.nav-group__toggle').forEach((toggle) => {
    const menu = document.getElementById(toggle.getAttribute('aria-controls'));
    if (!menu) return;
    const group = toggle.closest('.nav-group');

    function setOpen(open) {
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      menu.classList.toggle('is-open', open);
    }

    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    // Escape closes the submenu and returns focus to its button
    group.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        e.stopPropagation();
        setOpen(false);
        toggle.focus();
      }
    });

    // Close when focus or a click leaves the group
    group.addEventListener('focusout', (e) => {
      if (!group.contains(e.relatedTarget)) setOpen(false);
    });
    document.addEventListener('click', (e) => {
      if (!group.contains(e.target)) setOpen(false);
    });
  });
}

// Auto-initialize on DOM ready
document.addEventListener('DOMContentLoaded', initMobileMenu);
document.addEventListener('DOMContentLoaded', initNavGroups);
