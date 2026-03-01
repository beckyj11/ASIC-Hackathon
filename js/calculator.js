/**
 * GREEN GREEN — Calculator Logic
 * js/calculator.js
 *
 * Handles:
 *  - Slider sync (env/fin weights)
 *  - Quick amount buttons
 *  - Composite score calculation
 *  - Return projection
 *  - Main calculate() function that renders all results
 */

// ── Global state ──────────────────────────────────────────────
let envWeight = 50;   // % weight for environmental score
let finWeight = 50;   // % weight for financial return score
let lastResults = null; // cached after calculate() runs
let currentSearchQuery = ""; // text in the search input
let livePrices = {}; // { ticker: latestPrice }

// ── SLIDER SYNC ───────────────────────────────────────────────
/**
 * Keep both sliders in sync so they always sum to 100.
 * @param {boolean} fromFin - true if financial slider was moved
 */
function updateSliders(fromFin) {
  if (fromFin) {
    finWeight = parseInt(document.getElementById("finSlider").value);
    envWeight = 100 - finWeight;
    document.getElementById("envSlider").value = envWeight;
  } else {
    envWeight = parseInt(document.getElementById("envSlider").value);
    finWeight = 100 - envWeight;
    document.getElementById("finSlider").value = finWeight;
  }
  document.getElementById("envVal").textContent = envWeight + "%";
  document.getElementById("finVal").textContent = finWeight + "%";
}

// ── QUICK AMOUNT BUTTONS ──────────────────────────────────────
function setAmount(val) {
  document.getElementById("amountInput").value = val;
}

// ── HELPERS ───────────────────────────────────────────────────

/**
 * Clamp and normalise a value to 0–100 range.
 */
function normalize(val, min, max) {
  return Math.min(100, Math.max(0, ((val - min) / (max - min)) * 100));
}

/**
 * Return the hex colour for a carbon grade letter.
 */
function gradeColor(grade) {
  const map = { A: "#4ade80", B: "#22d3ee", C: "#fbbf24", D: "#fb923c", F: "#f87171" };
  return map[grade] || "#888";
}

/**
 * Format a raw emission number (tCO₂e) into a readable string.
 */
function formatEmissions(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M t";
  if (n >= 1000) return (n / 1000).toFixed(0) + "K t";
  return n + " t";
}

// ── CORE SCORING ──────────────────────────────────────────────

/**
 * Project future value of an investment using compound interest.
 * @returns {{ futureVal, gain, gainPct, annualRate }}
 */
function projectReturn(stock, amount, years, risk) {
  const rate = stock.annualReturn[risk] / 100;
  const futureVal = amount * Math.pow(1 + rate, years);
  const gain = futureVal - amount;
  const gainPct = (gain / amount) * 100;
  return {
    futureVal,
    gain,
    gainPct,
    annualRate: stock.annualReturn[risk]
  };
}

/**
 * Calculate the composite score for a stock based on the user's
 * env/fin weighting and their chosen risk tier.
 *
 * Formula:
 *   composite = (carbonScore × envWeight%) + (returnScore × finWeight%)
 *
 * returnScore is the annual return normalised to 0-100 against the
 * realistic min/max range in our dataset (3% – 40%).
 */
function compositeScore(stock, risk) {
  const annReturn = stock.annualReturn[risk];
  const returnScore = normalize(annReturn, 3, 40);
  const composite = Math.round(
    (stock.carbonScore * (envWeight / 100)) +
    (returnScore * (finWeight / 100))
  );
  return { composite, returnScore: Math.round(returnScore), carbonScore: stock.carbonScore };
}

// ── MAIN CALCULATE ────────────────────────────────────────────

