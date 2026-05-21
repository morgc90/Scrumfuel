import { useState, useRef, useEffect } from "react";
import "./App.css";

const POSITIONS = [
  { id: "prop", label: "Prop", role: "Power & scrummaging" },
  { id: "hooker", label: "Hooker", role: "Set piece & lineout" },
  { id: "lock", label: "Lock", role: "Engine room & lineout" },
  { id: "flanker", label: "Flanker", role: "Work-rate & breakdown" },
  { id: "8", label: "No. 8", role: "Ball-carrying powerhouse" },
  { id: "scrum-half", label: "Scrum-half", role: "Service & acceleration" },
  { id: "fly-half", label: "Fly-half", role: "Game management" },
  { id: "centre", label: "Centre", role: "Physicality & line breaks" },
  { id: "winger", label: "Winger", role: "Speed & finishing" },
  { id: "fullback", label: "Fullback", role: "Counter-attack & aerial" },
];

const PHASES = [
  { id: "preseason", label: "Pre-season" },
  { id: "inseason", label: "In-season" },
  { id: "matchweek", label: "Match week" },
  { id: "recovery", label: "Recovery" },
];

const GOALS = [
  { id: "muscle", label: "Build muscle" },
  { id: "endurance", label: "Endurance" },
  { id: "leanbulk", label: "Lean bulk" },
  { id: "fat", label: "Lose fat" },
  { id: "recovery", label: "Fast recovery" },
];

const QUICK_PROMPTS = [
  "What should I eat the night before a match?",
  "Best recovery foods after weights?",
  "How much protein do I actually need?",
  "Match-day morning meal ideas?",
  "Hydration tips for summer rugby?",
];

const MEALS = [
  { icon: "🍳", name: "Breakfast", time: "7:00 AM", desc: "Oats, eggs, banana, Greek yoghurt, honey", pct: 0.22 },
  { icon: "🍗", name: "Pre-training", time: "10:30 AM", desc: "Chicken rice bowl, sweet potato, avocado", pct: 0.22 },
  { icon: "🥤", name: "Post-training shake", time: "1:00 PM", desc: "Whey protein, oat milk, berries, creatine", pct: 0.13 },
  { icon: "🫐", name: "Snack", time: "4:00 PM", desc: "Cottage cheese, mixed nuts, apple", pct: 0.12 },
  { icon: "🐟", name: "Dinner", time: "7:30 PM", desc: "Salmon, brown rice, broccoli, olive oil", pct: 0.31 },
];

function getMacros(posId, weight, phase, goal) {
  const isPower = ["prop", "hooker", "lock", "8"].includes(posId);
  const isBack = ["scrum-half", "fly-half", "centre", "winger", "fullback"].includes(posId);
  const base = isPower ? 3600 : isBack ? 2900 : 3200;
  const phaseMulti = { preseason: 1.05, inseason: 1.0, matchweek: 1.1, recovery: 0.9 };
  const kcal = Math.round(base * (phaseMulti[phase] || 1));
  const protein = Math.round(weight * (goal === "muscle" || goal === "leanbulk" ? 2.2 : 1.8));
  const carbs = Math.round((kcal * (phase === "matchweek" ? 0.52 : 0.48)) / 4);
  const fat = Math.round((kcal * 0.25) / 9);
  return { kcal, protein, carbs, fat };
}

