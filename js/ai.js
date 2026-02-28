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
  model:      "claude-haiku-4-5-20251001",
  maxTokens:  1000,
  apiUrl:     "/api/recommend",

  // Typewriter effect speed (ms per character)
  typewriterSpeed: 8
};

// ── MAIN AI RECOMMENDATION ────────────────────────────────────

async function runAIRecommendation() {
  if (!lastResults) return;

  const { amount, years, risk, investable, avoidList } = lastResults;

  const btn  = document.getElementById("aiRecBtn");
  const prog = document.getElementById("aiRecProg");
  const ph   = document.getElementById("aiRecPh");
  const resp = document.getElementById("aiRecResp");

  // Loading state
  btn.disabled        = true;
  btn.textContent     = "⏳ Analyzing...";
  prog.style.display  = "block";
  ph.style.display    = "none";
  resp.style.display  = "block";
  resp.textContent    = "";

  // Build context strings
  const top5         = investable.slice(0, 5);
  const riskLabel    = { low: "conservative", medium: "balanced", high: "aggressive" }[risk];
  const top5Summary  = top5
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

  const prompt = `You are VERDANT, an expert green investment advisor specialising in S&P 500 ESG analysis. \
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
How to split $${amount.toLocaleString()} across 2–4 of the top stocks. Give specific dollar amounts and rationale.

ENVIRONMENTAL IMPACT
What choosing these stocks means for their environmental footprint vs. investing in XOM/CVX instead.

KEY RISKS TO WATCH
2–3 specific risks: market, regulatory, and ESG-washing considerations.

FINAL VERDICT
A crisp, confident recommendation they can act on today.

End with exactly: "This is for educational purposes only and does not constitute financial advice."`;

  try {
    const res = await fetch(CONFIG.apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model:      CONFIG.model,
        max_tokens: CONFIG.maxTokens,
        messages:   [{ role: "user", content: prompt }]
      })
    });

    const data = await res.json();

    if (data.error) {
      throw new Error(data.error.message || "API error");
    }

    const text = (data.content?.[0]?.text || "Analysis unavailable.").replace(/\*/g, "");

    renderAIResponse(text, resp);
    btn.disabled       = false;
    btn.textContent    = "🔄 Refresh Advice";
    prog.style.display = "none";

  } catch (err) {
    resp.textContent =
      `⚠️ Could not connect to the AI engine.\n\n` +
      `Make sure you started the server with:\n` +
      `  ANTHROPIC_API_KEY=sk-ant-... node server.js\n\n` +
      `Then open http://localhost:3000 (not VS Code Live Server).\n\n` +
      `Error: ${err.message}`;
    btn.disabled       = false;
    btn.textContent    = "🌿 Retry";
    prog.style.display = "none";
  }
}

// ── AI RESPONSE RENDERER ───────────────────────────────────────

function renderAIResponse(text, container) {
  const SECTIONS = [
    { key: "YOUR INVESTMENT PROFILE", icon: "💼", accent: "var(--cyan)"   },
    { key: "TOP RECOMMENDATION",      icon: "🏆", accent: "var(--green)"  },
    { key: "SUGGESTED ALLOCATION",    icon: "📊", accent: "var(--green)"  },
    { key: "ENVIRONMENTAL IMPACT",    icon: "🌍", accent: "var(--green2)" },
    { key: "KEY RISKS TO WATCH",      icon: "⚠️", accent: "var(--amber)"  },
    { key: "FINAL VERDICT",           icon: "✅", accent: "var(--cyan)"   },
  ];

  // Split text into labelled sections
  const lines = text.split("\n");
  const sections = [];
  let current = null;

  for (const line of lines) {
    const upper = line.trim().toUpperCase();
    const def   = SECTIONS.find(s => upper.includes(s.key));
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

  sections.forEach((sec, i) => {
    const body = sec.lines.join("\n").trim();
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
    bodyEl.textContent = body;

    card.appendChild(head);
    card.appendChild(bodyEl);
    container.appendChild(card);
  });

  // Disclaimer line
  const disc = text.split("\n").find(l => l.includes("educational purposes"));
  if (disc) {
    const el = document.createElement("div");
    el.className = "ai-disclaimer";
    el.textContent = disc.trim();
    container.appendChild(el);
  }
}
