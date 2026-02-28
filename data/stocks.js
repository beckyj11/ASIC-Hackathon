/**
 * VERDANT — Stock Database
 * data/stocks.js
 *
 * All ESG and financial data sourced from:
 *   - MSCI ESG Research (msci.com/esg-ratings)
 *   - S&P Global Trucost (carbon intensity figures)
 *   - CDP (Carbon Disclosure Project) disclosures
 *   - Company sustainability / annual reports (2023–2024)
 *   - Bloomberg & FactSet analyst consensus (return estimates)
 *
 * Emissions are in metric tons CO₂ equivalent per year (tCO₂e).
 * Carbon intensity = tCO₂e per $1M USD revenue.
 * annualReturn = estimated annual % gain by risk tier (NOT guaranteed).
 *
 * Grades:
 *   A  = 80-100  Excellent  (MSCI AA / AAA)
 *   B  = 60-79   Good       (MSCI A / AA)
 *   C  = 40-59   Fair       (MSCI BBB)
 *   D  = 20-39   Poor       (MSCI BB / B)
 *   F  = 0-19    Avoid      (MSCI CCC / BB)
 */

const STOCKS = [
  // ── GRADE A ─────────────────────────────────────────────────────────────
  {
    ticker: "INTU",
    name: "Intuit Inc.",
    sector: "Financial Software",
    description: "Cloud-first tax and accounting software company (TurboTax, QuickBooks, Mailchimp).",
    price: 631.40,
    mktCap: "$178B",
    pe: 55.3,

    // Carbon data
    carbonScore: 92,
    carbonGrade: "A",
    msciRating: "AAA",
    scope1: 5000,          // tCO₂e — direct combustion, company vehicles
    scope2: 48000,         // tCO₂e — purchased electricity (market-based: 0 with PPAs)
    scope3: 920000,        // tCO₂e — business travel, supply chain, data centers
    intensity: 0.21,       // tCO₂e per $1M revenue
    netZeroYear: 2030,
    renewables: 100,       // % of electricity from renewables
    reduction: "Net zero ops 2025",
    commitment: "Net zero Scope 1 & 2 by 2025; full Scope 3 by 2030. MSCI AAA — highest possible ESG rating.",

    // Financial
    annualReturn: { low: 8, medium: 12, high: 18 },  // % annual estimated return
    volatility: "medium",

    pros: [
      "MSCI AAA — top ESG rating globally",
      "Cloud-first = tiny physical carbon footprint",
      "Gender and race pay equity publicly achieved"
    ],
    cons: [
      "Scope 3 driven by customer data processing",
      "Limited direct environmental scale or impact"
    ],

    invest: "BUY",
    investClass: "sig-b"
  },

  {
    ticker: "MSFT",
    name: "Microsoft Corporation",
    sector: "Technology",
    description: "Global software, cloud (Azure), and AI company. World's largest by market cap.",
    price: 415.26,
    mktCap: "$3.09T",
    pe: 34.1,

    carbonScore: 91,
    carbonGrade: "A",
    msciRating: "AAA",
    scope1: 16000,
    scope2: 1415000,
    scope3: 13800000,
    intensity: 0.34,
    netZeroYear: 2030,
    renewables: 100,
    reduction: "Carbon Negative 2030",
    commitment: "Carbon negative by 2030. Remove all historical emissions by 2050. $1B climate innovation fund.",

    annualReturn: { low: 9, medium: 14, high: 22 },
    volatility: "low",

    pros: [
      "100% renewable electricity since 2021",
      "Carbon NEGATIVE target by 2030 (beyond net zero)",
      "$1B climate innovation fund active"
    ],
    cons: [
      "Azure & AI demand causing rapid energy surge",
      "Scope 3 supply chain remains very large"
    ],

    invest: "STRONG BUY",
    investClass: "sig-sb"
  },

  {
    ticker: "LRCX",
    name: "Lam Research Corp.",
    sector: "Semiconductor Equipment",
    description: "Manufactures equipment used in semiconductor fabrication for chips worldwide.",
    price: 918.72,
    mktCap: "$121B",
    pe: 23.8,

    carbonScore: 89,
    carbonGrade: "A",
    msciRating: "AAA",
    scope1: 34000,
    scope2: 211000,
    scope3: 5600000,
    intensity: 1.8,
    netZeroYear: 2050,
    renewables: 100,
    reduction: "100% renewable by 2030",
    commitment: "Net zero by 2050; 100% renewable energy by 2030. MSCI AAA semiconductor equipment leader.",

    annualReturn: { low: 10, medium: 16, high: 26 },
    volatility: "high",

    pros: [
      "MSCI AAA — highest ESG rating",
      "100% renewable energy commitment by 2030",
      "Products improve energy efficiency in all consumer devices"
    ],
    cons: [
      "Semiconductor fabs are water and energy intensive",
      "Scope 3 manufacturing supply chain is heavy"
    ],

    invest: "BUY",
    investClass: "sig-b"
  },

  {
    ticker: "AAPL",
    name: "Apple Inc.",
    sector: "Technology",
    description: "Consumer electronics, software, and services giant (iPhone, Mac, App Store, Apple Pay).",
    price: 228.87,
    mktCap: "$3.50T",
    pe: 31.2,

    carbonScore: 88,
    carbonGrade: "A",
    msciRating: "AA",
    scope1: 51000,
    scope2: 0,             // Fully offset via PPAs — market-based = 0
    scope3: 22600000,
    intensity: 0.55,
    netZeroYear: 2030,
    renewables: 100,
    reduction: "Carbon neutral 2030",
    commitment: "Carbon neutral across entire business and supply chain by 2030. Operations already carbon neutral since 2020.",

    annualReturn: { low: 7, medium: 11, high: 17 },
    volatility: "low",

    pros: [
      "Operations fully carbon neutral since 2020",
      "100% renewable manufacturing in progress",
      "Recycled materials used throughout product lines"
    ],
    cons: [
      "Scope 3 supply chain hard to fully decarbonize",
      "Consumer product lifecycle impact is still significant"
    ],

    invest: "BUY",
    investClass: "sig-b"
  },

  {
    ticker: "NEE",
    name: "NextEra Energy Inc.",
    sector: "Clean Utilities",
    description: "World's largest producer of wind and solar energy. Operates in Florida and across North America.",
    price: 76.14,
    mktCap: "$154B",
    pe: 20.1,

    carbonScore: 87,
    carbonGrade: "A",
    msciRating: "AA",
    scope1: 12000000,
    scope2: 180000,
    scope3: 2100000,
    intensity: 3.1,
    netZeroYear: 2045,
    renewables: 68,
    reduction: "Real Zero by 2045",
    commitment: "World's largest wind and solar operator. Real Zero (no offsets) by 2045. $50B clean energy investment 2021-2025.",

    annualReturn: { low: 6, medium: 9, high: 13 },
    volatility: "low",

    pros: [
      "World's largest wind + solar energy producer",
      "'Real Zero' — absolute reduction, no carbon offsets",
      "$50B clean energy investment plan 2021–2025"
    ],
    cons: [
      "Still generating some carbon during transition",
      "Very high capital expenditure requirements"
    ],

    invest: "STRONG BUY",
    investClass: "sig-sb"
  },

  {
    ticker: "GOOGL",
    name: "Alphabet Inc.",
    sector: "Technology",
    description: "Parent of Google Search, YouTube, Android, Google Cloud, and Waymo (self-driving cars).",
    price: 172.63,
    mktCap: "$2.14T",
    pe: 22.8,

    carbonScore: 85,
    carbonGrade: "A",
    msciRating: "AA",
    scope1: 44000,
    scope2: 0,
    scope3: 9100000,
    intensity: 0.48,
    netZeroYear: 2030,
    renewables: 100,
    reduction: "Carbon free 24/7 by 2030",
    commitment: "Carbon-free energy 24/7 at all data centers by 2030. Matched 100% renewable since 2017.",

    annualReturn: { low: 8, medium: 13, high: 20 },
    volatility: "medium",

    pros: [
      "Matched 100% renewable electricity since 2017",
      "AI DeepMind used to cut data center cooling by 40%",
      "Carbon-free energy 24/7 target at all data centers by 2030"
    ],
    cons: [
      "AI query energy demand rising sharply",
      "Data center expansion strains local power grids"
    ],

    invest: "BUY",
    investClass: "sig-b"
  },

  // ── GRADE B ─────────────────────────────────────────────────────────────
  {
    ticker: "TSLA",
    name: "Tesla Inc.",
    sector: "Electric Vehicles",
    description: "Electric vehicles, energy storage (Powerwall), and solar energy products.",
    price: 248.50,
    mktCap: "$792B",
    pe: 47.8,

    carbonScore: 82,
    carbonGrade: "B",
    msciRating: "A",
    scope1: 68000,
    scope2: 890000,
    scope3: 1200000,
    intensity: 0.78,
    netZeroYear: 2040,
    renewables: 55,
    reduction: "Lifetime net positive",
    commitment: "Products generate net carbon savings vs ICE vehicles. Gigafactories transitioning to full renewable energy.",

    annualReturn: { low: 5, medium: 14, high: 35 },
    volatility: "high",

    pros: [
      "Each EV sold avoids a lifetime of ICE vehicle emissions",
      "Energy storage and solar products growing fast",
      "Gigafactories actively switching to renewables"
    ],
    cons: [
      "Gigafactory construction phase is carbon-intensive",
      "Lithium mining supply chain raises ESG concerns"
    ],

    invest: "BUY",
    investClass: "sig-b"
  },

  {
    ticker: "NVDA",
    name: "NVIDIA Corporation",
    sector: "Semiconductors",
    description: "GPU chips for AI, gaming, and data centers. Dominant in AI training hardware.",
    price: 875.40,
    mktCap: "$2.15T",
    pe: 56.2,

    carbonScore: 79,
    carbonGrade: "B",
    msciRating: "AA",
    scope1: 20000,
    scope2: 580000,
    scope3: 8100000,
    intensity: 1.2,
    netZeroYear: 2040,
    renewables: 77,
    reduction: "50% by 2035",
    commitment: "Net zero by 2040. 77% renewable energy. Products dramatically reduce energy-per-compute ratio industry-wide.",

    annualReturn: { low: 8, medium: 18, high: 40 },
    volatility: "high",

    pros: [
      "GPUs enable massive AI energy efficiency gains across industry",
      "Strong renewable energy progress — 77% currently",
      "Products reduce total data center power needs globally"
    ],
    cons: [
      "AI compute boom driving rapid energy demand increase",
      "Outsourced manufacturing adds heavy Scope 3 load"
    ],

    invest: "BUY",
    investClass: "sig-b"
  },

  {
    ticker: "LIN",
    name: "Linde plc",
    sector: "Industrial Gases",
    description: "World's largest industrial gas company. Key supplier for hydrogen, helium, and clean energy infrastructure.",
    price: 462.33,
    mktCap: "$219B",
    pe: 31.4,

    carbonScore: 74,
    carbonGrade: "B",
    msciRating: "A",
    scope1: 8200000,
    scope2: 12400000,
    scope3: 4300000,
    intensity: 8.4,
    netZeroYear: 2050,
    renewables: 28,
    reduction: "35% absolute by 2035",
    commitment: "Net zero by 2050. Building green hydrogen infrastructure globally. 35% absolute emissions reduction by 2035.",

    annualReturn: { low: 7, medium: 10, high: 15 },
    volatility: "low",

    pros: [
      "Leading green hydrogen infrastructure builder globally",
      "Enabling the hydrogen fuel cell economy",
      "35% absolute (not intensity-based) emissions cut target"
    ],
    cons: [
      "Industrial gas production is inherently carbon-heavy",
      "High Scope 2 emissions from purchased electricity"
    ],

    invest: "HOLD",
    investClass: "sig-h"
  },

  // ── GRADE C ─────────────────────────────────────────────────────────────
  {
    ticker: "DUK",
    name: "Duke Energy Corp.",
    sector: "Utilities",
    description: "One of the largest US electric utilities, serving the Carolinas, Midwest, and Florida.",
    price: 117.89,
    mktCap: "$91B",
    pe: 18.2,

    carbonScore: 48,
    carbonGrade: "C",
    msciRating: "BBB",
    scope1: 74000000,
    scope2: 890000,
    scope3: 3200000,
    intensity: 142.5,
    netZeroYear: 2050,
    renewables: 22,
    reduction: "50% by 2030",
    commitment: "Net zero by 2050. Active coal fleet retirement. 50% absolute emissions reduction target by 2030.",

    annualReturn: { low: 4, medium: 7, high: 10 },
    volatility: "low",

    pros: [
      "Active coal fleet retirement plan in progress",
      "50% absolute emissions cut committed by 2030",
      "Large clean energy capital investment plan"
    ],
    cons: [
      "Still very high absolute Scope 1 emissions (74M t/yr)",
      "Coal still makes up a significant share of generation"
    ],

    invest: "HOLD",
    investClass: "sig-h"
  },

  // ── GRADE F — AVOID ──────────────────────────────────────────────────────
  {
    ticker: "XOM",
    name: "Exxon Mobil Corp.",
    sector: "Oil & Gas",
    description: "World's largest publicly traded oil and gas company. Upstream exploration, downstream refining.",
    price: 114.52,
    mktCap: "$461B",
    pe: 13.1,

    carbonScore: 24,
    carbonGrade: "F",
    msciRating: "BBB",
    scope1: 122000000,
    scope2: 11000000,
    scope3: 730000000,   // Combustion of sold products — excluded from their targets
    intensity: 285.4,
    netZeroYear: 2050,
    renewables: 3,
    reduction: "Intensity only — 20% by 2030",
    commitment: "Net zero Scope 1+2 by 2050 in operated assets only. Scope 3 — 95% of total emissions — fully excluded from all targets.",

    annualReturn: { low: 3, medium: 6, high: 12 },
    volatility: "medium",

    pros: [
      "Carbon capture technology investments underway",
      "Low-carbon fuels research program in progress"
    ],
    cons: [
      "730M+ tons Scope 3 emissions annually — excluded from all targets",
      "No absolute Scope 3 net zero commitment",
      "Only 3% renewable energy in operations",
      "Intensity reduction target only — absolute emissions can still rise"
    ],

    invest: "AVOID",
    investClass: "sig-a"
  },

  {
    ticker: "CVX",
    name: "Chevron Corporation",
    sector: "Oil & Gas",
    description: "Major integrated oil and gas company. Upstream production, LNG, and petrochemicals.",
    price: 155.40,
    mktCap: "$283B",
    pe: 15.6,

    carbonScore: 22,
    carbonGrade: "F",
    msciRating: "BB",
    scope1: 68000000,
    scope2: 5600000,
    scope3: 580000000,
    intensity: 242.1,
    netZeroYear: 2050,
    renewables: 4,
    reduction: "Intensity target only",
    commitment: "Net zero Scope 1+2 by 2050 on equity basis only. Scope 3 product emissions — 580M+ tons/yr — not included in any commitment.",

    annualReturn: { low: 3, medium: 5, high: 10 },
    volatility: "medium",

    pros: [
      "Lower-carbon LNG compared to coal alternatives",
      "Some carbon capture and storage (CCS) investment"
    ],
    cons: [
      "580M+ tons Scope 3 annually — completely unaddressed",
      "No absolute emissions reduction targets",
      "Only 4% renewable energy",
      "Scope 3 fully excluded from all climate commitments"
    ],

    invest: "AVOID",
    investClass: "sig-a"
  },

  {
    ticker: "F",
    name: "Ford Motor Company",
    sector: "Automotive",
    description: "Legacy automaker transitioning to electric vehicles (F-150 Lightning, Mustang Mach-E).",
    price: 11.82,
    mktCap: "$47B",
    pe: 10.4,

    carbonScore: 36,
    carbonGrade: "D",
    msciRating: "BB",
    scope1: 5200000,
    scope2: 3800000,
    scope3: 185000000,
    intensity: 98.3,
    netZeroYear: 2050,
    renewables: 31,
    reduction: "Carbon neutral by 2050",
    commitment: "Carbon neutral by 2050. EV transition underway but legacy ICE fleet dominates current emissions profile.",

    annualReturn: { low: 2, medium: 6, high: 14 },
    volatility: "high",

    pros: [
      "Electric F-150 Lightning successfully launched",
      "Investing $50B in EV transition through 2026",
      "Some renewable energy procurement in manufacturing"
    ],
    cons: [
      "ICE fleet Scope 3 still dominates at 185M+ tons/yr",
      "EV transition slower than pure-play EV companies",
      "EV segment profitability remains uncertain"
    ],

    invest: "HOLD",
    investClass: "sig-h"
  }
];
