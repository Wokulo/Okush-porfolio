const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const navLinks = document.querySelectorAll(".site-nav a[href^='#']");

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const sections = document.querySelectorAll("section[id]");
const navLinksAll = document.querySelectorAll(".site-nav a[href^='#']");

function updateActiveNav() {
  let currentId = "";
  sections.forEach((section) => {
    const sectionTop = section.offsetTop - 100;
    if (scrollY >= sectionTop) {
      currentId = section.getAttribute("id") || "";
    }
  });

  navLinksAll.forEach((link) => {
    link.classList.remove("active");
    const href = link.getAttribute("href");
    if (href && href.slice(1) === currentId) {
      link.classList.add("active");
    }
  });
}

window.addEventListener("scroll", updateActiveNav, { passive: true });
updateActiveNav();

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!prefersReducedMotion) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  document.querySelectorAll(".reveal").forEach((section) => observer.observe(section));
} else {
  document.querySelectorAll(".reveal").forEach((section) => section.classList.add("visible"));
}

const backToTop = document.querySelector(".back-to-top");
if (backToTop) {
  const toggleBackToTop = () => {
    if (scrollY > 500) {
      backToTop.classList.add("visible");
    } else {
      backToTop.classList.remove("visible");
    }
  };

  window.addEventListener("scroll", toggleBackToTop, { passive: true });
  toggleBackToTop();

  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  });
}

const darkToggle = document.createElement("button");
darkToggle.className = "dark-mode-toggle";
darkToggle.innerHTML = "&#9790;";
darkToggle.setAttribute("aria-label", "Toggle dark mode");
darkToggle.type = "button";
document.body.appendChild(darkToggle);

const savedDark = localStorage.getItem("darkMode");
if (savedDark === "enabled") {
  document.body.classList.add("dark-mode");
  darkToggle.innerHTML = "&#9788;";
}

darkToggle.addEventListener("click", () => {
  const isDark = document.body.classList.toggle("dark-mode");
  localStorage.setItem("darkMode", isDark ? "enabled" : "disabled");
  darkToggle.innerHTML = isDark ? "&#9788;" : "&#9790;";
});

const projectModal = document.getElementById("project-modal");
const modalBody = document.getElementById("modal-body");
const modalClose = document.querySelector(".modal-close");
const modalBackdrop = document.querySelector(".project-modal-backdrop");

const projectDetails = {
  shambadoc: {
    title: "ShambaDoc / Okush",
    sections: [
      {
        heading: "01 — Problem",
        text: "Small-scale farmers and agricultural communities often lack easy access to reliable market information, weather data, and modern farming techniques. Information asymmetry leads to poor yields, unfair pricing, and limited access to markets."
      },
      {
        heading: "02 — Solution",
        text: "ShambaDoc is a cross-platform mobile and web application designed to bridge this gap. It provides farmers with real-time market prices, weather forecasts, and a knowledge base for best farming practices — all accessible through an intuitive interface."
      },
      {
        heading: "03 — Technology",
        text: "Flutter for cross-platform mobile development, Node.js for backend APIs, Firebase for authentication and real-time database, and AI/ML components for crop recommendation and market trend analysis."
      },
      {
        heading: "04 — Key Features",
        text: "User authentication, real-time market price updates, weather integration, AI-powered crop recommendations, community Q&A forums, location-based services, and offline-first data access."
      },
      {
        heading: "05 — Challenges",
        text: "Designing for low-connectivity environments, optimizing Flutter performance across devices, integrating multiple third-party APIs reliably, and building a data model that scales with growing user communities."
      },
      {
        heading: "06 — What I Learned",
        text: "Full-stack mobile development with Flutter and Firebase, REST API design and integration, working with AI/ML models in production, location services, and the importance of offline-first architecture for emerging-market applications."
      },
      {
        heading: "07 — Future Improvements",
        text: "Expanded AI/ML features for pest and disease detection, SMS/USSD integration for feature phone users, integration with more agricultural data sources, and a peer-to-peer marketplace for farm inputs and produce."
      }
    ]
  },
  taskmanager: {
    title: "Task Manager",
    sections: [
      {
        heading: "01 — Problem",
        text: "Simple to-do apps often lack the features needed for real productivity: prioritization, due dates, search, filtering, and persistent storage. Many solutions are either too simple or unnecessarily complex."
      },
      {
        heading: "02 — Solution",
        text: "A clean, fully functional task management application with local storage persistence, priority levels, due dates, search, multiple sort options, and an intuitive edit flow via a modal dialog."
      },
      {
        heading: "03 — Technology",
        text: "Vanilla JavaScript with modern ES6+ patterns, HTML5, CSS3, and the Web Storage API (localStorage). Uses the native <dialog> element for editing and template-based rendering for task items."
      },
      {
        heading: "04 — Key Features",
        text: "Create, read, update, and delete tasks; priority levels (low, medium, high); due dates; real-time search across titles and notes; filter by active/completed; sort by creation date, priority, or due date; and clear completed tasks in bulk."
      },
      {
        heading: "05 — Challenges",
        text: "Managing state consistency across multiple UI updates, ensuring data survives page refreshes via localStorage, handling edge cases in date parsing and sorting logic, and building accessible form validation."
      },
      {
        heading: "06 — What I Learned",
        text: "State management patterns in vanilla JavaScript, DOM manipulation and template cloning, localStorage persistence with error handling, accessible form design, and building a reactive UI without frameworks."
      },
      {
        heading: "07 — Future Improvements",
        text: "Drag-and-drop reordering, task categories or tags, recurring tasks, data export (JSON/CSV), and potential cloud sync with a backend service."
      }
    ]
  },
  portfolio: {
    title: "Portfolio Website",
    sections: [
      {
        heading: "01 — Problem",
        text: "Developer portfolios often look generic, load slowly, or fail to communicate technical depth. Many rely on heavy frameworks or templates that obscure the developer's actual skills."
      },
      {
        heading: "02 — Solution",
        text: "A custom-built, lightweight portfolio that prioritizes performance, accessibility, and semantic HTML. It demonstrates front-end craft without relying on frameworks, using vanilla JavaScript for interactivity."
      },
      {
        heading: "03 — Technology",
        text: "HTML5, CSS3 with custom properties and modern layout (Grid/Flexbox), vanilla JavaScript (ES6+), IntersectionObserver for scroll animations, and CSS transitions for micro-interactions."
      },
      {
        heading: "04 — Key Features",
        text: "Responsive design with mobile-first breakpoints, dark/light mode toggle with localStorage persistence, scroll-reveal animations, active navigation state, back-to-top button, accessible skip link, and semantic HTML structure."
      },
      {
        heading: "05 — Challenges",
        text: "Balancing visual polish with performance, ensuring accessibility across screen readers and keyboard navigation, managing CSS complexity without preprocessors, and creating smooth animations that respect reduced-motion preferences."
      },
      {
        heading: "06 — What I Learned",
        text: "Advanced CSS Grid and Flexbox layouts, IntersectionObserver API, accessible navigation patterns, dark mode implementation with CSS custom properties, and performance optimization for static sites."
      },
      {
        heading: "07 — Future Improvements",
        text: "Add project filtering, integrate a blog section, improve image optimization with responsive srcset, and add structured data markup for better SEO."
      }
    ]
  }
};

