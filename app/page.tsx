"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence, useInView } from "framer-motion"
import { useSession } from "next-auth/react"

/* ─── Hooks ─────────────────────────── */

function useScrolled(threshold = 60) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > threshold)
    window.addEventListener("scroll", fn, { passive: true })
    return () => window.removeEventListener("scroll", fn)
  }, [threshold])
  return scrolled
}

function useCounter(target: number, decimals = 0) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })
  useEffect(() => {
    if (!inView) return
    const frames = 90
    let f = 0
    const id = setInterval(() => {
      f++
      const ease = 1 - Math.pow(1 - f / frames, 3)
      setCount(parseFloat((ease * target).toFixed(decimals)))
      if (f >= frames) clearInterval(id)
    }, 1000 / 60)
    return () => clearInterval(id)
  }, [inView, target, decimals])
  return { count, ref }
}

/* ─── Types & Data ───────────────────── */

type TabId = "nutrition" | "hydration" | "weight"
type ScreenId = "calories" | "water" | "weight"

const TABS: { id: TabId; label: string; emoji: string }[] = [
  { id: "nutrition",  label: "Nutrition",  emoji: "🥗" },
  { id: "hydration",  label: "Hydration",  emoji: "💧" },
  { id: "weight",     label: "Weight",     emoji: "⚖️" },
]

const FEATURE_CONTENT: Record<TabId, { headline: string; desc: string; bullets: string[]; screen: ScreenId }> = {
  nutrition: {
    headline: "Track every bite, effortlessly.",
    desc: "AI-powered food recognition scans your meal in seconds. Log calories, macros, and micronutrients without the manual grind.",
    bullets: ["Instant AI food scan", "Macro breakdown & goals", "500K+ food database", "Custom meal templates"],
    screen: "calories",
  },
  hydration: {
    headline: "Stay hydrated, stay sharp.",
    desc: "Smart reminders adapt to your activity level, weather, and goals. Your daily water intake, visualized beautifully.",
    bullets: ["Smart adaptive reminders", "Intake history & streaks", "Custom vessel sizes", "Hydration score"],
    screen: "water",
  },
  weight: {
    headline: "Watch the trends, not just the scale.",
    desc: "Smart weight tracking with trend analysis. See the bigger picture with moving averages and progress visualization.",
    bullets: ["Weight trend smoothing", "BMI tracking", "Progress photos", "Goal projections"],
    screen: "weight",
  },
}

const PRICING = [
  { name: "Free",  price: "0",  desc: "For casual trackers",     cta: "Get Started",    accent: false, badge: null,
    features: ["Basic calorie logging","7-day history","Water tracking","Manual weight entry","Mobile app"] },
  { name: "Pro",   price: "₹100",  desc: "For serious optimizers",  cta: "Start Pro Free", accent: true,  badge: "Most Popular",
    features: ["AI food scan","Unlimited history","Smart hydration reminders","Weight trend analysis","Weekly AI insights","Apple Health sync","Priority support"] },
]

const HOW_STEPS = [
  { num: "01", title: "Set your goals",   desc: "Tell CaloMind your targets — weight, calories, hydration. The AI calibrates your baseline in under 2 minutes.", screen: "calories" as ScreenId },
  { num: "02", title: "Log with one tap", desc: "Snap a photo, scan a barcode, or speak your meal. CaloMind handles the rest instantly.", screen: "water" as ScreenId },
  { num: "03", title: "Watch it click",   desc: "Weekly AI insights surface what's working. Adjust, iterate, and hit goals you didn't think were possible.", screen: "weight" as ScreenId },
]

/* ─── Phone Screens ──────────────────── */

function CalorieScreen() {
  const pts = [
    { name: "Oatmeal Bowl",   kcal: 320, time: "8:20"  },
    { name: "Greek Salad",    kcal: 420, time: "13:10" },
    { name: "Protein Shake",  kcal: 180, time: "16:30" },
  ]
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "Clash Display", fontSize: 11, fontWeight: 600 }}>Today</span>
        <span style={{ fontSize: 11, color: "#9CA3AF" }}>1,240 / 2,000 kcal</span>
      </div>
      {/* Ring */}
      <div style={{ display: "flex", justifyContent: "center", margin: "4px 0" }}>
        <div style={{ position: "relative", width: 68, height: 68 }}>
          <svg width="68" height="68" viewBox="0 0 68 68">
            <circle cx="34" cy="34" r="26" fill="none" stroke="#F3F4F6" strokeWidth="5" />
            <circle cx="34" cy="34" r="26" fill="none" stroke="#2563eb" strokeWidth="5"
              strokeDasharray={`${2 * Math.PI * 26 * 0.62} ${2 * Math.PI * 26}`}
              strokeLinecap="round" transform="rotate(-90 34 34)" />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>62%</span>
          </div>
        </div>
      </div>
      {/* Macros */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4 }}>
        {[["Carbs","142g","#2563eb"],["Protein","68g","#dc2626"],["Fat","38g","#818CF8"]].map(([l,v,c])=>(
          <div key={l} style={{ textAlign: "center", padding: "4px 2px", background: "rgba(0,0,0,0.03)", borderRadius: 8 }}>
            <div style={{ fontSize: 11, color: "#9CA3AF" }}>{l}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: c }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#4A5568", marginTop: 2 }}>Meals</div>
      {pts.map(p => (
        <div key={p.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 6px", background: "rgba(0,0,0,0.025)", borderRadius: 8 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 500 }}>{p.name}</div>
            <div style={{ fontSize: 11, color: "#9CA3AF" }}>{p.time}</div>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#2563eb" }}>{p.kcal}</span>
        </div>
      ))}
      <div style={{ marginTop: "auto", display: "flex", justifyContent: "center" }}>
        <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 300, color: "white", boxShadow: "0 4px 12px rgba(37,99,235,0.4)" }}>+</div>
      </div>
    </div>
  )
}

