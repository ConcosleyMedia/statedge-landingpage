"use client"

import { useEffect, useMemo, useState } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  Legend,
} from "recharts"
import { ArrowRight, Shield, Activity, Cpu, BarChart3 } from "lucide-react"

// --- Fake sample data for the regression visual ---
const sampleData = Array.from({ length: 30 }).map((_, i) => {
  const x = i + 1
  const noise = (Math.random() - 0.5) * 6
  const y = 2.4 * x + 15 + noise // y = 2.4x + 15
  return { x, y: Number(y.toFixed(1)) }
})

// --- Simple stat chip ---
const StatChip = ({ label }: { label: string }) => (
  <span className="inline-flex items-center gap-2 rounded-full bg-white/5 ring-1 ring-white/10 px-3 py-1 text-sm text-white/80 hover:bg-white/10 transition">
    <Cpu className="w-4 h-4" /> {label}
  </span>
)

// === 90+ Data Points Matrix (heatmap style) ===
function FeatureMatrix({ rows = 10, cols = 10, count = 96 }: { rows?: number; cols?: number; count?: number }) {
  // deterministic-ish values per render for a clean heatmap look
  const values = useMemo(
    () =>
      Array.from({ length: rows * cols }).map((_, i) => {
        const r = Math.sin(i * 12.9898) * 43758.5453
        return r - Math.floor(r) // 0..1
      }),
    [rows, cols],
  )

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm text-white/80">90+ Features Visualized</span>
        <span className="text-xs text-white/60">Intensity = model weight</span>
      </div>
      <div
        className="grid gap-[3px] rounded-xl p-2 ring-1 ring-white/10 bg-white/5"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        aria-label="Feature importance heatmap"
      >
        {values.slice(0, count).map((v, idx) => {
          const light = 18 + Math.round(v * 62) // 18..80
          return (
            <div
              key={idx}
              title={`Feature ${idx + 1} — weight ${(v * 1).toFixed(2)}`}
              className="aspect-square rounded-[6px] hover:ring-2 hover:ring-white/20 transition"
              style={{
                background: `hsl(${195 + v * 30} 70% ${light}%)`,
              }}
            />
          )
        })}
      </div>
      <div className="mt-2 text-[11px] text-white/60">
        Example visualization. Real importance scores shown inside StatEdge.
      </div>
    </div>
  )
}

