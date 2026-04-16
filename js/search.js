document.addEventListener("DOMContentLoaded", () => {
  const { formatCompactNumber, renderEmptyState } = window.cryptoAtlas;
  const form = document.querySelector("#search-form");
  const queryInput = document.querySelector("#search-query");
  const resultsGrid = document.querySelector("#search-results");
  const resultCount = document.querySelector("#result-count");

  async function enrichResults(coins) {
    const topCoins = await window.cryptoAPI.getTopCoins(100);
    const map = new Map(topCoins.map((coin) => [coin.id, coin]));

    return coins.map((coin) => ({
      ...coin,
      market: map.get(coin.id),
    }));
  }

  function renderResults(items, query) {
    if (!items.length) {
      renderEmptyState(resultsGrid, `No cryptocurrencies found for "${query}".`);
      resultCount.textContent = "0 matches";
      return;
    }

    resultCount.textContent = `${items.length} match${items.length === 1 ? "" : "es"} for "${query}"`;
    resultsGrid.innerHTML = items
      .map(
        (item) => `
          <article class="search-result-card">
            <div class="result-header">
              <img src="${item.large}" alt="${item.name} icon" />
              <div>
                <strong>${item.name}</strong>
                <div class="result-meta">${item.symbol.toUpperCase()} • Rank ${item.market_cap_rank || "N/A"}</div>
              </div>
            </div>
            <p class="result-meta">${item.market ? `${formatCompactNumber(item.market.market_cap)} market cap` : "Extended market data loads on the detail page."}</p>
            <button class="button more-info-button" data-coin-id="${item.id}" type="button">More Info</button>
          </article>
        `
      )
      .join("");

    resultsGrid.querySelectorAll(".more-info-button").forEach((button) => {
      button.addEventListener("click", () => {
        window.location.href = `./info.html?id=${encodeURIComponent(button.dataset.coinId)}`;
      });
    });
  }

  async function runSearch(query) {
    if (!query.trim()) {
      renderEmptyState(resultsGrid, "Search for a cryptocurrency by name or symbol.");
      resultCount.textContent = "Enter a search term to begin.";
      return;
    }

    resultCount.textContent = "Searching live data...";
    try {
      const response = await window.cryptoAPI.searchCoins(query.trim());
      const filtered = response.coins.slice(0, 12);
      const enriched = await enrichResults(filtered);
      renderResults(enriched, query.trim());
    } catch (error) {
      renderEmptyState(resultsGrid, "Search is temporarily unavailable. Please try again.");
      resultCount.textContent = "Search error";
    }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = queryInput.value;
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set("query", query);
    window.history.replaceState({}, "", nextUrl);
    runSearch(query);
  });

  const initialQuery = window.cryptoAtlas.slugToQueryParam("query");
  if (initialQuery) {
    queryInput.value = initialQuery;
    runSearch(initialQuery);
  } else {
    renderEmptyState(resultsGrid, "Use the search bar above to find any cryptocurrency.");
  }
});