function WaterScreen() {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div style={{ fontFamily: "Clash Display", fontSize: 11, fontWeight: 600, alignSelf: "flex-start" }}>Hydration</div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: "Clash Display", fontSize: 24, fontWeight: 700 }}>1.8<span style={{ fontSize: 13, fontWeight: 400, color: "#9CA3AF" }}>L</span></div>
        <div style={{ fontSize: 11, color: "#9CA3AF" }}>of 2.5L goal</div>
      </div>
      {/* Glass */}
      <div style={{ position: "relative", width: 52, height: 72 }}>
        <div style={{ width: "100%", height: "100%", border: "2px solid rgba(99,179,237,0.45)", borderRadius: "3px 3px 10px 10px", overflow: "hidden", background: "rgba(235,248,255,0.3)", position: "relative" }}>
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "72%", background: "linear-gradient(180deg, rgba(99,179,237,0.4), rgba(49,130,206,0.65))", borderRadius: "2px 2px 8px 8px" }} />
          {[{l:8,b:16,s:5},{l:24,b:30,s:3},{l:38,b:12,s:4}].map((b,i)=>(
            <div key={i} style={{ position:"absolute", left:b.l, bottom:b.b, width:b.s, height:b.s, borderRadius:"50%", background:"rgba(255,255,255,0.5)" }} />
          ))}
        </div>
      </div>
      {/* Quick add */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4, width: "100%" }}>
        {["200ml","330ml","500ml"].map(a=>(
          <div key={a} style={{ textAlign:"center", padding:"4px 2px", background:"rgba(99,179,237,0.1)", borderRadius:8, border:"1px solid rgba(99,179,237,0.2)", fontSize:9, color:"#3182CE", fontWeight:500 }}>+{a}</div>
        ))}
      </div>
      {/* Log */}
      <div style={{ width:"100%", marginTop:2 }}>
        <div style={{ fontSize:9, fontWeight:600, color:"#4A5568", marginBottom:4 }}>Today</div>
        {[{t:"8:00",ml:350},{t:"11:30",ml:500},{t:"14:00",ml:250},{t:"17:45",ml:700}].map(l=>(
          <div key={l.t} style={{ display:"flex", justifyContent:"space-between", padding:"2px 0", borderBottom:"1px solid rgba(0,0,0,0.04)" }}>
            <span style={{ fontSize:8, color:"#9CA3AF" }}>{l.t}</span>
            <span style={{ fontSize:8, color:"#3182CE", fontWeight:500 }}>{l.ml}ml</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function WeightScreen() {
  const pts = [78.2,77.8,77.9,77.5,77.2,77.3,76.9,76.7,76.8,76.4,76.2,75.9]
  const mn = Math.min(...pts)-0.5, mx = Math.max(...pts)+0.5, rng = mx-mn
  const W=180, H=70
  const coords = pts.map((p,i)=>({ x:(i/(pts.length-1))*W, y:H-((p-mn)/rng)*H }))
  const lineD = coords.map((c,i)=>`${i===0?"M":"L"} ${c.x} ${c.y}`).join(" ")
  const areaD = `${lineD} L ${W} ${H} L 0 ${H} Z`
  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", gap:6 }}>
      <div style={{ fontFamily:"Clash Display", fontSize:11, fontWeight:600 }}>Weight</div>
      <div>
        <div style={{ fontFamily:"Clash Display", fontSize:22, fontWeight:700, lineHeight:1 }}>75.9<span style={{ fontSize:11, fontWeight:400, color:"#9CA3AF" }}>kg</span></div>
        <div style={{ fontSize:9, color:"#00B87A", fontWeight:500 }}>↓ 2.3kg this month</div>
      </div>
      <div style={{ background:"rgba(0,0,0,0.025)", borderRadius:10, padding:"6px 4px", overflow:"hidden" }}>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ height:60 }}>
          <defs>
            <linearGradient id="wg" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaD} fill="url(#wg)" />
          <path d={lineD} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={coords[coords.length-1].x} cy={coords[coords.length-1].y} r="3.5" fill="#2563eb" />
        </svg>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:4 }}>
        {[["Start","78.2kg","#9CA3AF"],["Now","75.9kg","#2563eb"],["Goal","72kg","#dc2626"]].map(([l,v,c])=>(
          <div key={l} style={{ textAlign:"center", padding:"4px 2px", background:"rgba(0,0,0,0.025)", borderRadius:8 }}>
            <div style={{ fontSize:8, color:"#9CA3AF" }}>{l}</div>
            <div style={{ fontSize:10, fontWeight:700, color:c }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{ padding:"6px 8px", background:"rgba(37,99,235,0.07)", borderRadius:10, border:"1px solid rgba(37,99,235,0.18)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontSize:9, color:"#4A5568" }}>BMI</span>
          <span style={{ fontSize:11, fontWeight:700, color:"#2563eb" }}>23.1</span>
        </div>
        <div style={{ marginTop:3, height:4, background:"rgba(0,0,0,0.06)", borderRadius:2, overflow:"hidden" }}>
          <div style={{ width:"55%", height:"100%", background:"#2563eb", borderRadius:2 }} />
        </div>
      </div>
    </div>
  )
}

function PhoneMockup({ screen, style, scale = 1 }: { screen: ScreenId; style?: React.CSSProperties; scale?: number }) {
  const SCREENS: Record<ScreenId, React.ReactNode> = {
    calories: <CalorieScreen />,
    water:    <WaterScreen />,
    weight:   <WeightScreen />,
  }
  return (
    <div style={{ width: 220 * scale, height: 440 * scale, position: "relative", flexShrink: 0, ...style }}>
      <div style={{
        width: "100%", height: "100%",
        borderRadius: 44 * scale,
        background: "linear-gradient(160deg, #1C1C1E, #2A2A2C)",
        boxShadow: `0 0 0 1px rgba(255,255,255,0.08), 0 ${30*scale}px ${80*scale}px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.1)`,
        padding: 10 * scale,
      }}>
        <div style={{ width: "100%", height: "100%", borderRadius: 34 * scale, background: "#F7F9F8", overflow: "hidden" }}>
          {/* Status bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: `${10*scale}px ${14*scale}px ${4*scale}px`, position: "relative" }}>
            <span style={{ fontSize: 11 * scale, fontWeight: 600 }}>9:41</span>
            <div style={{ width: 80 * scale, height: 20 * scale, background: "#1C1C1E", borderRadius: `0 0 ${12*scale}px ${12*scale}px`, position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)" }} />
            <span style={{ fontSize: 11 * scale, color: "#9CA3AF" }}>●●●</span>
          </div>
          {/* Content */}
          <div style={{ height: `calc(100% - ${36*scale}px)`, overflow: "hidden", padding: `${4*scale}px ${10*scale}px ${10*scale}px` }}>
            {SCREENS[screen]}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Hero ───────────────────────────── */

function Hero() {
  const { data: session } = useSession()
  const startFreeLink = session ? "/calorie" : "/auth/signin"
  return (
    <section id="hero" className="grid-pattern" style={{ position:"relative", minHeight:"100vh", display:"flex", alignItems:"center", overflow:"hidden" }}>
      {/* Ambient blobs */}
      <div style={{ position:"absolute", top:"8%", right:"2%", width:640, height:640, borderRadius:"50%", background:"radial-gradient(circle, rgba(0,245,160,0.11) 0%, transparent 70%)", pointerEvents:"none" }} />
      <div style={{ position:"absolute", bottom:"5%", left:"-5%", width:440, height:440, borderRadius:"50%", background:"radial-gradient(circle, rgba(255,107,107,0.08) 0%, transparent 70%)", pointerEvents:"none" }} />

      <div style={{ maxWidth:1280, margin:"0 auto", padding:"100px 24px 60px", width:"100%", position:"relative" }}>
        <div style={{ position:"relative", display:"flex", alignItems:"center" }}>
          {/* Left: copy */}
          <div style={{ flex:1, zIndex:2, maxWidth:680 }}>
            {/* Logo and Brand */}
            <div style={{ display:"flex", alignItems:"center", gap: 4, marginBottom: 24 }}>
              <div style={{}}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 640 640"
                  style={{ height: "32px", width: "32px" }}
                >
                  <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f43f5e" />
                    <stop offset="80%" stopColor="#6366f1" />
                  </linearGradient>
                  <path
                    fill="url(#iconGradient)"
                    d="M320 176C311.2 176 304 168.8 304 160L304 144C304 99.8 339.8 64 384 64L400 64C408.8 64 416 71.2 416 80L416 96C416 140.2 380.2 176 336 176L320 176zM96 352C96 275.7 131.7 192 208 192C235.3 192 267.7 202.3 290.7 211.3C309.5 218.6 330.6 218.6 349.4 211.3C372.3 202.4 404.8 192 432.1 192C508.4 192 544.1 275.7 544.1 352C544.1 480 464.1 576 384.1 576C367.6 576 346 569.4 332.6 564.7C324.5 561.9 315.7 561.9 307.6 564.7C294.2 569.4 272.6 576 256.1 576C176.1 576 96.1 480 96.1 352z"
                  />
                </svg>
              </div>
              <h1 style={{ display: "flex", alignItems: "center", fontSize: "18px", fontWeight: 600, marginTop: "4px" }}>
                <span style={{ color: "#2563eb" }}>Calo</span><span style={{ color: "#dc2626" }}>Mind</span>
              </h1>
            </div>

            {/* Badge */}
            <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
              style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"6px 14px", background:"rgba(37,99,235,0.1)", border:"1px solid rgba(37,99,235,0.25)", borderRadius:100, marginBottom:24 }}>
              <motion.span animate={{ opacity:[1,0.3,1] }} transition={{ duration:1.8, repeat:Infinity }}
                style={{ width:6, height:6, borderRadius:"50%", background:"#2563eb", display:"block" }} />
              <span style={{ fontSize:13, fontWeight:500, color:"#1d4ed8" }}>250+ people tracking smarter</span>
            </motion.div>

            {/* Headline */}
            <motion.h1 initial={{ opacity:0, y:36 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.18, duration:0.9, ease:[0.22,1,0.36,1] }}
              style={{ fontFamily:"Clash Display", fontSize:"clamp(3rem,8vw,7rem)", fontWeight:700, lineHeight:0.93, letterSpacing:"-3px", marginBottom:28 }}>
              <span className="tracking-tight text-[#090D0B] block">Know what</span>
              <span className="tracking-tight text-[#2563eb] block">you eat</span>
              <span className="tracking-tight">Feel every</span>
              <span className="tracking-tight text-rose-500 block">differene</span>
            </motion.h1>

            {/* Subtext */}
            <motion.p initial={{ opacity:0, y:18 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.36 }}
              style={{ fontSize:18, color:"#4A5568", lineHeight:1.65, maxWidth:480, marginBottom:40, fontWeight:400 }}>
              CaloMind turns your health data into clarity — AI calorie tracking, smart hydration reminders, and weight trends that actually make sense.
            </motion.p>

            {/* CTAs */}
            <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.48 }}
              style={{ display:"flex", gap:14, flexWrap:"wrap", alignItems:"center" }}>
              <a href={startFreeLink} style={{
                padding:"14px 32px", background:"linear-gradient(135deg,#2563eb,#1d4ed8)", color:"white",
                fontWeight:700, fontSize:16, borderRadius:16, textDecoration:"none",
                boxShadow:"0 6px 24px rgba(37,99,235,0.4)", transition:"all 0.22s", display:"flex", alignItems:"center", gap:8,
              }}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 10px 30px rgba(37,99,235,0.5)"}}
                onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 6px 24px rgba(37,99,235,0.4)"}}>
                Start Free <span style={{ fontSize:18 }}>→</span>
              </a>
              <a href="#how-it-works" style={{
                padding:"14px 28px", background:"transparent", color:"#090D0B",
                fontWeight:600, fontSize:16, borderRadius:16, textDecoration:"none",
                border:"1.5px solid rgba(0,0,0,0.12)", transition:"all 0.22s",
                display:"flex", alignItems:"center", gap:8,
              }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="#2563eb";e.currentTarget.style.color="#1d4ed8"}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(0,0,0,0.12)";e.currentTarget.style.color="#090D0B"}}>
                <span style={{ width:28, height:28, borderRadius:"50%", background:"rgba(37,99,235,0.14)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11 }}>▶</span>
                Watch Demo
              </a>
            </motion.div>

            {/* Avatar social proof */}
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.7 }}
              style={{ display:"flex", alignItems:"center", gap:12, marginTop:36 }}>
              <div style={{ display:"flex" }}>
                {["#dc2626","#2563eb","#818CF8","#FB923C"].map((c,i)=>(
                  <div key={i} style={{ width:32, height:32, borderRadius:"50%", background:c, marginLeft:i>0?-10:0, border:"2.5px solid #F7F9F8", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, color:"white", fontWeight:700 }}>
                    {["A","B","C","D"][i]}
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize:13, fontWeight:600 }}>Joined by 250+ users</div>
                <div style={{ fontSize:12, color:"#9CA3AF" }}>★★★★★ 4.9 rating</div>
              </div>
            </motion.div>
          </div>

          {/* Phone mockup — desktop only */}
          <div className="hidden md:block" style={{ position:"absolute", right:-20, top:"50%", transform:"translateY(-50%)", zIndex:1 }}>
            <div style={{ position:"absolute", inset:-60, borderRadius:"50%", background:"radial-gradient(circle,rgba(0,245,160,0.14) 0%,transparent 70%)", zIndex:0, pointerEvents:"none" }} />
            <motion.div
              initial={{ opacity:0, x:60, y:20 }} animate={{ opacity:1, x:0, y:0 }}
              transition={{ delay:0.28, duration:1, ease:[0.22,1,0.36,1] }}
              style={{ position:"relative", zIndex:1 }}>
              <motion.div animate={{ y:[0,-14,0] }} transition={{ duration:5, repeat:Infinity, ease:"easeInOut" }}>
                <PhoneMockup screen="calories" />
              </motion.div>
            </motion.div>

            {/* Floating cards */}
            <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.85 }}
              style={{ position:"absolute", top:72, left:-130, padding:"10px 14px", borderRadius:16, background:"rgba(255,255,255,0.9)", border:"1px solid rgba(255,255,255,1)", backdropFilter:"blur(12px)", boxShadow:"0 8px 28px rgba(0,0,0,0.08)", minWidth:130, zIndex:10 }}>
              <div style={{ fontSize:11, color:"#9CA3AF", marginBottom:3 }}>Calories today</div>
              <div style={{ fontFamily:"Clash Display", fontSize:17, fontWeight:700 }}>1,240 <span style={{ fontSize:11, fontWeight:400, color:"#9CA3AF" }}>/ 2,000</span></div>
              <div style={{ marginTop:6, height:4, background:"#F3F4F6", borderRadius:2, overflow:"hidden" }}>
                <div style={{ width:"62%", height:"100%", background:"linear-gradient(90deg,#2563eb,#1d4ed8)", borderRadius:2 }} />
              </div>
            </motion.div>

            <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} transition={{ delay:1.0 }}
              style={{ position:"absolute", bottom:100, left:-130, padding:"10px 14px", borderRadius:16, background:"rgba(255,255,255,0.9)", border:"1px solid white", backdropFilter:"blur(12px)", boxShadow:"0 8px 28px rgba(0,0,0,0.08)", zIndex:10 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:22 }}>💧</span>
                <div>
                  <div style={{ fontSize:10, color:"#9CA3AF" }}>Hydration</div>
                  <div style={{ fontFamily:"Clash Display", fontSize:15, fontWeight:700, color:"#3182CE" }}>1.8 / 2.5L</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.3 }}
        style={{ position:"absolute", bottom:28, left:"50%", transform:"translateX(-50%)", display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
        <span style={{ fontSize:11, color:"#9CA3AF", letterSpacing:"0.5px" }}>scroll to explore</span>
        <motion.div animate={{ y:[0,7,0] }} transition={{ repeat:Infinity, duration:1.6 }}
          style={{ width:1, height:32, background:"linear-gradient(180deg,#9CA3AF,transparent)" }} />
      </motion.div>
    </section>
  )
}

