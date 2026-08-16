// Alternating Light & Dark Section Theme Scroll Manager
export class ThemeScrollManager {
  observer: IntersectionObserver | null = null;

  init() {
    if (typeof window === "undefined") return;

    const sections = document.querySelectorAll("[data-theme]");
    if (!sections.length) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const theme = entry.target.getAttribute("data-theme");
            if (theme === "dark") {
              document.body.classList.add("theme-contrast");
            } else {
              document.body.classList.remove("theme-contrast");
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
    document.body.classList.remove("theme-contrast");
  }
}
