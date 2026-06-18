(() => {
  "use strict";

  const GITHUB_USERNAME = "Mtorres27-97";
  const API_URL = `https://api.github.com/users/${encodeURIComponent(GITHUB_USERNAME)}/repos?sort=updated&direction=desc&per_page=100`;
  const CACHE_KEY = `github-projects-${GITHUB_USERNAME}`;
  const CACHE_TTL = 60 * 60 * 1000;
  const REQUEST_TIMEOUT = 12000;

  const navToggle = document.querySelector(".nav-toggle");
  const navPanel = document.querySelector(".nav-panel");
  const navLinks = [...document.querySelectorAll(".nav-link")];
  const themeToggle = document.querySelector(".theme-toggle");
  const themeIcon = themeToggle?.querySelector("span");
  const projectsGrid = document.querySelector("#projects-grid");
  const projectsStatus = document.querySelector("#projects-status");
  const currentYear = document.querySelector("#current-year");
  const backToTop = document.querySelector(".back-to-top");
  const liveRegion = document.querySelector("#live-region");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const announce = (message) => {
    if (!liveRegion) return;
    liveRegion.textContent = "";
    window.setTimeout(() => { liveRegion.textContent = message; }, 50);
  };

  const closeMenu = () => {
    if (!navToggle || !navPanel) return;
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Abrir menú de navegación");
    navPanel.classList.remove("is-open");
  };

  const initMenu = () => {
    if (!navToggle || !navPanel) return;
    navToggle.addEventListener("click", () => {
      const open = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!open));
      navToggle.setAttribute("aria-label", open ? "Abrir menú de navegación" : "Cerrar menú de navegación");
      navPanel.classList.toggle("is-open", !open);
    });
    navLinks.forEach((link) => link.addEventListener("click", closeMenu));
    document.addEventListener("click", (event) => {
      if (!navPanel.classList.contains("is-open")) return;
      if (navPanel.contains(event.target) || navToggle.contains(event.target)) return;
      closeMenu();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });
  };

  const initSmoothScroll = () => {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (event) => {
        const selector = link.getAttribute("href");
        if (!selector || selector === "#") return;
        const target = document.querySelector(selector);
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "start" });
      });
    });
  };

  const initActiveSection = () => {
    if (!("IntersectionObserver" in window)) return;
    const sections = navLinks.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);
    const observer = new IntersectionObserver((entries) => {
      const active = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!active) return;
      navLinks.forEach((link) => {
        const selected = link.getAttribute("href") === `#${active.target.id}`;
        link.classList.toggle("is-active", selected);
        selected ? link.setAttribute("aria-current", "page") : link.removeAttribute("aria-current");
      });
    }, { rootMargin: "-30% 0px -55% 0px", threshold: [0.05, 0.25, 0.5] });
    sections.forEach((section) => observer.observe(section));
  };

  const initReveal = () => {
    const elements = document.querySelectorAll(".reveal");
    if (reduceMotion.matches || !("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    elements.forEach((element) => observer.observe(element));
  };

  const getTheme = () => {
    try {
      const stored = localStorage.getItem("matiast-theme");
      if (stored === "light" || stored === "dark") return stored;
    } catch { /* localStorage puede estar bloqueado */ }
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  };

  const applyTheme = (theme, persist = true) => {
    document.documentElement.dataset.theme = theme;
    const dark = theme === "dark";
    if (themeToggle && themeIcon) {
      themeToggle.setAttribute("aria-label", dark ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
      themeIcon.textContent = dark ? "☀" : "☾";
    }
    if (persist) {
      try { localStorage.setItem("matiast-theme", theme); } catch { /* Sin persistencia */ }
    }
  };

  const initTheme = () => {
    applyTheme(getTheme(), false);
    themeToggle?.addEventListener("click", () => {
      const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      applyTheme(next);
      announce(`Modo ${next === "dark" ? "oscuro" : "claro"} activado.`);
    });
  };

  const formatDate = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Fecha no disponible";
    return new Intl.DateTimeFormat("es-CL", { day: "2-digit", month: "short", year: "numeric" }).format(date);
  };

  const validUrl = (value) => {
    try {
      const url = new URL(value);
      return url.protocol === "https:" || url.protocol === "http:";
    } catch { return false; }
  };

  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  const createButtonLink = (label, href, secondary = false) => {
    const link = element("a", `button ${secondary ? "button--secondary" : "button--primary"}`, label);
    link.href = href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    return link;
  };

  const createProjectCard = (repo) => {
    const card = element("article", "project-card reveal is-visible");
    card.append(element("h3", "", repo.name));
    card.append(element("p", "project-card__description", repo.description?.trim() || "Repositorio público sin descripción disponible."));

    const meta = element("div", "project-card__meta");
    meta.setAttribute("aria-label", "Información del repositorio");
    meta.append(element("span", "", `● ${repo.language || "Sin lenguaje indicado"}`));
    meta.append(element("span", "", `★ ${Number.isFinite(repo.stargazers_count) ? repo.stargazers_count : 0}`));
    meta.append(element("span", "", `Actualizado: ${formatDate(repo.updated_at)}`));
    card.append(meta);

    const actions = element("div", "project-card__actions");
    actions.append(createButtonLink("Ver repositorio", repo.html_url));
    if (validUrl(repo.homepage)) actions.append(createButtonLink("Ver demo", repo.homepage, true));
    card.append(actions);
    return card;
  };

  const selectProjects = (repos) => repos
    .filter((repo) => repo && !repo.archived)
    .sort((a, b) => {
      if (a.fork !== b.fork) return Number(a.fork) - Number(b.fork);
      return new Date(b.updated_at) - new Date(a.updated_at);
    })
    .slice(0, 6);

  const renderProjects = (repos) => {
    if (!projectsGrid || !projectsStatus) return;
    const selected = selectProjects(repos);
    projectsStatus.hidden = true;
    projectsGrid.replaceChildren();
    if (!selected.length) {
      showProjectsError("Todavía no hay repositorios públicos disponibles para mostrar.", false);
      return;
    }
    const fragment = document.createDocumentFragment();
    selected.forEach((repo) => fragment.append(createProjectCard(repo)));
    projectsGrid.append(fragment);
    announce(`${selected.length} proyectos cargados.`);
  };

  const setLoading = (message = "Cargando proyectos desde GitHub…") => {
    if (!projectsGrid || !projectsStatus) return;
    projectsGrid.replaceChildren();
    projectsStatus.hidden = false;
    projectsStatus.replaceChildren(element("span", "loader"), element("span", "", message));
    projectsStatus.querySelector(".loader")?.setAttribute("aria-hidden", "true");
  };

  const showProjectsError = (message, retry = true) => {
    if (!projectsGrid || !projectsStatus) return;
    projectsStatus.hidden = true;
    projectsGrid.replaceChildren();
    const card = element("article", "fallback-card");
    card.append(element("h3", "", "Proyectos temporalmente no disponibles"));
    card.append(element("p", "", message));
    const actions = element("div", "project-card__actions");
    if (retry) {
      const button = element("button", "button button--primary", "Reintentar");
      button.type = "button";
      button.addEventListener("click", () => loadProjects(true));
      actions.append(button);
    }
    actions.append(createButtonLink("Ver repositorios en GitHub", `https://github.com/${GITHUB_USERNAME}?tab=repositories`, true));
    card.append(actions);
    projectsGrid.append(card);
  };

  const readCache = () => {
    try {
      const value = JSON.parse(localStorage.getItem(CACHE_KEY));
      if (!value || !Array.isArray(value.repos) || !Number.isFinite(value.savedAt)) return null;
      return value;
    } catch { return null; }
  };

  const saveCache = (repos) => {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), repos })); } catch { /* Sin caché */ }
  };

  const requestProjects = async () => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    try {
      const response = await fetch(API_URL, {
        headers: {
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28"
        },
        signal: controller.signal
      });
      if (!response.ok) {
        const error = new Error(`GitHub respondió con estado ${response.status}`);
        error.status = response.status;
        error.reset = response.headers.get("x-ratelimit-reset");
        throw error;
      }
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error("Respuesta inesperada de GitHub.");
      return data;
    } finally {
      window.clearTimeout(timeout);
    }
  };

  const errorMessage = (error) => {
    if (!navigator.onLine) return "No hay conexión a Internet. Revisa tu conexión y vuelve a intentarlo.";
    if (error?.status === 403 || error?.status === 429) {
      if (error.reset) {
        const date = new Date(Number(error.reset) * 1000);
        if (!Number.isNaN(date.getTime())) {
          const time = new Intl.DateTimeFormat("es-CL", { hour: "2-digit", minute: "2-digit" }).format(date);
          return `GitHub alcanzó temporalmente el límite de solicitudes. Intenta nuevamente después de las ${time}.`;
        }
      }
      return "GitHub alcanzó temporalmente el límite de solicitudes. Espera unos minutos y vuelve a intentarlo.";
    }
    if (error?.status === 404) return "No se encontró el usuario de GitHub configurado.";
    if (error?.name === "AbortError") return "GitHub tardó demasiado en responder. Vuelve a intentarlo.";
    return "No fue posible conectar con la API de GitHub. Puedes abrir los repositorios directamente desde el botón inferior.";
  };

  const loadProjects = async (force = false) => {
    if (!projectsGrid || !projectsStatus) return;
    const cache = readCache();
    const fresh = cache && Date.now() - cache.savedAt < CACHE_TTL;
    if (!force && fresh) {
      renderProjects(cache.repos);
      return;
    }
    setLoading(force ? "Actualizando proyectos…" : "Cargando proyectos desde GitHub…");
    try {
      const repos = await requestProjects();
      saveCache(repos);
      renderProjects(repos);
    } catch (error) {
      console.warn("No fue posible cargar GitHub:", error);
      if (cache?.repos?.length) {
        renderProjects(cache.repos);
        announce("GitHub no respondió. Se muestran proyectos guardados anteriormente.");
        return;
      }
      showProjectsError(errorMessage(error));
      announce("No fue posible cargar los proyectos.");
    }
  };

  const initBackToTop = () => {
    if (!backToTop) return;
    const update = () => backToTop.classList.toggle("is-visible", window.scrollY > 600);
    window.addEventListener("scroll", update, { passive: true });
    update();
    backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion.matches ? "auto" : "smooth" }));
  };

  if (currentYear) currentYear.textContent = String(new Date().getFullYear());
  initMenu();
  initSmoothScroll();
  initActiveSection();
  initReveal();
  initTheme();
  initBackToTop();
  loadProjects();
})();