/* ─── Social Proof ───────────────────── */

function SocialProof() {
  return (
    <section style={{ padding:"24px 24px", borderTop:"1px solid rgba(0,0,0,0.05)", borderBottom:"1px solid rgba(0,0,0,0.05)", background:"rgba(255,255,255,0.45)", backdropFilter:"blur(8px)" }}>
      <div style={{ maxWidth:1280, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"center", gap:8, flexWrap:"wrap" }}>
        <span style={{ fontSize:13, color:"#C4C9D0", fontWeight:500 }}>As seen in</span>
        <div style={{ width:1, height:16, background:"rgba(0,0,0,0.08)", margin:"0 8px" }} />
        {["TechCrunch","Forbes","Healthline","Wired","Product Hunt"].map(b=>(
          <span key={b} style={{ fontSize:14, fontWeight:700, color:"#D1D5DB", letterSpacing:"0.4px", padding:"0 14px", fontFamily:"Clash Display" }}>{b}</span>
        ))}
      </div>
    </section>
  )
}

/* ─── Stats Strip ────────────────────── */

function StatCounter({ numStr, decimals, suffix, label, bordered }: { numStr: string; decimals: number; suffix: string; label: string; bordered: boolean }) {
  const target = parseFloat(numStr)
  const { count, ref } = useCounter(target, decimals)
  return (
    <div ref={ref} style={{ textAlign:"center", padding:"28px 20px", borderRight: bordered ? "1px solid rgba(0,0,0,0.06)" : "none" }}>
      <div style={{ fontFamily:"Clash Display", fontSize:"clamp(2rem,3.5vw,3.2rem)", fontWeight:700, lineHeight:1, marginBottom:8 }}>
        {decimals > 0 ? count.toFixed(1) : Math.floor(count).toLocaleString()}{suffix}
      </div>
      <div style={{ fontSize:14, color:"#9CA3AF" }}>{label}</div>
    </div>
  )
}

