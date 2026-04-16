(function () {
  const storageKeys = {
    theme: "crypto-atlas-theme",
    profile: "crypto-atlas-profile",
    portfolio: "crypto-atlas-portfolio",
  };

  const themes = ["sunrise", "night", "aurora"];

  function formatCurrency(value, currency = "usd") {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
      return "--";
    }

    const normalized = currency.toLowerCase();

    if (["btc", "eth"].includes(normalized)) {
      return `${Number(value).toFixed(6)} ${normalized.toUpperCase()}`;
    }

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: normalized.toUpperCase(),
      maximumFractionDigits: value >= 1000 ? 0 : 2,
    }).format(value);
  }

  function formatCompactNumber(value) {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
      return "--";
    }

    return new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(value);
  }

  function formatPercent(value) {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
      return "--";
    }
    return `${value >= 0 ? "+" : ""}${Number(value).toFixed(2)}%`;
  }

  function slugToQueryParam(key, fallback = "") {
    return new URLSearchParams(window.location.search).get(key) || fallback;
  }

  function setTheme(theme) {
    const mapped = theme === "sunrise" ? "" : theme;
    document.body.dataset.theme = mapped;
    localStorage.setItem(storageKeys.theme, theme);
  }

  function initThemeToggle() {
    const saved = localStorage.getItem(storageKeys.theme) || "sunrise";
    setTheme(saved);
    const toggle = document.querySelector("#theme-toggle");

    if (!toggle) {
      return;
    }

    toggle.addEventListener("click", () => {
      const current = localStorage.getItem(storageKeys.theme) || "sunrise";
      const next = themes[(themes.indexOf(current) + 1) % themes.length];
      setTheme(next);
      toggle.textContent = next.charAt(0).toUpperCase() + next.slice(1);
    });

    toggle.textContent = saved.charAt(0).toUpperCase() + saved.slice(1);
  }

  function getProfile() {
    return JSON.parse(
      localStorage.getItem(storageKeys.profile) ||
        JSON.stringify({
          name: "Market Voyager",
          favorites: [],
          alertTarget: "",
        })
    );
  }

  function saveProfile(profile) {
    localStorage.setItem(storageKeys.profile, JSON.stringify(profile));
  }

  function getPortfolio() {
    return JSON.parse(localStorage.getItem(storageKeys.portfolio) || "{}");
  }

  function savePortfolio(portfolio) {
    localStorage.setItem(storageKeys.portfolio, JSON.stringify(portfolio));
  }

  function toggleFavorite(coin) {
    const profile = getProfile();
    const exists = profile.favorites.find((item) => item.id === coin.id);

    profile.favorites = exists
      ? profile.favorites.filter((item) => item.id !== coin.id)
      : [...profile.favorites, coin];

    saveProfile(profile);
    return !exists;
  }

  function isFavorite(id) {
    return getProfile().favorites.some((item) => item.id === id);
  }

  function navigateToCoin(id) {
    window.location.href = `./info.html?id=${encodeURIComponent(id)}`;
  }

  function renderEmptyState(container, message) {
    container.innerHTML = `<article class="news-card"><p>${message}</p></article>`;
  }

  window.cryptoAtlas = {
    formatCurrency,
    formatCompactNumber,
    formatPercent,
    slugToQueryParam,
    getProfile,
    saveProfile,
    getPortfolio,
    savePortfolio,
    toggleFavorite,
    isFavorite,
    navigateToCoin,
    renderEmptyState,
    initThemeToggle,
  };

  window.addEventListener("DOMContentLoaded", initThemeToggle);
})();