function calculate() {
  const amount = parseFloat(document.getElementById("amountInput").value);
  const years = parseInt(document.getElementById("horizonSelect").value);
  const risk = document.getElementById("riskSelect").value;

  // Validate
  if (!amount || amount <= 0) {
    const input = document.getElementById("amountInput");
    input.focus();
    input.style.borderColor = "var(--red)";
    setTimeout(() => (input.style.borderColor = ""), 2000);
    return;
  }

  // Score every stock, applying live price if available
  let usedLivePrice = false;
  const scored = STOCKS.map((s) => {
    // Override with live WS price if we have it
    let activePrice = s.price;
    if (livePrices[s.ticker]) {
      activePrice = livePrices[s.ticker];
      usedLivePrice = true;
    }
    const stockWithLivePrice = { ...s, price: activePrice };

    const scores = compositeScore(stockWithLivePrice, risk);
    const ret = projectReturn(stockWithLivePrice, amount, years, risk);
    return { ...stockWithLivePrice, ...scores, ...ret };
  }).sort((a, b) => b.composite - a.composite);

  const investable = scored.filter((s) => s.invest !== "AVOID");
  const avoidList = scored.filter((s) => s.invest === "AVOID");

  lastResults = { amount, years, risk, scored, investable, avoidList };

  // ── Update meta tags ──
  document.getElementById("metaAmount").textContent = "$" + amount.toLocaleString() + " invested";
  document.getElementById("metaHorizon").textContent = years + " year horizon";
  document.getElementById("metaRisk").textContent =
    { low: "Conservative", medium: "Balanced", high: "Aggressive" }[risk] + " risk";

  // ── Summary boxes ──
  const top = investable[0];
  const topGain = top.futureVal - amount;
  const avgCarbon = Math.round(
    investable.slice(0, 3).reduce((a, s) => a + s.carbonScore, 0) / 3
  );
  const bestReturn = investable.reduce(
    (a, s) => (s.gainPct > a.gainPct ? s : a), investable[0]
  );

  document.getElementById("summaryGrid").innerHTML = `
    <div class="sum-box highlight">
      <div class="sum-val" style="color:var(--green)">
        $${top.futureVal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
      </div>
      <div class="sum-key">Projected Value (${top.ticker})</div>
    </div>
    <div class="sum-box">
      <div class="sum-val" style="color:var(--cyan)">
        +$${topGain.toLocaleString(undefined, { maximumFractionDigits: 0 })}
      </div>
      <div class="sum-key">Estimated Gain (Top Pick)</div>
    </div>
    <div class="sum-box">
      <div class="sum-val" style="color:var(--green)">${avgCarbon}/100</div>
      <div class="sum-key">Avg Carbon Score (Top 3)</div>
    </div>
    <div class="sum-box">
      <div class="sum-val" style="color:var(--amber)">
        ${bestReturn.gainPct.toFixed(0)}%
      </div>
      <div class="sum-key">Best ${years}yr Return (${bestReturn.ticker})</div>
    </div>`;

  // ── Portfolio allocation bars (top 5) ──
  const top5 = investable.slice(0, 5);
  const totalComp = top5.reduce((a, s) => a + s.composite, 0);

  document.getElementById("allocBars").innerHTML = top5
    .map((s) => {
      const allocPct = Math.round((s.composite / totalComp) * 100);
      const allocAmt = amount * (allocPct / 100);
      const g = gradeColor(s.carbonGrade);
      return `
        <div class="alloc-row">
          <div class="alloc-ticker" style="color:${g}">${s.ticker}</div>
          <div class="alloc-bar">
            <div class="alloc-fill" style="width:${allocPct}%;background:${g}"></div>
          </div>
          <div class="alloc-pct" style="color:${g}">${allocPct}%</div>
          <div class="alloc-amt">
            $${allocAmt.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>`;
    })
    .join("");

  // ── Ranked list ──
  document.getElementById("searchInput").value = "";
  currentSearchQuery = "";
  renderRankedList();

  // ── Avoid section ──
  document.getElementById("avoidSection").innerHTML = `
    <div class="avoid-title">⚠️ Stocks to Avoid for ESG Investors</div>
    ${avoidList
      .map(
        (s) => `
      <div class="avoid-item">
        <span style="color:var(--red);font-family:'Syne',sans-serif;font-weight:700;min-width:48px">
          ${s.ticker}
        </span>
        <span style="color:var(--text-dim);font-size:9px;letter-spacing:1px;text-transform:uppercase;
          background:rgba(248,113,113,0.1);padding:2px 8px;border-radius:4px">
          Grade ${s.carbonGrade}
        </span>
        <span>${s.name} — ${s.cons[0]}</span>
      </div>`
      )
      .join("")}`;

  // ── Reset AI panel ──
  document.getElementById("aiRecPh").style.display = "block";
  document.getElementById("aiRecResp").style.display = "none";
  document.getElementById("aiRecResp").textContent = "";
  document.getElementById("aiRecBtn").disabled = false;
  document.getElementById("aiRecBtn").textContent = "🌿 Get AI Advice";
  document.getElementById("aiRecProg").style.display = "none";

  // ── Price source indicator ──
  const ind = document.getElementById("priceSourceIndicator");
  if (ind) {
    if (usedLivePrice) {
      ind.textContent = "Pricing Source: Live Finnhub websocket data";
      ind.classList.add("live");
    } else {
      ind.textContent = "Pricing Source: Static database records";
      ind.classList.remove("live");
    }
  }

  // ── Show results ──
  document.getElementById("resultsSection").style.display = "block";
  setTimeout(
    () =>
      document
        .getElementById("resultsSection")
        .scrollIntoView({ behavior: "smooth" }),
    100
  );
}

