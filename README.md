# 🥬 Green Green — A GREEN Investment Calculator

A beautiful, AI-powered S&P 500 green investment calculator that ranks stocks by a weighted composite score of **environmental carbon footprint** and **projected financial return**.

---

## Project Structure

```
green-green/
├── index.html              ← Main HTML entry point
├── README.md               ← This file
│
├── css/
│   └── styles.css          ← All styles (dark green theme, animations)
│
├── js/
│   ├── calculator.js       ← Scoring logic, calculate(), result rendering
│   ├── ai.js               ← Claude AI recommendation engine
│   └── ui.js               ← Particles, live price sim, DOM init
│
└── data/
    └── stocks.js           ← S&P 500 stock database with ESG & financial data
```

## How It Works

### Composite Score Formula

```
Composite Score = (Carbon Score × Env Weight%) + (Return Score × Fin Weight%)
```

- **Carbon Score** (0–100): Based on MSCI ESG rating, Scope 1/2/3 emissions, net zero commitment credibility, and renewable energy %.
- **Return Score** (0–100): The stock's projected annual return normalised against the realistic range in the dataset (3%–40%).
- **Weights**: Set by the user via the two linked sliders (always sum to 100%).

### Risk Tiers

| Tier         | Return Estimate | Notes                              |
|------------- |-----------------|------------------------------------|
| Conservative | Low estimate    | Analyst floor case, stable sectors |
| Balanced     | Medium estimate | Analyst consensus / base case      |
| Aggressive   | High estimate   | Bull case; high-growth stocks      |

> All return estimates are based on analyst consensus from Bloomberg/FactSet as of 2024–2025.  
> They are **not guaranteed** and are for illustrative purposes only.

---

## Data Sources

All ESG and emissions data in `data/stocks.js` is sourced from:

| Source | Data Used |
|--------|-----------|
| **MSCI ESG Research** | ESG ratings (AAA → CCC), carbon scores |
| **S&P Global Trucost** | Carbon intensity (tCO₂/$M revenue) |
| **CDP (Carbon Disclosure Project)** | Scope 1, 2, 3 emissions disclosures |
| **Company Sustainability Reports (2023–2024)** | Net zero commitments, renewable % |
| **Bloomberg / FactSet Analyst Consensus** | Projected annual return ranges |

---

## Customisation

### Adding a new stock

Open `data/stocks.js` and add a new object to the `STOCKS` array following the existing pattern:

```js
{
  ticker: "TICKER",
  name: "Full Company Name",
  sector: "Sector Name",
  description: "One-line company description.",
  price: 123.45,
  mktCap: "$100B",
  pe: 25.0,

  carbonScore: 75,        // 0–100 composite ESG score
  carbonGrade: "B",       // A / B / C / D / F
  msciRating: "AA",       // AAA / AA / A / BBB / BB / B / CCC
  scope1: 50000,          // metric tons CO₂e — direct emissions
  scope2: 200000,         // metric tons CO₂e — purchased energy
  scope3: 2000000,        // metric tons CO₂e — value chain
  intensity: 1.5,         // tCO₂e per $1M revenue
  netZeroYear: 2040,
  renewables: 60,         // % of electricity from renewables
  reduction: "50% by 2035",
  commitment: "Official climate commitment text here.",

  annualReturn: { low: 7, medium: 12, high: 20 },  // % per year
  volatility: "medium",   // low / medium / high

  pros: ["Strength 1", "Strength 2", "Strength 3"],
  cons: ["Risk 1", "Risk 2"],

  invest: "BUY",          // STRONG BUY / BUY / HOLD / AVOID
  investClass: "sig-b"    // sig-sb / sig-b / sig-h / sig-a
}
```

### Changing the colour theme

All colours are CSS custom properties in `css/styles.css`:

```css
:root {
  --green:   #4ade80;   /* primary accent */
  --cyan:    #22d3ee;   /* secondary accent */
  --amber:   #fbbf24;   /* warning / highlight */
  --red:     #f87171;   /* danger / avoid */
  --bg:      #060d07;   /* page background */
  --surface: #0d1a0e;   /* card background */
}
```

---

## Disclaimer

This tool is for **educational and informational purposes only**.  
It does not constitute financial or investment advice.  
All projected returns are estimates and are not guaranteed.  
Always consult a qualified financial advisor before making investment decisions.

---

## API Keys & Setup

To run Green Green locally with full functionality (AI Advisor and Live Stock Pricing), you need to start the included Node.js server with your API keys.

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server with your keys:
   ```bash
   ANTHROPIC_API_KEY="sk-ant-..." FINNHUB_API_KEY="c..." npm start
   ```

### Anthropic API (AI Advisor)
The custom AI recommendation engine is powered by Claude. You will need an Anthropic API key to generate the "Get AI Advice" rationales.

### Finnhub API (Live Stock Pricing)
We use the **Finnhub REST API** to pull live, real-time market quotes for our allocation calculations.
- Get a free API key at [finnhub.io](https://finnhub.io/)
- The local server securely proxies requests to `/api/finnhub/quote` so your API key is never exposed to the frontend browser.

---

## Tech Stack

- **Vanilla HTML / CSS / JavaScript** — zero dependencies, no build step
- **Google Fonts** — Syne (display) + Space Grotesk (body)
- **Anthropic Claude API** — AI investment recommendations
- **CSS animations** — particles, ring charts, slide-in effects

---

*Built with GREEN GREEN · Powered by Claude AI · Data from MSCI, Trucost, CDP*
