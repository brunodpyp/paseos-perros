import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, getDocs } from "firebase/firestore";


// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDUXfzHRLZMb6Rtr3eAKjLBXoDJM_7cUe4",
  authDomain: "paseador-perros-7ad45.firebaseapp.com",
  projectId: "paseador-perros-7ad45",
  storageBucket: "paseador-perros-7ad45.firebasestorage.app",
  messagingSenderId: "139508187725",
  appId: "1:139508187725:web:9af8feec4ab63fb4e1d204"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);


const MAX_DIA = 5;
const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const hoy = new Date();

function dateKey(a, m, d) {
  return `${a}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
}
function keyToDate(key) {
  const [a, m, d] = key.split("-");
  return new Date(+a, +m - 1, +d);
}
function getMonthDays(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return { offset: (firstDay + 6) % 7, total: daysInMonth };
}
function get5HabilesDesde(startKey) {
  const date = keyToDate(startKey);
  const dow = date.getDay();
  const diffToMonday = (dow + 6) % 7;
  const monday = new Date(date);
  monday.setDate(date.getDate() - diffToMonday);
  const result = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    result.push(dateKey(d.getFullYear(), d.getMonth(), d.getDate()));
  }
  return result;
}

const S = {
  root: { minHeight:"100vh", background:"#0f172a", fontFamily:"sans-serif", color:"#e2e8f0", paddingBottom:40 },
  wrap: { maxWidth:420, margin:"0 auto", padding:"24px 16px" },
  title: { fontSize:26, fontWeight:700, color:"#f8fafc", margin:"0 0 6px" },
  sub: { fontSize:14, color:"#94a3b8", margin:"0 0 24px", lineHeight:1.6 },
  label: { display:"block", fontSize:12, color:"#94a3b8", marginBottom:6, textTransform:"uppercase", letterSpacing:0.8 },
  field: { marginBottom:16 },
  input: { width:"100%", background:"#1e293b", border:"1px solid #334155", borderRadius:10, padding:"11px 14px", color:"#f8fafc", fontSize:15, outline:"none", boxSizing:"border-box" },
  textarea: { width:"100%", background:"#1e293b", border:"1px solid #334155", borderRadius:10, padding:"11px 14px", color:"#f8fafc", fontSize:14, outline:"none", boxSizing:"border-box", minHeight:72, resize:"none" },
  phoneRow: { display:"flex" },
  phonePrefix: { background:"#0f172a", border:"1px solid #334155", borderRight:"none", borderRadius:"10px 0 0 10px", padding:"0 12px", display:"flex", alignItems:"center", fontSize:14, color:"#94a3b8", whiteSpace:"nowrap" },
  phoneInput: { flex:1, background:"#1e293b", border:"1px solid #334155", borderRadius:"0 10px 10px 0", padding:"11px 14px", color:"#f8fafc", fontSize:15, outline:"none", width:"100%" },
  btnPrimary: { width:"100%", background:"#f59e0b", color:"#0f172a", border:"none", borderRadius:12, padding:"13px", fontWeight:700, fontSize:15, cursor:"pointer", marginBottom:8 },
  btnGhost: { width:"100%", background:"none", color:"#94a3b8", border:"1px solid #334155", borderRadius:12, padding:"12px", fontWeight:500, fontSize:14, cursor:"pointer", marginBottom:8 },
  err: { fontSize:12, color:"#ef4444", marginTop:4 },
  warn: { fontSize:12, color:"#f59e0b", marginTop:4 },
  planGrid: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 },
  planCard: (sel) => ({ border: sel ? "2px solid #f59e0b" : "1px solid #334155", borderRadius:14, padding:"14px 12px", cursor:"pointer", background: sel ? "#292524" : "#1e293b", textAlign:"left" }),
  planEmoji: { fontSize:22, marginBottom:8 },
  planName: { fontSize:14, fontWeight:600, color:"#f8fafc", marginBottom:4 },
  planPrice: { fontSize:22, fontWeight:700, color:"#f8fafc" },
  planSub: { fontSize:12, color:"#94a3b8", marginTop:2 },
  infoBox: { background:"#1e293b", border:"1px solid #334155", borderRadius:10, padding:"10px 14px", marginBottom:14, fontSize:13, color:"#94a3b8", lineHeight:1.6 },
  calHeader: { display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 },
  calNav: { background:"#1e293b", border:"1px solid #334155", color:"#f8fafc", borderRadius:8, width:34, height:34, fontSize:18, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" },
  calTitle: { fontSize:15, fontWeight:700, color:"#f8fafc" },
  calGrid: { display:"grid", gridTemplateColumns:"repeat(7, 1fr)", gap:3, marginBottom:14 },
  calDayLabel: { fontSize:10, color:"#475569", textAlign:"center", padding:"4px 0", fontWeight:600 },
  legend: { display:"flex", gap:12, marginBottom:12, flexWrap:"wrap" },
  legItem: { display:"flex", alignItems:"center", gap:5, fontSize:11, color:"#94a3b8" },
  legDot: (bg) => ({ width:8, height:8, borderRadius:"50%", background:bg }),
  thanksTitle: { fontSize:52, fontWeight:700, color:"#f8fafc", textAlign:"center", paddingTop:16, marginBottom:12 },
  thanksMsg: { fontSize:15, color:"#94a3b8", textAlign:"center", lineHeight:1.7, marginBottom:24 },
  divider: { border:"none", borderTop:"1px solid #334155", margin:"16px 0" },
  secLabel: { fontSize:11, color:"#64748b", textTransform:"uppercase", letterSpacing:1, marginBottom:8 },
  chip: { display:"inline-block", padding:"5px 12px", borderRadius:20, fontSize:12, margin:"3px", background:"#052e16", color:"#4ade80", border:"1px solid #14532d" },
  perrosBtns: { display:"flex", gap:8, marginBottom:4 },
  perroBtn: (sel) => ({ flex:1, padding:"10px 0", borderRadius:10, border: sel ? "2px solid #f59e0b" : "1px solid #334155", background: sel ? "#292524" : "#1e293b", color: sel ? "#f59e0b" : "#94a3b8", fontWeight:600, fontSize:15, cursor:"pointer" }),
  loading: { textAlign:"center", paddingTop:80, color:"#64748b", fontSize:14 },
};

function CalDay({ day, keyStr, count, status, onToggle, calYear, calMonth }) {
  if (!day) return <div />;
  const isToday = calYear === hoy.getFullYear() && calMonth === hoy.getMonth() && day === hoy.getDate();
  let bg = "#1e293b", color = "#94a3b8", border = "1px solid #334155", cursor = "pointer";
  if (status === "weekend") { bg="#0f172a"; color="#334155"; cursor="default"; }
  else if (status === "selected") { bg="#f59e0b"; color="#0f172a"; border="1px solid #f59e0b"; }
  else if (status === "full") { bg="#450a0a"; color="#ef4444"; border="1px solid #7f1d1d"; cursor="not-allowed"; }
  else if (status === "almost") { bg="#451a03"; color="#f59e0b"; border="1px solid #92400e"; }
  else if (status === "available") { bg="#052e16"; color="#4ade80"; border="1px solid #14532d"; }
  if (isToday && status !== "selected") color = "#fff";
  return (
    <div onClick={() => status === "available" || status === "selected" ? onToggle(keyStr) : null}
      style={{ borderRadius:7, padding:"5px 2px", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:44, fontSize:13, border, background:bg, color, cursor }}>
      <span style={{ fontWeight: isToday ? 700 : 500 }}>{day}</span>
      {status !== "weekend" && <span style={{ fontSize:9, marginTop:2, opacity:0.85 }}>{count >= MAX_DIA ? "lleno" : `${count}/${MAX_DIA}`}</span>}
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("inicio");
  const [form, setForm] = useState({ nombre:"", celular:"", notas:"", numPerros:1, perros:[{nombre:"", raza:""}] });
  const [errors, setErrors] = useState({});
  const [plan, setPlan] = useState(null);
  const [diasSel, setDiasSel] = useState([]);
  const [semanaAviso, setSemanaAviso] = useState(null);
  const [calMes, setCalMes] = useState(hoy.getMonth());
  const [calAnio, setCalAnio] = useState(hoy.getFullYear());
  const [bookings, setBookings] = useState({});
  const [loginCel, setLoginCel] = useState("");
  const [loginErr, setLoginErr] = useState(false);
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [nuevosPerros, setNuevosPerros] = useState([{nombre:"", raza:""}]);


  // Cargar bookings de Firebase al inicio
  useEffect(() => {
    const cargarBookings = async () => {
      const snap = await getDocs(collection(db, "bookings"));
      const data = {};
      snap.forEach(d => { data[d.id] = d.data().count || 0; });
      setBookings(data);
    };
    cargarBookings();
  }, []);

  const getCount = (key) => bookings[key] || 0;

  const irAPlan = async () => {
    const errs = {};
    if (!form.nombre.trim()) errs.nombre = "Por favor escribe tu nombre";
    if (form.celular.length !== 10) errs.celular = "Ingresa un número válido de 10 dígitos";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setCargando(true);
    // Check if number already exists
    const snap = await getDoc(doc(db, "usuarios", form.celular));
    if (snap.exists()) {
      setErrors({ celular: "Este número ya está registrado. Usa ¿Ya estás registrado?" });
      setCargando(false); return;
    }
    setErrors({}); setPlan(null); setDiasSel([]); setSemanaAviso(null);
    setCargando(false);
    setScreen("plan");
  };

  const login = async () => {
    if (loginCel.length !== 10) { setLoginErr(true); return; }
    setLoginErr(false); setCargando(true);
    const snap = await getDoc(doc(db, "usuarios", loginCel));
    if (!snap.exists()) { setLoginErr(true); setCargando(false); return; }
    setUsuarioActual({ celular: loginCel, ...snap.data() });
    setCargando(false);
    setScreen("misDias");
  };

  const irACalendario = () => {
    if (!plan) { setErrors({ plan:"Elige un plan para continuar" }); return; }
    setErrors({}); setDiasSel([]); setSemanaAviso(null);
    setCalMes(hoy.getMonth()); setCalAnio(hoy.getFullYear());
    setScreen("calendario");
  };

  const toggleDiaSemanal = (key) => {
    setSemanaAviso(null);
    if (diasSel.includes(key)) { setDiasSel([]); return; }
    const cinco = get5HabilesDesde(key);
    const todayMidnight = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    const bloqueados = cinco.filter(k => {
      const d = keyToDate(k);
      return (MAX_DIA - getCount(k)) < form.numPerros || d <= todayMidnight;
    });
    if (bloqueados.length > 0) {
      setSemanaAviso(`Uno o más días de esa semana no tienen espacio para ${form.numPerros} perro${form.numPerros>1?"s":""}. Intenta otra semana.`);
      setDiasSel([]);
      return;
    }
    setDiasSel(cinco);
  };

  const toggleDiaIndividual = (key) => {
    setSemanaAviso(null);
    const remaining = MAX_DIA - getCount(key);
    if (remaining < form.numPerros) {
      setSemanaAviso(`Este día no tiene espacio para ${form.numPerros} perro${form.numPerros>1?"s":""}.`);
      return;
    }
    setDiasSel(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const toggleDia = (key) => {
    if (plan === "semanal") toggleDiaSemanal(key);
    else toggleDiaIndividual(key);
  };

  const cambiarMes = (dir) => {
    setCalMes(m => {
      const nm = m + dir;
      if (nm < 0) { setCalAnio(a => a - 1); return 11; }
      if (nm > 11) { setCalAnio(a => a + 1); return 0; }
      return nm;
    });
  };

  const reservar = async () => {
    if (plan === "semanal" && diasSel.length !== 5) { setErrors({ dias:"Selecciona un día de la semana que quieras" }); return; }
    if (diasSel.length === 0) { setErrors({ dias:"Selecciona al menos un día" }); return; }
    setErrors({});
    setCargando(true);
    try {
      // Guardar/actualizar usuario en Firestore
      const usuarioRef = doc(db, "usuarios", form.celular);
      const usuarioSnap = await getDoc(usuarioRef);
      if (usuarioSnap.exists()) {
        const diasActuales = usuarioSnap.data().dias || [];
        await updateDoc(usuarioRef, { dias: [...diasActuales, ...diasSel] });
      } else {
        await setDoc(usuarioRef, {
          nombre: form.nombre,
          celular: form.celular,
          notas: form.notas,
          numPerros: form.numPerros,
          plan: plan,
          dias: diasSel,
          fechaRegistro: new Date().toLocaleDateString("es-MX"),
        });
      }
      // Actualizar bookings en Firestore
      const newBookings = { ...bookings };
      for (const k of diasSel) {
        const bookingRef = doc(db, "bookings", k);
        const nuevoCount = (newBookings[k] || 0) + form.numPerros;
        await setDoc(bookingRef, { count: nuevoCount });
        newBookings[k] = nuevoCount;
      }
      setBookings(newBookings);
      setScreen("gracias");
    } catch (e) {
      setErrors({ dias:"Ocurrió un error, intenta de nuevo." });
    }
    setCargando(false);
  };

  const reiniciar = () => {
    setForm({ nombre:"", celular:"", notas:"", numPerros:1, perros:[{nombre:"", raza:""}] });
    setPlan(null); setDiasSel([]); setSemanaAviso(null);
    setScreen("inicio");
  };

  const renderCalendario = () => {
    const { offset, total } = getMonthDays(calAnio, calMes);
    const cells = [...Array(offset).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)];
    return (
      <>
        <div style={S.calHeader}>
          <button style={S.calNav} onClick={() => cambiarMes(-1)}>‹</button>
          <span style={S.calTitle}>{MESES[calMes]} {calAnio}</span>
          <button style={S.calNav} onClick={() => cambiarMes(1)}>›</button>
        </div>
        <div style={S.calGrid}>
          {["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"].map(d => <div key={d} style={S.calDayLabel}>{d}</div>)}
          {cells.map((day, i) => {
            if (!day) return <div key={i} />;
            const key = dateKey(calAnio, calMes, day);
            const dow = new Date(calAnio, calMes, day).getDay();
            const isWeekend = dow === 0 || dow === 6;
            const isToday = calAnio === hoy.getFullYear() && calMes === hoy.getMonth() && day === hoy.getDate();
            const isPast = new Date(calAnio, calMes, day) < new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
            const count = getCount(key);
            const remaining = MAX_DIA - count;
            const full = remaining < form.numPerros;
            const almost = remaining <= 2 && !full;
            const selected = diasSel.includes(key);
            let status = "available";
            if (isWeekend || isToday || isPast) status = "weekend";
            else if (selected) status = "selected";
            else if (full) status = "full";
            else if (almost) status = "almost";
            return <CalDay key={i} day={day} keyStr={key} count={count} status={status}
              onToggle={toggleDia} calYear={calAnio} calMonth={calMes} />;
          })}
        </div>
      </>
    );
  };

  // ── PANTALLAS ──────────────────────────────────────────────────────────────

  if (screen === "inicio") return (
    <div style={S.root}><div style={S.wrap}>
      <p style={{ fontSize:32, fontWeight:700, color:"#f8fafc", margin:"0 0 4px" }}>🐾 Paseador de perros</p>
      <p style={{ fontSize:14, color:"#94a3b8", margin:"0 0 28px" }}>Tu perro merece salir. Nosotros lo llevamos.</p>
      <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:32 }}>
        {[
          ["🧠","Reduce el estrés","Más tranquilo, menos destructivo."],
          ["❤️","Cuida su corazón","Ejercicio diario, vida más larga."],
          ["🐾","Mejor comportamiento","Perro cansado, perro bien portado."],
          ["🌍","Estimulación mental","Explorar activa su cerebro."],
          ["🤝","Más sociable","Menos miedo, más confianza."],
        ].map(([emoji, titulo, desc]) => (
          <div key={titulo} style={{ display:"flex", gap:14, alignItems:"flex-start", background:"#1e293b", borderRadius:12, padding:"12px 14px", border:"1px solid #334155" }}>
            <span style={{ fontSize:24, flexShrink:0 }}>{emoji}</span>
            <div>
              <p style={{ fontSize:14, fontWeight:700, color:"#f8fafc", margin:"0 0 2px" }}>{titulo}</p>
              <p style={{ fontSize:13, color:"#94a3b8", margin:0 }}>{desc}</p>
            </div>
          </div>
        ))}
      </div>
      <button style={S.btnPrimary} onClick={() => setScreen("registro")}>Reservar mi paseo</button>
      <button style={S.btnGhost} onClick={() => { setLoginCel(""); setLoginErr(false); setScreen("registrado"); }}>¿Ya estás registrado?</button>
    </div></div>
  );

  if (screen === "registro") return (
    <div style={S.root}><div style={S.wrap}>
      <p style={S.title}>Reserva tu paseo 🐾</p>
      <p style={S.sub}>Completa tus datos para continuar</p>
      <div style={S.field}>
        <label style={S.label}>Nombre del dueño</label>
        <input style={S.input} placeholder="Ej. María García" value={form.nombre}
          onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} />
        {errors.nombre && <p style={S.err}>{errors.nombre}</p>}
      </div>
      <div style={S.field}>
        <label style={S.label}>Número celular</label>
        <div style={S.phoneRow}>
          <span style={S.phonePrefix}>🇲🇽 +52</span>
          <input style={S.phoneInput} placeholder="10 dígitos" maxLength={10} value={form.celular}
            onChange={e => setForm(f => ({ ...f, celular: e.target.value.replace(/\D/g,"") }))} />
        </div>
        {errors.celular && <p style={S.err}>{errors.celular}</p>}
      </div>
      <div style={S.field}>
        <label style={S.label}>¿Cuántos perros?</label>
        <div style={S.perrosBtns}>
          {[1,2,3,4].map(n => (
            <button key={n} style={S.perroBtn(form.numPerros === n)}
              onClick={() => setForm(f => ({ ...f, numPerros: n, perros: Array.from({length:n}, (_,i) => f.perros[i] || {nombre:"", raza:""}) }))}>
              <div style={{ fontSize:15 }}>{n}</div>
              <div style={{ fontSize:11, marginTop:2 }}>{n===1?"perro":"perros"}</div>
            </button>
          ))}
        </div>
        <p style={{ fontSize:12, color:"#64748b", marginTop:6 }}>Se reservarán {form.numPerros} lugar{form.numPerros>1?"es":""} por día</p>
      </div>
      {Array.from({length: form.numPerros}).map((_, i) => (
        <div key={i} style={{ background:"#1e293b", border:"1px solid #334155", borderRadius:12, padding:"14px", marginBottom:12 }}>
          <p style={{ fontSize:13, fontWeight:700, color:"#f59e0b", margin:"0 0 10px" }}>Perro {i+1}</p>
          <div style={S.field}>
            <label style={S.label}>Nombre</label>
            <input style={{ ...S.input, marginBottom:0 }} placeholder="Ej. Max" value={form.perros[i]?.nombre || ""}
              onChange={e => setForm(f => { const p=[...f.perros]; p[i]={...p[i], nombre:e.target.value}; return {...f, perros:p}; })} />
          </div>
          <div style={{ marginTop:10 }}>
            <label style={S.label}>Raza (opcional)</label>
            <input style={{ ...S.input, marginBottom:0 }} placeholder="Ej. Labrador" value={form.perros[i]?.raza || ""}
              onChange={e => setForm(f => { const p=[...f.perros]; p[i]={...p[i], raza:e.target.value}; return {...f, perros:p}; })} />
          </div>
        </div>
      ))}
      <div style={S.field}>
        <label style={S.label}>Notas (opcional)</label>
        <textarea style={S.textarea} placeholder="Ej. Perro ansioso, lleva snack" value={form.notas}
          onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} />
      </div>
      <button style={{ ...S.btnPrimary, opacity: cargando ? 0.6 : 1 }} onClick={irAPlan} disabled={cargando}>
        {cargando ? "Verificando..." : "Continuar"}
      </button>
      <button style={S.btnGhost} onClick={() => setScreen("inicio")}>← Volver</button>
    </div></div>
  );

  if (screen === "plan") return (
    <div style={S.root}><div style={S.wrap}>
      <p style={S.title}>Elige tu plan</p>
      <p style={S.sub}>¿Cómo prefieres contratar el servicio?</p>
      <div style={S.planGrid}>
        <div style={S.planCard(plan === "semanal")} onClick={() => { setPlan("semanal"); setErrors({}); }}>
          <div style={S.planEmoji}>📦</div>
          <div style={S.planName}>Paquete semanal</div>
          <div style={S.planPrice}>${[500,800,1200,1600][form.numPerros-1]}</div>
          <div style={S.planSub}>${[100,160,240,320][form.numPerros-1]}/día · 5 días seguidos</div>
        </div>
        <div style={S.planCard(plan === "individual")} onClick={() => { setPlan("individual"); setErrors({}); }}>
          <div style={S.planEmoji}>🎟️</div>
          <div style={S.planName}>Paseo individual</div>
          <div style={S.planPrice}>${[150,300,450,600][form.numPerros-1]}</div>
          <div style={S.planSub}>por día · días libres</div>
        </div>
      </div>
      <div style={{ background:"#0f172a", border:"2px solid #334155", borderRadius:12, padding:"14px 16px", marginBottom:14, display:"flex", alignItems:"center", gap:12 }}>
        <span style={{ fontSize:28 }}>🕖</span>
        <div>
          <p style={{ fontSize:15, fontWeight:700, color:"#f8fafc", margin:"0 0 2px" }}>1 hora de paseo diario</p>
          <p style={{ fontSize:13, color:"#94a3b8", margin:0 }}>Todos los paseos son a las <strong style={{ color:"#f59e0b" }}>7:00 AM</strong>, de lunes a viernes</p>
        </div>
      </div>
      {form.numPerros > 1 && (
        <div style={{ ...S.infoBox, borderColor:"#92400e", color:"#fde68a", marginBottom:16 }}>
          💡 Descuento por volumen aplicado para <strong>{form.numPerros} perros</strong>
        </div>
      )}
      {errors.plan && <p style={{ ...S.err, marginBottom:8 }}>{errors.plan}</p>}
      <button style={S.btnPrimary} onClick={irACalendario}>Elegir fecha</button>
      <button style={S.btnGhost} onClick={() => setScreen("registro")}>Cancelar</button>
    </div></div>
  );

  if (screen === "calendario") return (
    <div style={S.root}><div style={S.wrap}>
      <p style={S.title}>{plan === "semanal" ? "Elige tu semana" : "Elige tus días"}</p>
      <p style={S.sub}>{plan === "semanal" ? "Selecciona cualquier día hábil y se marcará esa semana completa (lun–vie)" : ""}</p>
      <div style={S.infoBox}>
        {plan === "semanal"
          ? diasSel.length === 5
            ? <><strong style={{ color:"#4ade80" }}>¡Listo!</strong> Semana seleccionada — {diasSel.length} días</>
            : "Selecciona cualquier día de la semana que quieras"
          : diasSel.length === 0
            ? "Selecciona los días que quieras reservar"
            : <><strong style={{ color:"#f8fafc" }}>{diasSel.length} día{diasSel.length>1?"s":""}</strong> seleccionado{diasSel.length>1?"s":""}</>}
      </div>
      {semanaAviso && <p style={{ ...S.warn, marginBottom:10 }}>⚠️ {semanaAviso}</p>}
      <div style={S.legend}>
        <span style={S.legItem}><span style={S.legDot("#4ade80")} />Disponible</span>
        <span style={S.legItem}><span style={S.legDot("#f59e0b")} />Casi lleno</span>
        <span style={S.legItem}><span style={S.legDot("#ef4444")} />Lleno</span>
      </div>
      {renderCalendario()}
      {errors.dias && <p style={{ ...S.err, marginBottom:8 }}>{errors.dias}</p>}
      <button style={{ ...S.btnPrimary, opacity: cargando ? 0.6 : 1 }} onClick={reservar} disabled={cargando}>
        {cargando ? "Guardando..." : "Reservar"}
      </button>
      <button style={S.btnGhost} onClick={() => setScreen("plan")}>Cancelar</button>
    </div></div>
  );

  if (screen === "gracias") return (
    <div style={S.root}><div style={S.wrap}>
      <p style={S.thanksTitle}>¡Gracias!</p>
      <p style={S.thanksMsg}>Tu paseador de perros te hablará por mensaje para acordar la manera de pago y tu ubicación para recoger a tu perro o perros.</p>
      <hr style={S.divider} />
      <p style={S.secLabel}>Días reservados · {form.numPerros} perro{form.numPerros>1?"s":""}</p>
      <div style={{ marginBottom:24 }}>
        {[...diasSel].sort().map(k => {
          const [a, m, d] = k.split("-");
          const fecha = new Date(+a, +m - 1, +d);
          const label = fecha.toLocaleDateString("es-MX", { weekday:"long", day:"numeric", month:"long" });
          return <span key={k} style={S.chip}>{label}</span>;
        })}
      </div>
      <button style={S.btnPrimary} onClick={reiniciar}>Volver al inicio</button>
    </div></div>
  );

  if (screen === "registrado") return (
    <div style={S.root}><div style={S.wrap}>
      <p style={S.title}>Ya estás registrado</p>
      <p style={S.sub}>Ingresa tu número para ver tus reservaciones</p>
      <div style={S.field}>
        <label style={S.label}>Número celular</label>
        <div style={S.phoneRow}>
          <span style={S.phonePrefix}>🇲🇽 +52</span>
          <input style={S.phoneInput} placeholder="10 dígitos" maxLength={10} value={loginCel}
            onChange={e => { setLoginCel(e.target.value.replace(/\D/g,"")); setLoginErr(false); }} />
        </div>
        {loginErr && <p style={S.err}>Número no encontrado en el sistema</p>}
      </div>
      <button style={{ ...S.btnPrimary, opacity: cargando ? 0.6 : 1 }} onClick={login} disabled={cargando}>
        {cargando ? "Buscando..." : "Ver mis reservaciones"}
      </button>
      <button style={S.btnGhost} onClick={() => setScreen("inicio")}>← Volver</button>
    </div></div>
  );

  if (screen === "misDias") {
    const u = usuarioActual || {};
    return (
      <div style={S.root}><div style={S.wrap}>
        <p style={S.title}>Mis reservaciones</p>
        <p style={S.sub}>Hola {u.nombre} · {u.numPerros} perro{u.numPerros>1?"s":""}</p>
        <div style={{ marginBottom:20 }}>
          {!u.dias || u.dias.length === 0
            ? <p style={{ color:"#64748b", fontSize:14 }}>Sin días reservados aún</p>
            : [...new Set(u.dias)].sort().map(k => {
                const [a, m, d] = k.split("-");
                const fecha = new Date(+a, +m - 1, +d);
                const label = fecha.toLocaleDateString("es-MX", { weekday:"long", day:"numeric", month:"long" });
                return <span key={k} style={S.chip}>{label}</span>;
              })}
        </div>
        <button style={S.btnPrimary} onClick={() => {
          setForm({ nombre: u.nombre, celular: u.celular, notas: u.notas || "", numPerros: u.numPerros || 1, perros: u.perros || [{nombre:"",raza:""}] });
          setPlan(null); setDiasSel([]); setSemanaAviso(null);
          setScreen("plan");
        }}>+ Agregar más días</button>
        <button style={{ ...S.btnGhost, borderColor:"#f59e0b", color:"#f59e0b" }} onClick={() => {
          setNuevosPerros([{nombre:"", raza:""}]);
          setScreen("agregarPerro");
        }}>🐾 Agregar otro perro</button>
        <button style={S.btnGhost} onClick={() => setScreen("inicio")}>← Volver</button>
      </div></div>
    );
  }

  if (screen === "agregarPerro") {
    const u = usuarioActual || {};
    const maxPuedoAgregar = 4 - (u.numPerros || 1);
    return (
      <div style={S.root}><div style={S.wrap}>
        <p style={S.title}>Agregar perros</p>
        <p style={S.sub}>¿Cuántos perros quieres agregar?</p>
        <div style={S.field}>
          <label style={S.label}>Cantidad a agregar</label>
          <div style={S.perrosBtns}>
            {Array.from({length: maxPuedoAgregar}, (_, i) => i + 1).map(n => (
              <button key={n} style={S.perroBtn(nuevosPerros.length === n)}
                onClick={() => setNuevosPerros(Array.from({length:n}, (_,i) => nuevosPerros[i] || {nombre:"", raza:""}))}>
                <div style={{ fontSize:15 }}>+{n}</div>
                <div style={{ fontSize:11, marginTop:2 }}>{n===1?"perro":"perros"}</div>
              </button>
            ))}
          </div>
        </div>
        {nuevosPerros.map((_, i) => (
          <div key={i} style={{ background:"#1e293b", border:"1px solid #334155", borderRadius:12, padding:"14px", marginBottom:12 }}>
            <p style={{ fontSize:13, fontWeight:700, color:"#f59e0b", margin:"0 0 10px" }}>Perro nuevo {i+1}</p>
            <div style={S.field}>
              <label style={S.label}>Nombre</label>
              <input style={{ ...S.input, marginBottom:0 }} placeholder="Ej. Luna" value={nuevosPerros[i]?.nombre || ""}
                onChange={e => setNuevosPerros(p => { const np=[...p]; np[i]={...np[i], nombre:e.target.value}; return np; })} />
            </div>
            <div style={{ marginTop:10 }}>
              <label style={S.label}>Raza (opcional)</label>
              <input style={{ ...S.input, marginBottom:0 }} placeholder="Ej. Poodle" value={nuevosPerros[i]?.raza || ""}
                onChange={e => setNuevosPerros(p => { const np=[...p]; np[i]={...np[i], raza:e.target.value}; return np; })} />
            </div>
          </div>
        ))}
        <button style={S.btnPrimary} onClick={async () => {
          const newNum = (u.numPerros || 1) + nuevosPerros.length;
          const newPerros = [...(u.perros || []), ...nuevosPerros];
          const usuarioRef = doc(db, "usuarios", u.celular);
          await updateDoc(usuarioRef, { numPerros: newNum, perros: newPerros });
          const newU = { ...u, numPerros: newNum, perros: newPerros };
          setUsuarioActual(newU);
          setForm({ nombre: u.nombre, celular: u.celular, notas: u.notas || "", numPerros: newNum, perros: newPerros });
          setPlan(null); setDiasSel([]); setSemanaAviso(null);
          setScreen("plan");
        }}>Continuar</button>
        <button style={S.btnGhost} onClick={() => setScreen("misDias")}>← Volver</button>
      </div></div>
    );
  }

  return null;
}