// ── SEARCH LOGIC ─────────────────────────────────────────────

function filterResults() {
  currentSearchQuery = document.getElementById("searchInput").value.toLowerCase();

  const resultItems = document.querySelectorAll("#rankedList .result-item");
  let visibleCount = 0;

  resultItems.forEach((item) => {
    // Ticker and Name elements
    const tickerEl = item.querySelector(".res-ticker");
    const nameEl = item.querySelector(".res-name");

    // We only want the text, ignoring any nested badges
    const tickerText = tickerEl ? tickerEl.innerText.toLowerCase() : "";
    const nameText = nameEl ? nameEl.innerText.toLowerCase() : "";

    if (tickerText.includes(currentSearchQuery) || nameText.includes(currentSearchQuery)) {
      item.style.display = ""; // Show
      visibleCount++;
    } else {
      item.style.display = "none"; // Hide
    }
  });

  const rankedList = document.getElementById("rankedList");
  let noResultsMsg = document.getElementById("noResultsMsg");

  if (visibleCount === 0) {
    if (!noResultsMsg) {
      noResultsMsg = document.createElement("div");
      noResultsMsg.id = "noResultsMsg";
      noResultsMsg.style.textAlign = "center";
      noResultsMsg.style.padding = "40px 20px";
      noResultsMsg.style.color = "var(--text-dim)";
      noResultsMsg.style.fontSize = "14px";
      rankedList.appendChild(noResultsMsg);
    }
    noResultsMsg.textContent = `No stocks found matching "${currentSearchQuery}"`;
    noResultsMsg.style.display = "block";
  } else if (noResultsMsg) {
    noResultsMsg.style.display = "none";
  }
}

function renderRankedList() {
  if (!lastResults) return;
  const { investable, amount, years } = lastResults;

  // Render the full list initially
  document.getElementById("rankedList").innerHTML = investable
    .map((s, i) => buildResultRow(s, i, amount, years))
    .join("");

  // Re-apply any existing search filter immediately
  if (currentSearchQuery) {
    filterResults();
  }
}

// ── RESULT ROW BUILDER ────────────────────────────────────────