function StatsStrip() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once:true })
  const stats = [
    { numStr:"250", decimals:0, suffix:"+", label:"Active Users" },
    { numStr:"50",  decimals:0, suffix:"K",  label:"Calories Tracked" },
    { numStr:"98",  decimals:0, suffix:"%",  label:"Accuracy Rate" },
    { numStr:"4.9", decimals:1, suffix:"★",  label:"User Rating" },
  ]
  return (
    <div style={{ position:"relative", zIndex:10, marginTop:-60 }}>
      <div style={{ maxWidth:1100, margin:"0 auto", padding:"0 24px" }}>
        <motion.div ref={ref} initial={{ opacity:0, y:24 }} animate={inView?{ opacity:1, y:0 }:{}} transition={{ duration:0.6 }}
          className="glass" style={{ borderRadius:24, boxShadow:"0 20px 60px rgba(0,0,0,0.08)", display:"grid", gridTemplateColumns:"repeat(4,1fr)", overflow:"hidden" }}>
          {stats.map((s,i) => <StatCounter key={s.label} {...s} bordered={i<3} />)}
        </motion.div>
      </div>
    </div>
  )
}

/* ─── Features ───────────────────────── */

function Features() {
  const [active, setActive] = useState<TabId>("nutrition")
  const [stickyActive, setStickyActive] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const inlineTabsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => setStickyActive(!e.isIntersecting), { rootMargin:"-80px 0px 0px 0px" })
    if (inlineTabsRef.current) obs.observe(inlineTabsRef.current)
    return () => obs.disconnect()
  }, [])

  const f = FEATURE_CONTENT[active]

  const tabBtn = (id: TabId) => (
    <button key={id} onClick={() => setActive(id)}
      style={{
        padding:"10px 22px", borderRadius:100, border:"none", cursor:"pointer", fontFamily:"DM Sans",
        fontWeight:500, fontSize:15, whiteSpace:"nowrap", transition:"all 0.25s",
        background: active===id ? "linear-gradient(135deg,#2563eb,#1d4ed8)" : "transparent",
        color: active===id ? "white" : "#4A5568",
        boxShadow: active===id ? "0 4px 12px rgba(37,99,235,0.3)" : "none",
      }}>
      {TABS.find(t=>t.id===id)!.emoji} {TABS.find(t=>t.id===id)!.label}
    </button>
  )

  return (
    <section id="features" ref={sectionRef} style={{ padding:"120px 24px 80px" }}>

      <div style={{ maxWidth:1280, margin:"0 auto" }}>
        {/* Section header */}
        <div style={{ textAlign:"center", marginBottom:56 }}>
          <motion.h2 initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
            style={{ fontFamily:"Clash Display", fontSize:"clamp(2rem,5vw,4rem)", fontWeight:700, letterSpacing:"-2px", marginBottom:16, lineHeight:1.05 }}>
            Everything you need,<br />nothing you don't.
          </motion.h2>
          <motion.p initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }} transition={{ delay:0.2 }}
            style={{ fontSize:18, color:"#4A5568", maxWidth:420, margin:"0 auto" }}>
            Four modules. One coherent health picture.
          </motion.p>
        </div>

        {/* Inline tab nav */}
        <div ref={inlineTabsRef} style={{ display:"flex", justifyContent:"center", marginBottom:60 }}>
          <div className="glass tabs-scroll" style={{ borderRadius:100, padding:"4px", display:"inline-flex", boxShadow:"0 4px 16px rgba(0,0,0,0.06)" }}>
            {TABS.map(t => tabBtn(t.id))}
          </div>
        </div>

        {/* Feature pane */}
        <AnimatePresence mode="wait">
          <motion.div key={active} initial={{ opacity:0, y:18 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-18 }} transition={{ duration:0.32 }}
            className="grid md:grid-cols-2 grid-cols-1" style={{ gap:64, alignItems:"center" }}>
            {/* Text */}
            <div>
              <div style={{ display:"inline-flex", padding:"4px 12px", background:"rgba(0,245,160,0.1)", borderRadius:100, fontSize:12, fontWeight:600, color:"#00A870", marginBottom:20 }}>
                {TABS.find(t=>t.id===active)!.emoji} {TABS.find(t=>t.id===active)!.label}
              </div>
              <h3 style={{ fontFamily:"Clash Display", fontSize:"clamp(1.8rem,3vw,2.8rem)", fontWeight:700, letterSpacing:"-1.5px", marginBottom:20, lineHeight:1.08 }}>
                {f.headline}
              </h3>
              <p style={{ fontSize:17, color:"#4A5568", lineHeight:1.7, marginBottom:32 }}>{f.desc}</p>
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                {f.bullets.map((b,i) => (
                  <motion.div key={b} initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.07 }}
                    style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{ width:20, height:20, borderRadius:6, background:"rgba(0,245,160,0.14)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <span style={{ fontSize:11, color:"#00A870" }}>✓</span>
                    </div>
                    <span style={{ fontSize:15, fontWeight:500 }}>{b}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Phone */}
            <div style={{ display:"flex", justifyContent:"center", alignItems:"center" }}>
              <div style={{ position:"relative" }}>
                <div style={{ position:"absolute", inset:-64, borderRadius:"50%", background:"radial-gradient(circle,rgba(0,245,160,0.1) 0%,transparent 70%)", pointerEvents:"none" }} />
                <PhoneMockup screen={f.screen} style={{ transform:"scale(1.08)", zIndex:1 }} />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}

