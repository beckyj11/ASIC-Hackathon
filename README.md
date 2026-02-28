# 🥬 Green Green — A GREEN Investment Calculator

A beautiful, AI-powered S&P 500 green investment calculator that ranks stocks by a weighted composite score of **environmental carbon footprint** and **projected financial return**.

---

## 📁 Project Structure

```
verdant/
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

---

## Quick Start (VS Code)

### Option 1 — Live Server (recommended)

1. Install the **Live Server** extension in VS Code  
   *(search "Live Server" by Ritwick Dey in the Extensions panel)*

2. Right-click `index.html` → **Open with Live Server**

3. The app opens at `http://127.0.0.1:5500` — no build step needed!

### Option 2 — Open directly

Just double-click `index.html` to open it in your browser.  
*Note: The AI analysis button requires a web server (CORS) — use Live Server for that feature.*

---

## Enabling the AI Analysis Feature

The "Get AI Advice" button calls the **Anthropic Claude API**. To use it:

1. Get a free API key at [console.anthropic.com](https://console.anthropic.com)

2. Open `js/ai.js` and find this line near the top:

```js
apiKey: "YOUR_ANTHROPIC_API_KEY_HERE",
```

3. Replace `YOUR_ANTHROPIC_API_KEY_HERE` with your actual key.

> !! **Security warning:** Never commit your API key to GitHub or expose it publicly. !!
> For a production deployment, proxy the API call through your own backend server.

---

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

## Tech Stack

- **Vanilla HTML / CSS / JavaScript** — zero dependencies, no build step
- **Google Fonts** — Syne (display) + Space Grotesk (body)
- **Anthropic Claude API** — AI investment recommendations
- **CSS animations** — particles, ring charts, slide-in effects

---

*Built with GREEN GREEN · Powered by Claude AI · Data from MSCI, Trucost, CDP*