function buildResultRow(s, i, amount, years) {
  const rank = i + 1;
  const rankClass = rank === 1 ? "rank-1" : rank === 2 ? "rank-2" : rank === 3 ? "rank-3" : "";
  const numClass = rank === 1 ? "gold" : rank === 2 ? "silver" : rank === 3 ? "bronze" : "";
  const g = gradeColor(s.carbonGrade);
  const pos = s.gainPct >= 0;
  const shares = Math.floor(amount / s.price);
  const cost = (shares * s.price).toLocaleString(undefined, { maximumFractionDigits: 0 });
  const delay = i * 0.07;

  // Dynamic badges
  const badges = [];
  if (rank === 1) {
    badges.push(
      `<span class="best-badge" style="background:rgba(251,191,36,0.15);color:#fbbf24">★ TOP PICK</span>`
    );
  }
  if (s.carbonScore >= 88) {
    badges.push(
      `<span class="best-badge" style="background:rgba(74,222,128,0.15);color:#4ade80">🌱 BEST GREEN</span>`
    );
  }

  const rankLabel =
    rank === 1 ? "BEST" : rank === 2 ? "2ND" : rank === 3 ? "3RD" : rank + "TH";

  return `
  <div class="result-item ${rankClass}" style="animation-delay:${delay}s" 
       onmouseenter="showFinnhubHover(event, '${s.ticker}')"
       onmousemove="moveFinnhubHover(event)"
       onmouseleave="hideFinnhubHover()">
    <div class="result-main">

      <!-- Rank -->
      <div class="res-rank">
        <div class="res-rank-num ${numClass}">${rank}</div>
        <div class="rank-label">${rankLabel}</div>
      </div>

      <!-- Info -->
      <div>
        <div class="res-ticker">${s.ticker} ${badges.join(" ")}</div>
        <div class="res-name">${s.name}</div>
        <div class="res-sector">${s.sector}</div>
      </div>

      <!-- Allocation -->
      <div>
        <div class="res-invest-label">Your Allocation</div>
        <div class="res-shares">${shares} shares</div>
        <div class="res-cost">~$${cost} spent</div>
      </div>

      <!-- Projected return -->
      <div>
        <div class="return-label">Projected Return</div>
        <div class="return-val" style="color:${pos ? "var(--green)" : "var(--red)"}">
          +${s.gainPct.toFixed(0)}%
        </div>
        <div class="return-period">
          over ${years} yr · ${s.annualRate}%/yr
        </div>
      </div>

      <!-- Carbon ring -->
      <div>
        <div class="carbon-label">Carbon Score</div>
        <div style="display:flex;align-items:center;gap:8px">
          <div class="carbon-ring-sm">
            <svg width="46" height="46" viewBox="0 0 46 46">
              <circle cx="23" cy="23" r="19" fill="none"
                stroke="rgba(255,255,255,0.07)" stroke-width="5"/>
              <circle cx="23" cy="23" r="19" fill="none"
                stroke="${g}" stroke-width="5"
                stroke-dasharray="${2 * Math.PI * 19}"
                stroke-dashoffset="${2 * Math.PI * 19 * (1 - s.carbonScore / 100)}"
                stroke-linecap="round"
                style="filter:drop-shadow(0 0 4px ${g})"/>
            </svg>
            <div class="carbon-ring-text">
              <div class="crt-score" style="color:${g}">${s.carbonScore}</div>
              <div class="crt-grade" style="color:${g}">${s.carbonGrade}</div>
            </div>
          </div>
          <div style="font-size:9px;color:var(--text-dim)">MSCI<br>${s.msciRating}</div>
        </div>
      </div>

      <!-- Composite score -->
      <div class="res-composite">
        <div class="comp-label">Composite Score</div>
        <div class="comp-score" style="color:${g}">${s.composite}</div>
        <div class="comp-bar">
          <div class="comp-fill" style="width:${s.composite}%;background:${g}"></div>
        </div>
        <div class="comp-sub">${envWeight}% env · ${finWeight}% fin</div>
      </div>

    </div>
    <!-- Removed Finnhub Hover Card from here -->
  </div>`;
}

// ── FINNHUB HOVER LOGIC ───────────────────────────────────────
const finnhubCache = {};
let hoverCardEl = null;

function initFinnhubTooltip() {
  if (!hoverCardEl) {
    hoverCardEl = document.createElement("div");
    hoverCardEl.className = "finnhub-hover-card";
    document.body.appendChild(hoverCardEl);
  }
}

