type Theme = "dark" | "light";

function getCurrentTheme(): Theme {
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

function applyTheme(theme: Theme) {
  if (theme === "light") {
    document.documentElement.setAttribute("data-theme", "light");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
  try {
    localStorage.setItem("theme", theme);
  } catch {
    // storage unavailable (private mode, etc.) — theme just won't persist
  }
  document.querySelectorAll<HTMLElement>("[data-theme-toggle]").forEach((btn) => {
    syncButtonLabel(btn, theme);
  });
}

function syncButtonLabel(btn: HTMLElement, theme: Theme) {
  btn.setAttribute("aria-checked", theme === "light" ? "true" : "false");
  const nextActionLabel = theme === "light" ? btn.dataset.labelDark : btn.dataset.labelLight;
  if (nextActionLabel) {
    btn.setAttribute("aria-label", nextActionLabel);
    btn.setAttribute("title", nextActionLabel);
  }
}

export function initThemeToggle() {
  const current = getCurrentTheme();
  document.querySelectorAll<HTMLElement>("[data-theme-toggle]").forEach((btn) => {
    syncButtonLabel(btn, current);
    if (btn.dataset.initialized) return;
    btn.dataset.initialized = "true";
    btn.addEventListener("click", () => {
      applyTheme(getCurrentTheme() === "light" ? "dark" : "light");
    });
  });
}