/* ─── How It Works ───────────────────── */

function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once:true, margin:"-80px" })

  return (
    <section id="how-it-works" style={{ padding:"100px 24px", background:"rgba(255,255,255,0.38)", backdropFilter:"blur(8px)" }}>
      <div style={{ maxWidth:1280, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:80 }}>
          <motion.h2 initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
            style={{ fontFamily:"Clash Display", fontSize:"clamp(2rem,5vw,4rem)", fontWeight:700, letterSpacing:"-2px", marginBottom:16 }}>
            Up and running in minutes.
          </motion.h2>
          <motion.p initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }} transition={{ delay:0.2 }}
            style={{ fontSize:18, color:"#4A5568", maxWidth:400, margin:"0 auto" }}>
            No lengthy setup. No nutrition degree required.
          </motion.p>
        </div>

        <div ref={ref} className="grid md:grid-cols-3 grid-cols-1" style={{ gap:40, position:"relative" }}>
          {/* Dotted connector — desktop only */}
          <div className="hidden md:block" style={{ position:"absolute", top:72, left:"18%", right:"18%", height:1, background:"repeating-linear-gradient(90deg,#00F5A0 0,#00F5A0 6px,transparent 6px,transparent 16px)", zIndex:0 }} />

          {HOW_STEPS.map((s,i) => (
            <motion.div key={s.num}
              initial={{ opacity:0, y:60 }} animate={inView?{ opacity:1, y:0 }:{}}
              transition={{ delay:i*0.14, duration:0.65, ease:[0.22,1,0.36,1] }}
              style={{ display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center", position:"relative", zIndex:1 }}>
              <div style={{ width:56, height:56, borderRadius:"50%", background:"white", border:"2px solid rgba(0,245,160,0.4)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:24, boxShadow:"0 4px 16px rgba(0,0,0,0.06),0 0 0 5px rgba(0,245,160,0.08)" }}>
                <span style={{ fontFamily:"Clash Display", fontSize:15, fontWeight:700, color:"#00A870" }}>{s.num}</span>
              </div>
              <div className="md:scale-100 scale-75" style={{ transformOrigin:"top center" }}>
                <PhoneMockup screen={s.screen} />
              </div>
              <h3 style={{ fontFamily:"Clash Display", fontSize:22, fontWeight:700, marginBottom:10, marginTop:20 }}>{s.title}</h3>
              <p style={{ fontSize:15, color:"#4A5568", lineHeight:1.65, maxWidth:260 }}>{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Pricing ────────────────────────── */

function Pricing() {
  return (
    <section id="pricing" style={{ padding:"100px 24px" }}>
      <div style={{ maxWidth:1180, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:72 }}>
          <motion.h2 initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
            style={{ fontFamily:"Clash Display", fontSize:"clamp(2rem,5vw,4rem)", fontWeight:700, letterSpacing:"-2px", marginBottom:16 }}>
            Simple, honest pricing.
          </motion.h2>
          <motion.p initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }} transition={{ delay:0.15 }}
            style={{ fontSize:18, color:"#4A5568" }}>
            Start free. Upgrade when you're ready.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 grid-cols-1" style={{ gap:24, alignItems:"stretch" }}>
          {PRICING.map((tier,i) => (
            <motion.div key={tier.name} initial={{ opacity:0, y:28 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.1 }}
              className={tier.accent ? "" : "glass"}
              style={{
                borderRadius:28, padding:"36px 30px", position:"relative",
                transform: tier.accent ? "scale(1.04)" : "none",
                background: tier.accent ? "linear-gradient(150deg,#0D1210,#1A2820)" : undefined,
                boxShadow: tier.accent ? "0 24px 64px rgba(0,0,0,0.22),0 0 0 1px rgba(0,245,160,0.22)" : "0 8px 32px rgba(0,0,0,0.055)",
                zIndex: tier.accent ? 2 : 1,
              }}>
              {tier.badge && (
                <div style={{ position:"absolute", top:-14, left:"50%", transform:"translateX(-50%)", padding:"6px 18px", background:"linear-gradient(135deg,#00F5A0,#00D18C)", borderRadius:100, fontSize:12, fontWeight:700, color:"#090D0B", whiteSpace:"nowrap" }}>{tier.badge}</div>
              )}
              <div style={{ marginBottom:28 }}>
                <div style={{ fontSize:13, fontWeight:600, color: tier.accent ? "rgba(255,255,255,0.5)" : "#9CA3AF", marginBottom:6 }}>{tier.name}</div>
                <div style={{ display:"flex", alignItems:"baseline", gap:2 }}>
                  <span style={{ fontSize:15, color: tier.accent?"rgba(255,255,255,0.45)":"#9CA3AF" }}>$</span>
                  <span style={{ fontFamily:"Clash Display", fontSize:52, fontWeight:700, lineHeight:1, color: tier.accent?"white":"#090D0B" }}>{tier.price}</span>
                  <span style={{ fontSize:14, color: tier.accent?"rgba(255,255,255,0.4)":"#9CA3AF" }}>/mo</span>
                </div>
                <div style={{ fontSize:14, color: tier.accent?"rgba(255,255,255,0.42)":"#9CA3AF", marginTop:6 }}>{tier.desc}</div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:32 }}>
                {tier.features.map(feat => (
                  <div key={feat} style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:18, height:18, borderRadius:5, background:"rgba(0,245,160,0.15)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <span style={{ fontSize:10, color:"#00F5A0" }}>✓</span>
                    </div>
                    <span style={{ fontSize:14, color: tier.accent?"rgba(255,255,255,0.78)":"#4A5568" }}>{feat}</span>
                  </div>
                ))}
              </div>
              <a href="#final-cta" style={{
                display:"block", textAlign:"center", padding:"13px", borderRadius:16,
                fontWeight:700, fontSize:15, textDecoration:"none", transition:"all 0.2s",
                background: tier.accent ? "linear-gradient(135deg,#00F5A0,#00D18C)" : "transparent",
                color: tier.accent ? "#090D0B" : "#090D0B",
                border: tier.accent ? "none" : "1.5px solid rgba(0,0,0,0.12)",
                boxShadow: tier.accent ? "0 4px 16px rgba(0,245,160,0.38)" : "none",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform="translateY(-1px)" }}
                onMouseLeave={e => { e.currentTarget.style.transform="none" }}>
                {tier.cta}
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Final CTA ──────────────────────── */

function FinalCTA() {
  const [email, setEmail] = useState("")
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once:true, margin:"-120px" })

  return (
    <section id="final-cta" ref={ref} className={inView ? "animated-bg" : ""} style={{ padding:"100px 24px", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:"20%", right:"8%", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle,rgba(0,245,160,0.18) 0%,transparent 70%)", pointerEvents:"none" }} />
      <div style={{ position:"absolute", bottom:"10%", left:"4%", width:320, height:320, borderRadius:"50%", background:"radial-gradient(circle,rgba(255,107,107,0.12) 0%,transparent 70%)", pointerEvents:"none" }} />

      <div style={{ maxWidth:660, margin:"0 auto", textAlign:"center", position:"relative", zIndex:1 }}>
        <motion.div initial={{ opacity:0, scale:0.95 }} whileInView={{ opacity:1, scale:1 }} viewport={{ once:true }} transition={{ duration:0.6 }}>
          <div style={{ display:"inline-flex", padding:"6px 16px", background:"rgba(0,245,160,0.12)", border:"1px solid rgba(0,245,160,0.28)", borderRadius:100, fontSize:13, fontWeight:500, color:"#00A870", marginBottom:28 }}>
            ✦ Free forever plan available
          </div>
          <h2 style={{ fontFamily:"Clash Display", fontSize:"clamp(2.4rem,6vw,5rem)", fontWeight:700, letterSpacing:"-3px", lineHeight:0.92, marginBottom:20 }}>
            Start your<br />
            <span style={{ background:"linear-gradient(135deg,#00F5A0,#00C87A)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", color:"#00F5A0" }}>health journey</span><br />
            today.
          </h2>
          <p style={{ fontSize:18, color:"#4A5568", lineHeight:1.65, marginBottom:44 }}>
            Join 50+ people who track smarter, not harder.<br />Set up in 2 minutes. Cancel anytime.
          </p>

          <div style={{ display:"flex", gap:10, maxWidth:480, margin:"0 auto", flexWrap:"wrap", justifyContent:"center" }}>
            <input type="email" placeholder="Enter your email" value={email} onChange={e=>setEmail(e.target.value)}
              style={{ flex:1, minWidth:210, padding:"14px 20px", borderRadius:14, border:"1.5px solid rgba(0,0,0,0.1)", fontSize:15, fontFamily:"DM Sans", background:"rgba(255,255,255,0.8)", backdropFilter:"blur(8px)", outline:"none", color:"#090D0B", transition:"border-color 0.2s" }}
              onFocus={e=>(e.currentTarget.style.borderColor="#00F5A0")}
              onBlur={e=>(e.currentTarget.style.borderColor="rgba(0,0,0,0.1)")} />
            <button style={{ padding:"14px 28px", background:"linear-gradient(135deg,#00F5A0,#00D18C)", border:"none", borderRadius:14, cursor:"pointer", fontWeight:700, fontSize:15, fontFamily:"DM Sans", color:"#090D0B", boxShadow:"0 6px 20px rgba(0,245,160,0.42)", transition:"all 0.22s" }}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 10px 28px rgba(0,245,160,0.52)"}}
              onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 6px 20px rgba(0,245,160,0.42)"}}>
              Get Started →
            </button>
          </div>
          <p style={{ fontSize:13, color:"#9CA3AF", marginTop:14 }}>No credit card required. Free plan includes core features.</p>
        </motion.div>
      </div>
    </section>
  )
}

/* ─── Footer ─────────────────────────── */

function Footer() {
  const cols = [
    { title:"Product",  links:["Features","Pricing","Changelog","Roadmap"] },
    { title:"Support",  links:["Help Center","Privacy","Terms","Contact"] },
  ]
  return (
    <footer style={{ borderTop:"1px solid rgba(0,0,0,0.06)", padding:"60px 24px 28px", background:"rgba(255,255,255,0.38)" }}>
      <div style={{ maxWidth:1280, margin:"0 auto" }}>
        <div className="grid lg:grid-cols-5 md:grid-cols-3 grid-cols-2" style={{ gap:40, marginBottom:52 }}>
          {/* Brand */}
          <div style={{ gridColumn:"span 1" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
              <div style={{}}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 640 640"
                  style={{ height: "34px", width: "34px" }}
                >
                  <linearGradient id="footerIconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f43f5e" />
                    <stop offset="80%" stopColor="#6366f1" />
                  </linearGradient>
                  <path
                    fill="url(#footerIconGradient)"
                    d="M320 176C311.2 176 304 168.8 304 160L304 144C304 99.8 339.8 64 384 64L400 64C408.8 64 416 71.2 416 80L416 96C416 140.2 380.2 176 336 176L320 176zM96 352C96 275.7 131.7 192 208 192C235.3 192 267.7 202.3 290.7 211.3C309.5 218.6 330.6 218.6 349.4 211.3C372.3 202.4 404.8 192 432.1 192C508.4 192 544.1 275.7 544.1 352C544.1 480 464.1 576 384.1 576C367.6 576 346 569.4 332.6 564.7C324.5 561.9 315.7 561.9 307.6 564.7C294.2 569.4 272.6 576 256.1 576C176.1 576 96.1 480 96.1 352z"
                  />
                </svg>
              </div>
              <h1 style={{ display: "flex", alignItems: "center", fontSize: "18px", fontWeight: 600, marginTop: "4px" }}>
                <span style={{ color: "#2563eb" }}>Calo</span><span style={{ color: "#dc2626" }}>Mind</span>
              </h1>
            </div>
            <p style={{ fontSize:14, color:"#9CA3AF", lineHeight:1.72, maxWidth:220, marginBottom:18 }}>
              AI-powered health tracking that turns data into clarity.
            </p>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {["💻","Web App"].map(([ic,lb])=>(
                <div key={lb} style={{ padding:"7px 12px", background:"rgba(0,0,0,0.04)", borderRadius:9, fontSize:12, cursor:"pointer", color:"#4A5568", fontWeight:500, display:"flex", alignItems:"center", gap:4 }}>
                  <span>{ic}</span><span>{lb}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Link cols */}
          {cols.map(col=>(
            <div key={col.title}>
              <div style={{ fontSize:12, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:16 }}>{col.title}</div>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {col.links.map(l=>(
                  <a key={l} href="#" style={{ fontSize:14, color:"#9CA3AF", textDecoration:"none", transition:"color 0.2s" }}
                    onMouseEnter={e=>(e.currentTarget.style.color="#090D0B")}
                    onMouseLeave={e=>(e.currentTarget.style.color="#9CA3AF")}>{l}</a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ borderTop:"1px solid rgba(0,0,0,0.06)", paddingTop:22, display:"flex", justifyContent:"center", alignItems:"center", flexWrap:"wrap", gap:10 }}>
          <span style={{ fontSize:13, color:"#9CA3AF" }}>© 2025 CaloMind Inc. All rights reserved.</span>
        </div>
      </div>
    </footer>
  )
}

/* ─── Page ───────────────────────────── */

export default function Home() {
  return (
    <main>
      <Hero />
      <StatsStrip />
      <SocialProof />
      <Features />
      <HowItWorks />
      <Pricing />
      <FinalCTA />
      <Footer />
    </main>
  )
}