function openProjectModal(projectKey) {
  const project = projectDetails[projectKey];
  if (!project || !projectModal || !modalBody) return;

  const sectionsHtml = project.sections
    .map(
      (s) => `
      <div class="modal-section">
        <h4>${s.heading}</h4>
        <p>${s.text}</p>
      </div>
    `
    )
    .join("");

  modalBody.innerHTML = `
    <h2 id="modal-title">${project.title}</h2>
    ${sectionsHtml}
  `;

  projectModal.classList.add("open");
  document.body.style.overflow = "hidden";

  const closeBtn = projectModal.querySelector(".modal-close");
  if (closeBtn) closeBtn.focus();
}

function closeProjectModal() {
  if (!projectModal) return;
  projectModal.classList.remove("open");
  document.body.style.overflow = "";
}

document.querySelectorAll("[data-project]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const key = btn.getAttribute("data-project");
    openProjectModal(key);
  });
});

if (modalClose) {
  modalClose.addEventListener("click", closeProjectModal);
}

if (modalBackdrop) {
  modalBackdrop.addEventListener("click", closeProjectModal);
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && projectModal && projectModal.classList.contains("open")) {
    closeProjectModal();
  }
});

const contactForm = document.querySelector(".contact-form");
if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = contactForm.querySelector("input[name='name']");
    const email = contactForm.querySelector("input[name='email']");
    const message = contactForm.querySelector("textarea[name='message']");
    const statusEl = document.getElementById("form-status");
    let valid = true;

    if (!name || !name.value.trim()) {
      valid = false;
      if (name) name.style.borderColor = "#ef4444";
    } else if (name) {
      name.style.borderColor = "";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.value.trim())) {
      valid = false;
      if (email) email.style.borderColor = "#ef4444";
    } else if (email) {
      email.style.borderColor = "";
    }

    if (!message || !message.value.trim()) {
      valid = false;
      if (message) message.style.borderColor = "#ef4444";
    } else if (message) {
      message.style.borderColor = "";
    }

    if (!valid) {
      if (statusEl) { statusEl.textContent = "Please fix the errors above."; statusEl.style.color = "#ef4444"; }
      return;
    }

    const submitBtn = contactForm.querySelector("button[type='submit']");
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Sending...";
    submitBtn.disabled = true;
    if (statusEl) { statusEl.textContent = ""; statusEl.style.color = ""; }

    const formData = new FormData(contactForm);
    try {
      const response = await fetch(contactForm.action, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" }
      });

      if (response.ok) {
        if (statusEl) { statusEl.textContent = "Message sent successfully! I'll get back to you soon."; statusEl.style.color = "#065f46"; }
        contactForm.reset();
        setTimeout(() => {
          contactForm.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 100);
      } else {
        const data = await response.json().catch(() => ({}));
        const errorMsg = data.errors ? data.errors.map((err) => err.message).join(", ") : "Something went wrong. Please try again.";
        if (statusEl) { statusEl.textContent = errorMsg; statusEl.style.color = "#ef4444"; }
      }
    } catch (err) {
      if (statusEl) { statusEl.textContent = "Network error. Please try again later."; statusEl.style.color = "#ef4444"; }
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
}