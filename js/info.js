document.addEventListener("DOMContentLoaded", () => {
  const {
    formatCurrency,
    formatCompactNumber,
    formatPercent,
    slugToQueryParam,
    getPortfolio,
    savePortfolio,
    toggleFavorite,
    isFavorite,
    renderEmptyState,
  } = window.cryptoAtlas;

  const coinId = slugToQueryParam("id", "bitcoin");
  const detailIntro = document.querySelector("#detail-intro");
  const priceGrid = document.querySelector("#price-grid");
  const factsGrid = document.querySelector("#facts-grid");
  const rangeSwitcher = document.querySelector("#range-switcher");
  const favoriteToggle = document.querySelector("#favorite-toggle");
  const portfolioForm = document.querySelector("#portfolio-form");
  const holdingAmountInput = document.querySelector("#holding-amount");
  const alertPriceInput = document.querySelector("#detail-alert-price");
  const portfolioSummary = document.querySelector("#portfolio-summary");
  const detailNewsFeed = document.querySelector("#detail-news-feed");

  let chart;
  let currentCoin;

  function updateFavoriteButton() {
    favoriteToggle.textContent = isFavorite(coinId) ? "Saved to Favorites" : "Save Favorite";
  }

  function renderIntro(coin) {
    detailIntro.innerHTML = `
      <div class="detail-coin">
        <img src="${coin.image.large}" alt="${coin.name} icon" />
        <div>
          <p class="section-kicker">${coin.symbol.toUpperCase()} • Rank #${coin.market_cap_rank || "N/A"}</p>
          <h2>${coin.name}</h2>
        </div>
      </div>
      <p>${coin.description.en ? coin.description.en.replace(/<[^>]+>/g, "").slice(0, 280) + "..." : "Detailed crypto intelligence for traders, investors, and curious explorers."}</p>
    `;
  }

  function renderPricing(coin) {
    const priceMap = coin.market_data.current_price;
    const entries = [
      ["USD", priceMap.usd, "usd"],
      ["EUR", priceMap.eur, "eur"],
      ["BTC", priceMap.btc, "btc"],
      ["ETH", priceMap.eth, "eth"],
      ["INR", priceMap.inr, "inr"],
      ["GBP", priceMap.gbp, "gbp"],
    ];

    priceGrid.innerHTML = entries
      .map(
        ([label, value, currency]) => `
          <article class="price-card">
            <span>${label}</span>
            <strong>${formatCurrency(value, currency)}</strong>
          </article>
        `
      )
      .join("");
  }

  function renderFacts(coin) {
    const data = [
      ["Market Cap", formatCurrency(coin.market_data.market_cap.usd, "usd")],
      ["24h Volume", formatCurrency(coin.market_data.total_volume.usd, "usd")],
      ["24h Change", formatPercent(coin.market_data.price_change_percentage_24h)],
      ["Circulating Supply", formatCompactNumber(coin.market_data.circulating_supply)],
      ["All-Time High", formatCurrency(coin.market_data.ath.usd, "usd")],
      ["Genesis Date", coin.genesis_date || "N/A"],
    ];

    factsGrid.innerHTML = data
      .map(
        ([label, value]) => `
          <article class="fact-card">
            <span>${label}</span>
            <strong>${value}</strong>
          </article>
        `
      )
      .join("");
  }

  function renderPortfolio(coin) {
    const portfolio = getPortfolio();
    const existing = portfolio[coin.id] || { amount: 1, alertPrice: "" };
    holdingAmountInput.value = existing.amount;
    alertPriceInput.value = existing.alertPrice;

    const currentValue = Number(existing.amount || 0) * coin.market_data.current_price.usd;
    const alertState =
      existing.alertPrice && coin.market_data.current_price.usd >= Number(existing.alertPrice)
        ? `<p class="positive">Alert active: price is above your target.</p>`
        : existing.alertPrice
          ? `<p>Alert target: ${formatCurrency(existing.alertPrice, "usd")}</p>`
          : "<p>No alert target yet.</p>";

    portfolioSummary.innerHTML = `
      <strong>${Number(existing.amount || 0).toFixed(4)} ${coin.symbol.toUpperCase()}</strong>
      <p>Portfolio value: ${formatCurrency(currentValue, "usd")}</p>
      ${alertState}
    `;
  }

  function renderNews(coin) {
    const cards = [];

    if (coin.links.homepage[0]) {
      cards.push(`
        <article class="news-card">
          <p class="section-kicker">Official Site</p>
          <strong>Project homepage</strong>
          <p>Review the official project materials, roadmap, and ecosystem updates.</p>
          <a href="${coin.links.homepage[0]}" target="_blank" rel="noreferrer">Visit website</a>
        </article>
      `);
    }

    if (coin.links.blockchain_site[0]) {
      cards.push(`
        <article class="news-card">
          <p class="section-kicker">Explorer</p>
          <strong>On-chain explorer access</strong>
          <p>Inspect transactions and network activity directly from the source.</p>
          <a href="${coin.links.blockchain_site[0]}" target="_blank" rel="noreferrer">Open explorer</a>
        </article>
      `);
    }

    cards.push(`
      <article class="news-card">
        <p class="section-kicker">Market Signal</p>
        <strong>${coin.name} market sentiment</strong>
        <p>${coin.name} is currently ${coin.market_data.price_change_percentage_24h >= 0 ? "showing upside momentum" : "facing short-term pressure"} with a 24h move of ${formatPercent(coin.market_data.price_change_percentage_24h)}.</p>
        <a href="https://www.coingecko.com/en/coins/${coin.id}" target="_blank" rel="noreferrer">View CoinGecko listing</a>
      </article>
    `);

    detailNewsFeed.innerHTML = cards.join("");
  }

  function buildChart(points, days) {
    const labels = points.map(([timestamp]) => {
      const date = new Date(timestamp);
      return days <= 1
        ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : date.toLocaleDateString([], { month: "short", day: "numeric" });
    });
    const values = points.map(([, price]) => price);
    const context = document.querySelector("#history-chart");

    if (chart) {
      chart.destroy();
    }

    chart = new Chart(context, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: `${currentCoin.name} price`,
            data: values,
            borderColor: "#ff7a18",
            backgroundColor: "rgba(255, 122, 24, 0.12)",
            fill: true,
            tension: 0.3,
            pointRadius: days <= 1 ? 2 : 0,
            pointHoverRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: "index",
          intersect: false,
        },
        scales: {
          y: {
            ticks: {
              callback(value) {
                return formatCurrency(value, "usd");
              },
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label(context) {
                return `${currentCoin.symbol.toUpperCase()}: ${formatCurrency(context.parsed.y, "usd")}`;
              },
            },
          },
        },
      },
    });
  }

  async function loadChart(days = 7) {
    try {
      const chartData = await window.cryptoAPI.getCoinMarketChart(coinId, Number(days));
      buildChart(chartData.prices, Number(days));
    } catch (error) {
      renderEmptyState(document.querySelector(".chart-card"), "Historical chart data is unavailable right now.");
    }
  }

  async function loadDetails() {
    try {
      currentCoin = await window.cryptoAPI.getCoinDetails(coinId);
      renderIntro(currentCoin);
      renderPricing(currentCoin);
      renderFacts(currentCoin);
      renderPortfolio(currentCoin);
      renderNews(currentCoin);
      updateFavoriteButton();
      await loadChart(7);
    } catch (error) {
      detailIntro.innerHTML = `<h2>Unable to load coin details</h2><p>Please try another cryptocurrency.</p>`;
      renderEmptyState(priceGrid, "Price data unavailable.");
      renderEmptyState(factsGrid, "Market facts unavailable.");
      renderEmptyState(detailNewsFeed, "Ecosystem briefing unavailable.");
    }
  }

  favoriteToggle.addEventListener("click", () => {
    if (!currentCoin) {
      return;
    }

    toggleFavorite({
      id: currentCoin.id,
      name: currentCoin.name,
      symbol: currentCoin.symbol,
      image: currentCoin.image.thumb,
    });
    updateFavoriteButton();
  });

  rangeSwitcher.querySelectorAll(".range-chip").forEach((button) => {
    button.addEventListener("click", async () => {
      rangeSwitcher.querySelectorAll(".range-chip").forEach((chip) => chip.classList.remove("is-active"));
      button.classList.add("is-active");
      await loadChart(button.dataset.days);
    });
  });

  portfolioForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!currentCoin) {
      return;
    }

    const portfolio = getPortfolio();
    portfolio[currentCoin.id] = {
      amount: Number(holdingAmountInput.value) || 0,
      alertPrice: alertPriceInput.value,
    };
    savePortfolio(portfolio);
    renderPortfolio(currentCoin);
  });

  loadDetails();
});
