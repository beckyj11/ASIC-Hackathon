/**
 * VERDANT — UI Utilities
 * js/ui.js
 *
 * Handles:
 *  - Floating leaf particle animation
 *  - Live price simulation (updates every 3s)
 *  - DOM-ready initialisation
 */

// ── PARTICLES ─────────────────────────────────────────────────

/**
 * Inject animated leaf particles into the .particles container.
 * Each particle's speed, size, and starting position are randomised
 * via CSS custom properties so the effect varies naturally.
 */
function spawnParticles() {
  const container = document.getElementById("particles");
  if (!container) return;

  for (let i = 0; i < 18; i++) {
    const p = document.createElement("div");
    p.className = "p";
    const size = (Math.random() * 4 + 2).toFixed(1) + "px";
    const dur = (Math.random() * 14 + 10).toFixed(1) + "s";
    const delay = (Math.random() * 12).toFixed(1) + "s";
    const xPos = (Math.random() * 100).toFixed(1) + "%";

    p.style.cssText = `--s:${size};--d:${dur};--dl:${delay};--x:${xPos};`;
    container.appendChild(p);
  }
}

// ── LIVE PRICE SIMULATION ────────────────────────────────────

/**
 * Simulate small random price movements for all stocks.
 * In a real app you'd replace this with a WebSocket or REST
 * call to a market data provider (e.g. Alpaca, Polygon, Yahoo Finance).
 *
 * Movement is intentionally tiny (±0.06% per tick) to mimic
 * realistic intraday fluctuation without wild swings.
 */
function simulatePrices() {
  STOCKS.forEach((s) => {
    const delta = s.price * (Math.random() - 0.497) * 0.0006;
    s.price = Math.max(0.01, s.price + delta);
  });
}

// ── LIVE CLOCK ────────────────────────────────────────────────

function startLiveClock() {
  const timeEl = document.getElementById("currentTime");
  const loadedEl = document.getElementById("lastLoadedTime");

  if (!timeEl || !loadedEl) return;

  // Set loaded time once
  const now = new Date();
  loadedEl.textContent = now.toLocaleTimeString();

  // Update current time every second
  function tick() {
    timeEl.textContent = new Date().toLocaleTimeString();
  }
  tick(); // Initial call
  setInterval(tick, 1000);
}

// ── INIT ──────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  spawnParticles();
  startLiveClock(); // Start the header clock

  // Simulate live prices every 3 seconds
  setInterval(simulatePrices, 3000);
});
