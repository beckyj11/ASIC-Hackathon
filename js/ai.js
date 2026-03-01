/**
 * VERDANT — AI Recommendation Engine
 * js/ai.js
 *
 * Calls the Anthropic Claude API to generate a personalised
 * green investment recommendation based on the user's inputs
 * and the ranked stock results.
 *
 * ── IMPORTANT: API KEY ──────────────────────────────────────
 * The Claude API requires authentication. In production you
 * MUST proxy this request through your own backend server so
 * the key is never exposed in client-side JavaScript.
 *
 * For local development / testing you can set your key in
 * the CONFIG object below. Never commit a real key to Git.
 *
 * Quick local test setup:
 *   1. Get a key at https://console.anthropic.com
 *   2. Paste it in CONFIG.apiKey below (dev only)
 *   3. Open index.html via VS Code Live Server
 * ────────────────────────────────────────────────────────────
 */

const CONFIG = {
  model: "claude-haiku-4-5-20251001",
  //model: "claude-sonnet-4-5-20251001",
  maxTokens: 1800,
  apiUrl: "/api/recommend",

  // Typewriter effect speed (ms per character)
  typewriterSpeed: 8
};

// ── MAIN AI RECOMMENDATION ────────────────────────────────────

async function runAIRecommendation() {
  if (!lastResults) return;

  const { amount, years, risk, investable, avoidList } = lastResults;

  const btn = document.getElementById("aiRecBtn");
  const prog = document.getElementById("aiRecProg");
  const ph = document.getElementById("aiRecPh");
  const resp = document.getElementById("aiRecResp");

  // Loading state
  btn.disabled = true;
  btn.textContent = "⏳ Sprout is analyzing...";
  prog.style.display = "block";
  ph.style.display = "none";
  resp.style.display = "block";
  resp.textContent = "";

  // Build context strings
  const top5 = investable.slice(0, 5);
  const riskLabel = { low: "conservative", medium: "balanced", high: "aggressive" }[risk];
  const top5Summary = top5
    .map(
      (s, i) =>
        `${i + 1}. ${s.ticker} (${s.name}) — ` +
        `Composite: ${s.composite}/100, ` +
        `Carbon: ${s.carbonScore}/100 (Grade ${s.carbonGrade}), ` +
        `MSCI: ${s.msciRating}, ` +
        `Projected ${years}yr gain: +${s.gainPct.toFixed(0)}%, ` +
        `Annual return est: ${s.annualRate}%, ` +
        `Net Zero target: ${s.netZeroYear}`
    )
    .join("\n");

  const avoidSummary = avoidList
    .map((s) => `${s.ticker} (Grade ${s.carbonGrade}, ${s.intensity} tCO₂/$M revenue)`)
    .join(", ");

  const prompt = `You are Sprout, an expert green investment advisor specialising in S&P 500 ESG analysis. \
A user wants to invest $${amount.toLocaleString()} with a ${years}-year horizon and ${riskLabel} risk tolerance. \
They've weighted their priorities as ${envWeight}% environmental and ${finWeight}% financial return.

Top 5 stocks ranked by composite score (${envWeight}% environmental + ${finWeight}% financial):
${top5Summary}

ESG stocks to avoid: ${avoidSummary}

Write a personalised, SUCCINCT, actionable investment recommendation. Use the actual numbers provided. \
Structure your text-only response with these exact sections:

💼 YOUR INVESTMENT PROFILE
What $${amount.toLocaleString()} + ${years}-year + ${riskLabel} risk + ${envWeight}/${finWeight} env/fin weighting means strategically.

TOP RECOMMENDATION
Why the #1 stock is the best fit. Include specific shares they can buy and projected portfolio value.

SUGGESTED ALLOCATION
Explain why the suggested % allocation across the top 5 stocks makes sense for their goals but not what the allocatio is. 

ENVIRONMENTAL IMPACT
What choosing these stocks means for their environmental footprint vs. investing in XOM/CVX instead.

KEY RISKS TO WATCH
2–3 specific risks: market, regulatory, and ESG-washing considerations.

FINAL VERDICT
A crisp, confident recommendation they can act on today.

End with exactly: "This is for educational purposes only and does not constitute financial advice." but just once.`;

  try {
    const res = await fetch(CONFIG.apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: CONFIG.model,
        max_tokens: CONFIG.maxTokens,
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await res.json();

    if (data.error) {
      throw new Error(data.error.message || "API error");
    }

    const text = (data.content?.[0]?.text || "Analysis unavailable.").replace(/\*/g, "").replace(/---/g, "");

    renderAIResponse(text, resp);
    btn.disabled = false;
    btn.textContent = "🔄 Refresh Advice";
    prog.style.display = "none";

  } catch (err) {
    resp.textContent =
      `⚠️ Could not connect to the AI engine.\n\n` +
      `Make sure you started the server with:\n` +
      `  ANTHROPIC_API_KEY=sk-ant-... node server.js\n\n` +
      `Then open http://localhost:3000 (not VS Code Live Server).\n\n` +
      `Error: ${err.message}`;
    btn.disabled = false;
    btn.textContent = "🌿 Retry";
    prog.style.display = "none";
  }
}

// ── AI RESPONSE RENDERER ───────────────────────────────────────

function renderAIResponse(text, container) {
  const SECTIONS = [
    { key: "YOUR INVESTMENT PROFILE", icon: "💼", accent: "var(--cyan)" },
    { key: "TOP RECOMMENDATION", icon: "🏆", accent: "var(--green)" },
    { key: "SUGGESTED ALLOCATION", icon: "📊", accent: "var(--green)" },
    { key: "ENVIRONMENTAL IMPACT", icon: "🌍", accent: "var(--green2)" },
    { key: "KEY RISKS TO WATCH", icon: "⚠️", accent: "var(--amber)" },
    { key: "FINAL VERDICT", icon: "✅", accent: "var(--cyan)" },
  ];

  // Split text into labelled sections
  const lines = text.split("\n");
  const sections = [];
  let current = null;

  for (const line of lines) {
    const upper = line.trim().toUpperCase();
    const def = SECTIONS.find(s => upper.includes(s.key));
    if (def) {
      if (current) sections.push(current);
      current = { ...def, lines: [] };
    } else if (current) {
      current.lines.push(line);
    }
  }
  if (current) sections.push(current);

  // Fall back to plain text if the model didn't use the expected headers
  if (sections.length === 0) {
    container.style.whiteSpace = "pre-wrap";
    container.textContent = text;
    return;
  }

  container.innerHTML = "";

  const bodyEls = [];
  const bodies  = [];

  sections.forEach((sec, i) => {
    const body = sec.lines.join("\n").replace(/This is for educational purposes[^.]*\./gi, "").trim();
    if (!body) return;

    const card = document.createElement("div");
    card.className = "ai-section";
    card.style.animationDelay = `${i * 0.08}s`;

    const head = document.createElement("div");
    head.className = "ai-section-head";
    head.style.color = sec.accent;
    head.innerHTML = `<span>${sec.key}</span>`;

    const bodyEl = document.createElement("div");
    bodyEl.className = "ai-section-body";

    card.appendChild(head);
    card.appendChild(bodyEl);
    container.appendChild(card);

    if (sec.key === "SUGGESTED ALLOCATION") {
      renderAIAllocationBars(bodyEl);
      // Also typewrite the AI's explanation below the bars
      const textEl = document.createElement("div");
      textEl.className = "ai-alloc-text";
      bodyEl.appendChild(textEl);
      bodyEls.push(textEl);
      bodies.push(body);
    } else {
      bodyEls.push(bodyEl);
      bodies.push(body);
    }
  });

  // Disclaimer — hidden until typewriter finishes
  const discLine = text.split("\n").find(l => l.includes("educational purposes"));
  let discEl = null;
  if (discLine) {
    discEl = document.createElement("div");
    discEl.className = "ai-disclaimer";
    discEl.style.opacity = "0";
    container.appendChild(discEl);
  }

  // Chain typewriter effects across sections sequentially
  function typeNext(index) {
    if (index >= bodyEls.length) {
      if (discEl) {
        discEl.textContent = discLine.trim();
        discEl.style.opacity = "1";
      }
      return;
    }
    typewriterEffect(bodyEls[index], bodies[index], CONFIG.typewriterSpeed, () => typeNext(index + 1));
  }
  typeNext(0);
}

// ── AI ALLOCATION VISUAL ───────────────────────────────────────

function renderAIAllocationBars(container) {
  if (!lastResults) return;
  const { investable, amount } = lastResults;
  const top5 = investable.slice(0, 5);
  const totalComp = top5.reduce((a, s) => a + s.composite, 0);
  const fills = [];

  top5.forEach(s => {
    const allocPct = Math.round((s.composite / totalComp) * 100);
    const allocAmt = Math.round(amount * (allocPct / 100));
    const g = gradeColor(s.carbonGrade);

    const fill = document.createElement("div");
    fill.className = "alloc-fill";
    fill.style.width = "0%";
    fill.style.background = g;

    const bar = document.createElement("div");
    bar.className = "alloc-bar";
    bar.appendChild(fill);

    const ticker = document.createElement("div");
    ticker.className = "alloc-ticker";
    ticker.style.color = g;
    ticker.textContent = s.ticker;

    const pct = document.createElement("div");
    pct.className = "alloc-pct";
    pct.style.color = g;
    pct.textContent = allocPct + "%";

    const amt = document.createElement("div");
    amt.className = "alloc-amt";
    amt.textContent = "$" + allocAmt.toLocaleString();

    const row = document.createElement("div");
    row.className = "alloc-row";
    row.appendChild(ticker);
    row.appendChild(bar);
    row.appendChild(pct);
    row.appendChild(amt);

    container.appendChild(row);
    fills.push({ el: fill, pct: allocPct });
  });

  setTimeout(() => fills.forEach(({ el, pct }) => { el.style.width = pct + "%"; }), 50);
}

// ── TYPEWRITER HELPER ──────────────────────────────────────────

function typewriterEffect(element, text, speed, onDone) {
  let i = 0;
  element.textContent = "";
  function tick() {
    if (i < text.length) {
      element.textContent += text[i++];
      setTimeout(tick, speed);
    } else if (onDone) {
      onDone();
    }
  }
  tick();
}