export default function App() {
  const [screen, setScreen] = useState("onboard");
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [weight, setWeight] = useState(95);
  const [phase, setPhase] = useState("matchweek");
  const [goal, setGoal] = useState("muscle");
  const [activeTab, setActiveTab] = useState("coach");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const chatEndRef = useRef(null);

  const macros = position ? getMacros(position, weight, phase, goal) : null;
  const posObj = POSITIONS.find((p) => p.id === position);
  const phaseObj = PHASES.find((p) => p.id === phase);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function handleStart() {
    if (!position) { setError("Please select your position first."); return; }
    setError("");
    const greeting = `Hi${name ? " " + name : ""}! I'm your ScrumFuel AI coach. As a ${posObj.label} in ${phaseObj.label}, your targets are ${macros.kcal.toLocaleString()} kcal, ${macros.protein}g protein, ${macros.carbs}g carbs daily. What do you want to work on?`;
    setMessages([{ role: "assistant", content: greeting }]);
    setScreen("dashboard");
    setActiveTab("coach");
  }

  async function sendMessage(text) {
    const userText = text || input.trim();
    if (!userText || loading) return;
    setInput("");

    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      // Calls our secure backend proxy — API key never exposed to browser
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          context: {
            position: posObj?.label,
            phase: phaseObj?.label,
            weight,
            goal,
            macros,
          },
        }),
      });

      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      setMessages([...newMessages, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Sorry, I couldn't reach the server. Please try again." }]);
    }
    setLoading(false);
  }

  if (screen === "onboard") {
    return (
      <div className="onboard">
        <div className="logo">SCRUMFUEL</div>
        <h1>Your AI rugby coach.</h1>
        <p className="sub">Personalised nutrition powered by AI. Set up your profile to begin.</p>

        <label className="field-label">Your name (optional)</label>
        <input className="text-input" placeholder="e.g. Jamie" value={name} onChange={(e) => setName(e.target.value)} />

        <label className="field-label">Position</label>
        <div className="pos-grid">
          {POSITIONS.map((p) => (
            <button key={p.id} className={`pos-btn ${position === p.id ? "sel" : ""}`} onClick={() => setPosition(p.id)}>
              <span className="pos-name">{p.label}</span>
              <span className="pos-role">{p.role}</span>
            </button>
          ))}
        </div>

        <label className="field-label">Body weight</label>
        <div className="weight-row">
          <input type="range" min={60} max={140} step={1} value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="slider" />
          <span className="weight-val">{weight}kg</span>
        </div>

        <label className="field-label">Training phase</label>
        <div className="pill-row">
          {PHASES.map((p) => (
            <button key={p.id} className={`pill ${phase === p.id ? "sel" : ""}`} onClick={() => setPhase(p.id)}>{p.label}</button>
          ))}
        </div>

        <label className="field-label">Primary goal</label>
        <div className="pill-row">
          {GOALS.map((g) => (
            <button key={g.id} className={`pill ${goal === g.id ? "sel" : ""}`} onClick={() => setGoal(g.id)}>{g.label}</button>
          ))}
        </div>

        {error && <p className="error">{error}</p>}
        <button className="start-btn" onClick={handleStart}>Start my plan →</button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="topbar">
        <span className="logo">SCRUMFUEL</span>
        <span className="player-tag">{name || "Athlete"} · {posObj?.label} · {phaseObj?.label}</span>
        <button className="edit-btn" onClick={() => setScreen("onboard")}>Edit</button>
      </div>

      <div className="macro-strip">
        {[
          { val: macros.kcal.toLocaleString(), lbl: "KCAL" },
          { val: macros.protein + "g", lbl: "PROTEIN" },
          { val: macros.carbs + "g", lbl: "CARBS" },
          { val: macros.fat + "g", lbl: "FAT" },
        ].map((m) => (
          <div key={m.lbl} className="macro-cell">
            <div className="macro-num">{m.val}</div>
            <div className="macro-lbl">{m.lbl}</div>
          </div>
        ))}
      </div>

      <div className="tabs">
        {["coach", "meals", "tracker"].map((t) => (
          <button key={t} className={`tab ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)}>
            {t === "coach" ? "AI Coach" : t === "meals" ? "Meal plan" : "Tracker"}
          </button>
        ))}
      </div>

      {activeTab === "coach" && (
        <div className="coach-panel">
          <div className="chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={`msg ${m.role}`}>
                {m.role === "assistant" && <div className="avatar">SF</div>}
                <div className={`bubble ${m.role}`}>{m.content}</div>
              </div>
            ))}
            {loading && (
              <div className="msg assistant">
                <div className="avatar">SF</div>
                <div className="bubble assistant typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div className="quick-row">
            {QUICK_PROMPTS.map((q, i) => (
              <button key={i} className="quick-btn" onClick={() => sendMessage(q)}>{q}</button>
            ))}
          </div>
          <div className="input-row">
            <input
              className="chat-input"
              placeholder="Ask your coach anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button className="send-btn" onClick={() => sendMessage()} disabled={loading}>↑</button>
          </div>
        </div>
      )}

      {activeTab === "meals" && (
        <div className="meals-panel">
          <div className="section-label">Daily meal plan · {posObj?.label} · {phaseObj?.label}</div>
          {MEALS.map((meal, i) => (
            <div key={i} className="meal-card">
              <span className="meal-icon">{meal.icon}</span>
              <div className="meal-info">
                <div className="meal-name">{meal.name}</div>
                <div className="meal-sub">{meal.time} · {meal.desc}</div>
              </div>
              <div className="meal-kcal">{Math.round(macros.kcal * meal.pct)}</div>
            </div>
          ))}
          <button className="cta-btn" onClick={() => { setActiveTab("coach"); sendMessage("Give me full recipes and prep instructions for my meal plan today"); }}>
            Get full recipes with prep ↗
          </button>
        </div>
      )}

      {activeTab === "tracker" && (
        <div className="tracker-panel">
          <div className="section-label">Today's progress</div>
          {[
            { label: "Calories", cur: Math.round(macros.kcal * 0.64), total: macros.kcal, unit: "kcal" },
            { label: "Protein", cur: Math.round(macros.protein * 0.6), total: macros.protein, unit: "g" },
            { label: "Carbs", cur: Math.round(macros.carbs * 0.58), total: macros.carbs, unit: "g" },
            { label: "Hydration", cur: 2.1, total: 3.5, unit: "L" },
          ].map((p) => (
            <div key={p.label} className="prog-row">
              <div className="prog-hdr">
                <span>{p.label}</span>
                <span className="prog-val">{p.cur}{p.unit} / {p.total}{p.unit}</span>
              </div>
              <div className="prog-bar">
                <div className="prog-fill" style={{ width: Math.round((p.cur / p.total) * 100) + "%" }} />
              </div>
            </div>
          ))}
          <div className="section-label" style={{ marginTop: 12 }}>Weekly stats</div>
          <div className="stat-grid">
            {[
              { num: "6/7", lbl: "Days on plan" },
              { num: weight + "kg", lbl: "Body weight" },
              { num: "94%", lbl: "Macro adherence" },
              { num: "3", lbl: "Days to match" },
            ].map((s) => (
              <div key={s.lbl} className="stat-cell">
                <div className="stat-num">{s.num}</div>
                <div className="stat-lbl">{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