async function showFinnhubHover(event, symbol) {
  initFinnhubTooltip();
  hoverCardEl.classList.add("visible");
  moveFinnhubHover(event);

  if (finnhubCache[symbol]) {
    renderFinnhubData(hoverCardEl, finnhubCache[symbol]);
    return;
  }

  hoverCardEl.innerHTML = `<div class="finnhub-title">Basic Financials (Finnhub)</div><div style="font-size:12px;color:var(--text-dim);text-align:center;padding:10px;">Loading financials...</div>`;

  try {
    const res = await fetch(`/api/finnhub?symbol=${symbol}&metric=all`);
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);

    finnhubCache[symbol] = data;
    renderFinnhubData(hoverCardEl, data);
  } catch (err) {
    hoverCardEl.innerHTML = `<div class="finnhub-error">Could not load financials: ${err.message}</div>`;
  }
}

function moveFinnhubHover(event) {
  if (!hoverCardEl) return;

  // Offset a bit so the cursor doesn't block the tooltip
  let x = event.clientX + 15;
  let y = event.clientY + 15;

  // Keep tooltip on screen
  const rect = hoverCardEl.getBoundingClientRect();
  if (x + rect.width > window.innerWidth) x = window.innerWidth - rect.width - 10;
  if (y + rect.height > window.innerHeight) y = window.innerHeight - rect.height - 10;

  hoverCardEl.style.left = x + "px";
  hoverCardEl.style.top = y + "px";
}

function hideFinnhubHover() {
  if (hoverCardEl) {
    hoverCardEl.classList.remove("visible");
  }
}

function renderFinnhubData(card, data) {
  if (!data || !data.metric) {
    card.innerHTML = `<div class="finnhub-error">No financial data available</div>`;
    return;
  }
  const m = data.metric;
  card.innerHTML = `
    <div class="finnhub-title">Basic Financials (Finnhub)</div>
    <div class="finnhub-grid">
      <div class="f-stat"><span class="f-lbl">P/E (TTM)</span><span class="f-val">${m.peExclExtraTTM ? m.peExclExtraTTM.toFixed(2) : '-'}</span></div>
      <div class="f-stat"><span class="f-lbl">Beta</span><span class="f-val">${m.beta ? m.beta.toFixed(2) : '-'}</span></div>
      <div class="f-stat"><span class="f-lbl">52w High</span><span class="f-val">$${m['52WeekHigh'] ? m['52WeekHigh'].toFixed(2) : '-'}</span></div>
      <div class="f-stat"><span class="f-lbl">52w Low</span><span class="f-val">$${m['52WeekLow'] ? m['52WeekLow'].toFixed(2) : '-'}</span></div>
      <div class="f-stat"><span class="f-lbl">EPS (TTM)</span><span class="f-val">$${m.epsTTM ? m.epsTTM.toFixed(2) : '-'}</span></div>
      <div class="f-stat"><span class="f-lbl">Vol (10d)</span><span class="f-val">${m['10DayAverageTradingVolume'] ? m['10DayAverageTradingVolume'].toFixed(2) + 'M' : '-'}</span></div>
    </div>
  `;
}

// ── LIVE REST QUOTES ──────────────────────────────────────────

async function fetchLiveQuotes() {
  console.log("Fetching live REST quotes for all stocks...");

  // Finnhub free tier allows 60 calls/minute. We have ~13 stocks, so fetching
  // all of them simultaneously on page load is fully within limits.
  const promises = STOCKS.map(async (stock) => {
    try {
      const res = await fetch(`/api/finnhub/quote?symbol=${stock.ticker}`);
      const data = await res.json();

      // data.c = Current price from Finnhub quote endpoint
      if (data && data.c && data.c > 0) {
        livePrices[stock.ticker] = data.c;
      }
    } catch (err) {
      console.warn(`Failed to fetch quote for ${stock.ticker}`, err);
    }
  });

  await Promise.all(promises);
  console.log("Finished fetching live quotes.");

  // If a calculation is already displayed, re-calculate silently to use the new exact prices
  if (lastResults) {
    silentRecalculate();
  }
}

// Fetch all quotes once on load
document.addEventListener("DOMContentLoaded", fetchLiveQuotes);
