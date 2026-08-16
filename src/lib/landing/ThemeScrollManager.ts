// Alternating Light & Dark Section Theme Scroll Manager
export class ThemeScrollManager {
  observer: IntersectionObserver | null = null;

  init() {
    if (typeof window === "undefined") return;

    const landingRoot = document.querySelector(".landing-root");
    const sections = document.querySelectorAll("[data-theme]");
    if (!sections.length || !landingRoot) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const theme = entry.target.getAttribute("data-theme");
            if (theme === "dark") {
              landingRoot.classList.add("theme-contrast");
            } else {
              landingRoot.classList.remove("theme-contrast");
            }
          }
        });
      },
      {
        threshold: 0.3,
        rootMargin: "-40px 0px -40px 0px",
      }
    );

    sections.forEach((section) => this.observer?.observe(section));
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    const landingRoot = document.querySelector(".landing-root");
    if (landingRoot) {
      landingRoot.classList.remove("theme-contrast");
    }
    document.body.classList.remove("theme-contrast");
  }
}
