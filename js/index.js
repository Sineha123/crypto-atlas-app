document.addEventListener("DOMContentLoaded", () => {
  const {
    formatCurrency,
    formatCompactNumber,
    formatPercent,
    getProfile,
    saveProfile,
    navigateToCoin,
    renderEmptyState,
  } = window.cryptoAtlas;

  const heroSearchForm = document.querySelector("#hero-search-form");
  const heroQueryInput = document.querySelector("#hero-query");
  const strip = document.querySelector("#top-coins-strip");
  const highlightList = document.querySelector("#hero-highlight-list");
  const trendingGrid = document.querySelector("#trending-grid");
  const refreshTrendingButton = document.querySelector("#refresh-trending");
  const converterForm = document.querySelector("#converter-form");
  const converterCoin = document.querySelector("#converter-coin");
  const converterAmount = document.querySelector("#converter-amount");
  const converterCurrency = document.querySelector("#converter-currency");
  const converterResult = document.querySelector("#converter-result");
  const profileForm = document.querySelector("#profile-form");
  const profileName = document.querySelector("#profile-name");
  const profileAlert = document.querySelector("#profile-alert");
  const profileSummary = document.querySelector("#profile-summary");
  const newsFeed = document.querySelector("#news-feed");

  const assetStat = document.querySelector("#stat-assets");
  const moveStat = document.querySelector("#stat-market-move");
  const favoriteStat = document.querySelector("#stat-favorites");

  let topCoinsCache = [];
  let lastSnapshot = {};

  function submitSearch(query) {
    if (!query.trim()) {
      return;
    }
    window.location.href = `./search.html?query=${encodeURIComponent(query.trim())}`;
  }

  function renderProfile() {
    const profile = getProfile();
    profileName.value = profile.name || "";
    profileAlert.value = profile.alertTarget || "";
    favoriteStat.textContent = profile.favorites.length;

    const favoriteLine =
      profile.favorites.length > 0
        ? profile.favorites.map((coin) => coin.symbol.toUpperCase()).join(", ")
        : "No favorites saved yet.";

    profileSummary.innerHTML = `
      <strong>${profile.name || "Market Voyager"}</strong>
      <p>Favorites: ${favoriteLine}</p>
      <p>BTC alert target: ${profile.alertTarget ? formatCurrency(profile.alertTarget, "usd") : "Not set"}</p>
    `;
  }

  function renderMarketStrip(coins) {
    strip.innerHTML = coins
      .map((coin) => {
        const previous = lastSnapshot[coin.id];
        const flashClass =
          previous && previous !== coin.current_price
            ? coin.current_price > previous
              ? "flash-up"
              : "flash-down"
            : "";

        lastSnapshot[coin.id] = coin.current_price;

        return `
          <a class="market-pill ${flashClass}" href="./info.html?id=${coin.id}">
            <div class="coin-inline">
              <img src="${coin.image}" alt="${coin.name} icon" />
              <div>
                <strong>${coin.name}</strong>
                <div class="leader-card__meta">${coin.symbol.toUpperCase()}</div>
              </div>
            </div>
            <strong>${formatCurrency(coin.current_price, "usd")}</strong>
            <div class="${coin.price_change_percentage_24h >= 0 ? "positive" : "negative"}">
              ${formatPercent(coin.price_change_percentage_24h)}
            </div>
          </a>
        `;
      })
      .join("");
  }

  function renderHighlights(coins) {
    highlightList.innerHTML = coins
      .slice(0, 4)
      .map(
        (coin) => `
          <li>
            <a href="./info.html?id=${coin.id}">
              <div class="coin-inline">
                <img src="${coin.image}" alt="${coin.name} icon" />
                <div>
                  <strong>${coin.name}</strong>
                  <div class="leader-card__meta">${coin.symbol.toUpperCase()}</div>
                </div>
              </div>
              <strong>${formatCurrency(coin.current_price, "usd")}</strong>
            </a>
          </li>
        `
      )
      .join("");
  }

  function renderTrending(coins) {
    trendingGrid.innerHTML = coins
      .slice(0, 6)
      .map(
        (coin, index) => `
          <article class="leader-card">
            <div class="result-header">
              <img src="${coin.image}" alt="${coin.name} icon" />
              <div>
                <strong>#${index + 1} ${coin.name}</strong>
                <div class="leader-card__meta">${coin.symbol.toUpperCase()} • ${formatCompactNumber(coin.market_cap)}</div>
              </div>
            </div>
            <p>${formatCurrency(coin.current_price, "usd")} current price</p>
            <p class="${coin.price_change_percentage_24h >= 0 ? "positive" : "negative"}">${formatPercent(coin.price_change_percentage_24h)} in the last 24h</p>
            <button class="button button--ghost leader-open" data-coin-id="${coin.id}" type="button">More Info</button>
          </article>
        `
      )
      .join("");

    trendingGrid.querySelectorAll(".leader-open").forEach((button) => {
      button.addEventListener("click", () => navigateToCoin(button.dataset.coinId));
    });
  }

  function renderConverterOptions(coins) {
    converterCoin.innerHTML = coins
      .slice(0, 12)
      .map(
        (coin) =>
          `<option value="${coin.id}" data-price="${coin.current_price}">${coin.name} (${coin.symbol.toUpperCase()})</option>`
      )
      .join("");
  }

  function renderNewsFeed(coins) {
    if (!coins.length) {
      renderEmptyState(newsFeed, "Live market notes will appear here once data is available.");
      return;
    }

    const rising = [...coins]
      .sort((left, right) => (right.price_change_percentage_24h || 0) - (left.price_change_percentage_24h || 0))
      .slice(0, 3);
    const falling = [...coins]
      .sort((left, right) => (left.price_change_percentage_24h || 0) - (right.price_change_percentage_24h || 0))
      .slice(0, 2);

    const cards = [
      ...rising.map(
        (coin) => `
          <article class="news-card">
            <p class="section-kicker">Momentum Alert</p>
            <strong>${coin.name} is outperforming the top-coins basket.</strong>
            <p>${coin.symbol.toUpperCase()} moved ${formatPercent(coin.price_change_percentage_24h)} in 24h while trading near ${formatCurrency(coin.current_price, "usd")}.</p>
            <a href="./info.html?id=${coin.id}">Open detailed chart</a>
          </article>
        `
      ),
      ...falling.map(
        (coin) => `
          <article class="news-card">
            <p class="section-kicker">Risk Watch</p>
            <strong>${coin.name} is cooling off after recent pressure.</strong>
            <p>${coin.symbol.toUpperCase()} slipped ${formatPercent(coin.price_change_percentage_24h)} in 24h. Check the 7D and 30D chart before entering.</p>
            <a href="./info.html?id=${coin.id}">Review more info</a>
          </article>
        `
      ),
    ];

    newsFeed.innerHTML = cards.join("");
  }

  async function updateDashboard() {
    try {
      const [coins, global] = await Promise.all([
        window.cryptoAPI.getTopCoins(12),
        window.cryptoAPI.getGlobal(),
      ]);
      topCoinsCache = coins;
      renderMarketStrip(coins);
      renderHighlights(coins);
      renderTrending(coins);
      renderConverterOptions(coins);
      renderNewsFeed(coins);

      assetStat.textContent = formatCompactNumber(global.data.active_cryptocurrencies);
      moveStat.textContent = formatPercent(global.data.market_cap_change_percentage_24h_usd);
    } catch (error) {
      renderEmptyState(strip, "Unable to load live market data right now.");
      renderEmptyState(highlightList, "Realtime leaders are temporarily unavailable.");
      renderEmptyState(trendingGrid, "Trending market data could not be loaded.");
      renderEmptyState(newsFeed, "Market feed is temporarily unavailable.");
    }
  }

  heroSearchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    submitSearch(heroQueryInput.value);
  });

  refreshTrendingButton.addEventListener("click", updateDashboard);

  converterForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!converterCoin.value) {
      converterResult.textContent = "Load market data first, then choose a coin.";
      return;
    }

    const amount = Number(converterAmount.value) || 0;
    const currency = converterCurrency.value;
    const priceData = await window.cryptoAPI.getSimplePrice([converterCoin.value], [currency]);
    const price = priceData[converterCoin.value][currency];
    const total = amount * price;
    const coinLabel = converterCoin.selectedOptions[0].textContent;
    converterResult.textContent = `${amount} ${coinLabel} = ${formatCurrency(total, currency)}`;
  });

  profileForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const profile = getProfile();
    profile.name = profileName.value.trim() || "Market Voyager";
    profile.alertTarget = profileAlert.value.trim();
    saveProfile(profile);
    renderProfile();
  });

  renderProfile();
  updateDashboard();
  window.setInterval(updateDashboard, 45000);
});
