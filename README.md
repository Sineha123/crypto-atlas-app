# Crypto Atlas App

Crypto Atlas is a multi-page cryptocurrency tracking web app built with HTML, CSS, and JavaScript. It lets users search for any cryptocurrency, view live market data, explore detailed coin information, and analyze historical price charts through an interactive interface.

## Features

- Search for any cryptocurrency by name or symbol
- View a realtime top-cryptocurrency bar on the home page
- Open detailed pages for each cryptocurrency
- See live prices in multiple currencies including USD, EUR, BTC, ETH, INR, and GBP
- Explore historical price movement using interactive charts
- Save favorite coins using local storage
- Track a basic portfolio and set alert targets
- Use a crypto converter for fiat and crypto comparisons
- Switch between multiple visual themes
- Read a market pulse and crypto insight feed

## Pages

### `index.html`

- Hero section with direct search
- Realtime top-coin market bar
- Trending leaderboard
- Profile and favorites section
- Converter section
- News and market pulse feed

### `search.html`

- Search input for any cryptocurrency
- Dynamic search results list
- "More Info" button for each result

### `info.html`

- Detailed information for a selected cryptocurrency
- Current prices in multiple currencies
- Interactive historical chart with different time ranges
- Market facts such as market cap, volume, supply, and all-time high
- Portfolio tracker and alert target inputs

## Technologies Used

- HTML5
- CSS3
- Vanilla JavaScript
- [CoinGecko API](https://www.coingecko.com/en/api)
- [Chart.js](https://www.chartjs.org/)

## How to Run

1. Clone the repository:

```bash
git clone https://github.com/Sineha123/crypto-atlas-app.git
```

2. Open the project folder:

```bash
cd crypto-atlas-app
```

3. Start a local server:

```bash
python3 -m http.server 8000
```

4. Open the app in your browser:

```text
http://127.0.0.1:8000/index.html
```

## Project Structure

```text
crypto-atlas-app/
├── index.html
├── search.html
├── info.html
├── styles.css
├── README.md
└── js/
    ├── api.js
    ├── common.js
    ├── index.js
    ├── search.js
    └── info.js
```

## Rubric Coverage

- UI Design: Consistent modern layout, custom themes, responsive sections, and styled cards
- Index Page: Search button, clickable live top-coin strip, realtime market dashboard
- Search Functionality: Search page with query-based coin results and More Info actions
- More Info Page: Detailed crypto stats, multi-currency prices, and historical chart
- Creativity: Themes, favorites, portfolio tracker, alert target, converter, historical data, and market feed

## Notes

- Live market data depends on the CoinGecko public API.
- Favorites, profile data, and portfolio values are stored in browser local storage.
- For best results, run the app using a local server instead of opening files directly.

## Author

Created by Sineha123.