// === Statistical Noise Pattern (animated field) ===
function NoiseField({ points = 140 }: { points?: number }) {
  const [cloud, setCloud] = useState(
    () =>
      Array.from({ length: points }).map(() => ({
        x: Math.random(),
        y: Math.random(),
      })), // 0..1 normalized space
  )

  useEffect(() => {
    const id = setInterval(() => {
      setCloud((prev) =>
        prev.map((p) => {
          let nx = p.x + (Math.random() - 0.5) * 0.02
          let ny = p.y + (Math.random() - 0.5) * 0.02
          nx = Math.max(0, Math.min(1, nx))
          ny = Math.max(0, Math.min(1, ny))
          return { x: nx, y: ny }
        }),
      )
    }, 650)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm text-white/80">Statistical Noise Pattern</span>
        <span className="text-xs text-white/60">Simulated residual variance</span>
      </div>
      <div className="rounded-xl ring-1 ring-white/10 bg-black/60 p-2">
        <svg viewBox="0 0 100 60" className="w-full h-32" style={{ minHeight: "128px" }}>
          <defs>
            <radialGradient id="noiseGradient" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="rgba(56,189,248,0.9)" />
              <stop offset="100%" stopColor="rgba(99,102,241,0.2)" />
            </radialGradient>
          </defs>
          <rect x="0" y="0" width="100" height="60" fill="#0b0f16" />
          {cloud.map((p, i) => (
            <circle key={i} cx={p.x * 100} cy={p.y * 60} r={1.2} fill="url(#noiseGradient)" opacity={0.8} />
          ))}
        </svg>
      </div>
      <div className="mt-2 text-[11px] text-white/60">Animated scatter mimicking stochastic noise around the fit.</div>
    </div>
  )
}

export default function StatEdgeLanding() {
  return (
    <div className="min-h-screen bg-[#0b0f16] text-white">
      {/* Gradient background accents */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-cyan-600/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[28rem] w-[28rem] rounded-full bg-indigo-700/20 blur-3xl" />
      </div>

      {/* NAV / BRAND */}
      <header className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 grid place-items-center shadow-lg shadow-cyan-500/20">
            <BarChart3 className="w-5 h-5" />
          </div>
          <span className="font-semibold tracking-tight text-lg">StatEdge</span>
        </div>
        <a href="#tiers" className="group inline-flex items-center gap-2 text-sm text-white/80 hover:text-white">
          View Plans <ArrowRight className="w-4 h-4 transition -translate-x-0 group-hover:translate-x-0.5" />
        </a>
      </header>

      {/* HERO */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 pb-10">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-tight">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                StatEdge
              </span>
            </h1>
            <p className="mt-4 text-white/80 text-base sm:text-lg max-w-xl">
              Vegas-level quantitative analysis, distilled into daily picks. We process{" "}
              <span className="font-semibold text-white">90+ features</span> per matchup with rigorous regression and
              model selection—so you can bet with a real statistical edge.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <StatChip label="90+ data points per game" />
              <StatChip label="OLS + regularized models" />
              <StatChip label="Backtests & drift checks" />
            </div>

            {/* LEFT-SIDE FILLERS */}
            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4 hover:bg-white/10 transition">
                <FeatureMatrix />
              </div>
              <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4 hover:bg-white/10 transition">
                <NoiseField />
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <a
                href="https://whop.com/experiences/exp_0BlnluOzcChVAc"
                className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-5 py-3 text-sm font-medium shadow-lg shadow-cyan-500/25 hover:opacity-95"
              >
                See the Free Pick{" "}
                <ArrowRight className="w-4 h-4 transition -translate-x-0 group-hover:translate-x-0.5" />
              </a>
              <a
                href="#how"
                className="inline-flex items-center justify-center gap-2 rounded-2xl ring-1 ring-white/15 px-5 py-3 text-sm font-medium text-white/90 hover:bg-white/5"
              >
                How It Works
              </a>
            </div>

            <p className="mt-4 text-xs text-white/60 flex items-center gap-2">
              <Shield className="w-4 h-4" /> 21+ only. Bet responsibly. Gambling problem? Call 1-800-GAMBLER.
            </p>
          </div>

          {/* MODEL PANEL */}
          <div className="rounded-3xl ring-1 ring-white/10 bg-white/5 backdrop-blur-sm p-4 sm:p-6 lg:p-8 shadow-2xl hover:shadow-cyan-500/10 transition group">
            <div className="grid gap-6">
              {/* Terminal-like OLS output */}
              <div className="rounded-xl bg-black/60 ring-1 ring-white/10 p-4 font-mono text-xs leading-relaxed overflow-hidden">
                <div className="text-white/70">$ python model.py —run ols</div>
                <pre className="mt-2 text-white/90 whitespace-pre-wrap">
                  {`===================== OLS Regression Results =====================
Dep. Variable:    PLAYER_OUTCOME       R-squared: 0.71
Model:                       OLS       Adj. R-squared: 0.68
Method:            Least Squares       No. Observations: 2,430
Date:                ${new Date().toISOString().slice(0, 10)}       Df Residuals: 2,339
===================================================================
coef      std err      t      P>|t|      [0.025      0.975]
-------------------------------------------------------------------
Intercept         15.0143     0.842   17.84   0.000     13.36     16.67
x(RecentForm)      2.4012     0.118   20.36   0.000      2.17      2.64
x(PitcherHand)    -1.0349     0.207   -4.99   0.000     -1.44     -0.62
x(Weather)         0.2136     0.054    3.96   0.000      0.11      0.32
x(BBRate)          0.4811     0.091    5.28   0.000      0.30      0.66
x(Barrel%)         0.3524     0.062    5.68   0.000      0.23      0.47
===================================================================
Notes: Standard errors are heteroskedasticity-robust (HC3).`}
                </pre>
              </div>

              {/* Scatter + regression line */}
              <div className="rounded-xl bg-white/5 ring-1 ring-white/10 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-300" />
                    <span className="text-sm text-white/80">Model Fit (example)</span>
                  </div>
                  <span className="text-xs text-white/60">y = 2.4x + 15</span>
                </div>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                      <XAxis
                        dataKey="x"
                        tick={{ fill: "#9ca3af", fontSize: 12 }}
                        axisLine={{ stroke: "#374151" }}
                        tickLine={{ stroke: "#374151" }}
                      />
                      <YAxis
                        dataKey="y"
                        tick={{ fill: "#9ca3af", fontSize: 12 }}
                        axisLine={{ stroke: "#374151" }}
                        tickLine={{ stroke: "#374151" }}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "#111827",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: 12,
                          color: "#e5e7eb",
                        }}
                      />
                      <Legend wrapperStyle={{ color: "#e5e7eb" }} />
                      <Scatter name="Observed" data={sampleData} fill="currentColor" className="text-cyan-400" />
                      <LineChart data={sampleData.map((d) => ({ x: d.x, y: 2.4 * d.x + 15 }))}>
                        <Line type="monotone" dataKey="y" dot={false} strokeWidth={2} className="text-indigo-400" />
                      </LineChart>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">How StatEdge Works</h2>
        <p className="mt-2 text-white/70 max-w-2xl">
          Simple on the surface. Under the hood, it’s MIT‑level ops: signal extraction, model validation, and risk
          filters.
        </p>
        <div className="mt-6 grid md:grid-cols-3 gap-4">
          {[
            {
              title: "Ingest",
              desc: "We pull 90+ features: player form, matchup context, weather, park factors, odds movement, and more.",
            },
            {
              title: "Model",
              desc: "OLS + regularized regressions with robust errors, cross‑validation, and drift checks on each update.",
            },
            {
              title: "Filter",
              desc: "We score every edge. Only high‑probability plays pass our release threshold to protect your bankroll.",
            },
          ].map((b, i) => (
            <div
              key={i}
              className="group rounded-2xl ring-1 ring-white/10 bg-white/5 p-5 hover:bg-white/10 transition shadow hover:shadow-cyan-500/10"
            >
              <div className="text-sm text-white/60">0{i + 1}</div>
              <div className="mt-1 font-semibold">{b.title}</div>
              <p className="mt-2 text-sm text-white/80">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TIERS */}
      <section id="tiers" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">Membership</h2>
        <p className="mt-2 text-white/70 max-w-2xl">
          Access scales with model confidence. More predictable slates → more picks released.
        </p>

        <div className="mt-6 grid md:grid-cols-3 gap-4">
          {/* Free */}
          <div className="rounded-2xl ring-1 ring-white/10 bg-white/5 p-6 flex flex-col hover:bg-white/10 transition">
            <div className="text-xs uppercase tracking-wide text-white/60">Starter</div>
            <div className="mt-1 text-lg font-semibold">StatEdge Free</div>
            <ul className="mt-3 space-y-2 text-sm text-white/80 list-disc list-inside">
              <li>
                One <span className="font-medium">free pick</span> daily
              </li>
              <li>Basic model notes</li>
              <li>Bankroll guidelines</li>
            </ul>
            <a
              href="https://whop.com/experiences/exp_0BlnluOzcChVAc"
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 ring-1 ring-white/15 px-4 py-2 text-sm"
            >
              See the Free Pick
            </a>
          </div>

          {/* Plus */}
          <div className="rounded-2xl ring-2 ring-cyan-500/50 bg-gradient-to-b from-white/10 to-white/[0.03] p-6 flex flex-col shadow-lg shadow-cyan-500/10">
            <div className="text-xs uppercase tracking-wide text-cyan-300">Most Popular</div>
            <div className="mt-1 text-lg font-semibold">StatEdge Plus</div>
            <ul className="mt-3 space-y-2 text-sm text-white/80 list-disc list-inside">
              <li>
                <span className="font-medium">3–5 expert picks/day</span> (gated by Predictability Score)
              </li>
              <li>Full model rationale</li>
              <li>Unit sizing suggestions</li>
              <li>Historical performance dashboards</li>
            </ul>
            <a
              href="https://whop.com/win-now/statedge/"
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-4 py-2 text-sm font-medium shadow-lg shadow-cyan-500/25 hover:opacity-95"
            >
              Upgrade to Plus
            </a>
          </div>

          {/* Premium Pick */}
          <div className="rounded-2xl ring-1 ring-white/10 bg-white/5 p-6 flex flex-col hover:bg-white/10 transition">
            <div className="text-xs uppercase tracking-wide text-white/60">High Conviction</div>
            <div className="mt-1 text-lg font-semibold">Daily Premium Pick</div>
            <ul className="mt-3 space-y-2 text-sm text-white/80 list-disc list-inside">
              <li>
                Highest <span className="font-medium">statistical edge</span> of the slate
              </li>
              <li>Clear risk rationale</li>
              <li>Posted once per day</li>
            </ul>
            <a
              href="https://whop.com/experiences/exp_tqUVHEr2J7Cp5C"
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 ring-1 ring-white/15 px-4 py-2 text-sm"
            >
              See Today's Premium
            </a>
          </div>
        </div>
      </section>

      {/* PROOF / TRUST */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-3xl ring-1 ring-white/10 bg-white/5 p-6 grid lg:grid-cols-2 gap-6 items-center">
          <div>
            <h3 className="text-lg font-semibold">Transparent Process</h3>
            <p className="mt-2 text-sm text-white/80">
              Every pick ships with a short model note: key drivers, expected value, and what could break the play.
              You’ll see the math—not hype.
            </p>
            <ul className="mt-3 space-y-2 text-sm text-white/80 list-disc list-inside">
              <li>Feature importance snapshots</li>
              <li>Edge vs. market lines</li>
              <li>Post‑game review and drift monitoring</li>
            </ul>
          </div>
          <div className="rounded-xl bg-black/60 ring-1 ring-white/10 p-4 font-mono text-xs overflow-x-auto">
            <div className="text-white/70">$ stata -q: regress player_outcome x1 x2 x3 ... x90</div>
            <pre className="mt-2 text-white/90 whitespace-pre-wrap">
              {`Source |       SS           df       MS      Number of obs   =     2,430
-------+----------------------------------   F(90, 2339)      =     19.82
 Model |  128935.72         90  1432.62      Prob > F          =    0.0000
Residual |   52011.36      2339   22.23      R-squared         =    0.7127
-------+----------------------------------   Adj R-squared     =    0.6842
 Total |  180947.08      2429   74.50        Root MSE          =    4.717
`}
            </pre>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 text-xs text-white/60">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>© {new Date().getFullYear()} StatEdge. All rights reserved.</div>
          <div className="flex flex-wrap gap-3">
            <a href="#terms" className="hover:text-white">
              Terms
            </a>
            <a href="#privacy" className="hover:text-white">
              Privacy
            </a>
            <a href="#responsible" className="hover:text-white">
              Responsible Gaming
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
