const API_ROOT = "https://api.coingecko.com/api/v3";

const queryString = (params) =>
  new URLSearchParams(
    Object.entries(params).reduce((accumulator, [key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        accumulator[key] = value;
      }
      return accumulator;
    }, {})
  ).toString();

async function requestJson(path, params = {}) {
  const url = `${API_ROOT}${path}?${queryString(params)}`;
  const response = await fetch(url, {
    headers: {
      accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}

window.cryptoAPI = {
  getTopCoins(limit = 10) {
    return requestJson("/coins/markets", {
      vs_currency: "usd",
      order: "market_cap_desc",
      per_page: limit,
      page: 1,
      sparkline: false,
      price_change_percentage: "24h",
    });
  },

  searchCoins(query) {
    return requestJson("/search", {
      query,
    });
  },

  getCoinDetails(id) {
    return requestJson(`/coins/${id}`, {
      localization: false,
      tickers: false,
      market_data: true,
      community_data: true,
      developer_data: true,
      sparkline: false,
    });
  },

  getCoinMarketChart(id, days = 7) {
    return requestJson(`/coins/${id}/market_chart`, {
      vs_currency: "usd",
      days,
      interval: days <= 1 ? "hourly" : "daily",
    });
  },

  getSimplePrice(ids, currencies) {
    return requestJson("/simple/price", {
      ids,
      vs_currencies: currencies.join(","),
      include_24hr_change: true,
    });
  },

  getGlobal() {
    return requestJson("/global");
  },
};
