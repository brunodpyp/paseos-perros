import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs } from "firebase/firestore";

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
function formatFecha(key) {
  const [a, m, d] = key.split("-");
  const fecha = new Date(+a, +m - 1, +d);
  return fecha.toLocaleDateString("es-MX", { weekday:"short", day:"numeric", month:"short" });
}

const S = {
  root: { minHeight:"100vh", background:"#0f172a", fontFamily:"sans-serif", color:"#e2e8f0", paddingBottom:60, WebkitTapHighlightColor:"transparent" },
  wrap: { maxWidth:480, margin:"0 auto", padding:"20px 16px" },
  title: { fontSize:26, fontWeight:700, color:"#f8fafc", margin:"0 0 6px" },
  sub: { fontSize:14, color:"#94a3b8", margin:"0 0 24px", lineHeight:1.6 },
  label: { display:"block", fontSize:12, color:"#94a3b8", marginBottom:6, textTransform:"uppercase", letterSpacing:0.8 },
  field: { marginBottom:16 },
  input: { width:"100%", background:"#1e293b", border:"1px solid #334155", borderRadius:10, padding:"12px 14px", color:"#f8fafc", fontSize:16, outline:"none", boxSizing:"border-box" },
  textarea: { width:"100%", background:"#1e293b", border:"1px solid #334155", borderRadius:10, padding:"11px 14px", color:"#f8fafc", fontSize:14, outline:"none", boxSizing:"border-box", minHeight:72, resize:"none" },
  phoneRow: { display:"flex" },
  phonePrefix: { background:"#0f172a", border:"1px solid #334155", borderRight:"none", borderRadius:"10px 0 0 10px", padding:"0 12px", display:"flex", alignItems:"center", fontSize:14, color:"#94a3b8", whiteSpace:"nowrap" },
  phoneInput: { flex:1, background:"#1e293b", border:"1px solid #334155", borderRadius:"0 10px 10px 0", padding:"12px 14px", color:"#f8fafc", fontSize:16, outline:"none", width:"100%" },
  btnPrimary: { width:"100%", background:"#f59e0b", color:"#0f172a", border:"none", borderRadius:12, padding:"15px", fontWeight:700, fontSize:16, cursor:"pointer", marginBottom:8, touchAction:"manipulation" },
  btnGhost: { width:"100%", background:"none", color:"#94a3b8", border:"1px solid #334155", borderRadius:12, padding:"14px", fontWeight:500, fontSize:14, cursor:"pointer", marginBottom:8, touchAction:"manipulation" },
  btnSmall: { background:"#1e293b", border:"1px solid #334155", borderRadius:8, padding:"6px 12px", fontSize:12, color:"#94a3b8", cursor:"pointer", fontWeight:500 },
  btnSmallAmber: { background:"#292524", border:"1px solid #f59e0b", borderRadius:8, padding:"6px 12px", fontSize:12, color:"#f59e0b", cursor:"pointer", fontWeight:500 },
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
  perroCard: { background:"#1e293b", border:"1px solid #334155", borderRadius:14, padding:"14px", marginBottom:12 },
  perroCardHeader: { display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 },
  perroNombre: { fontSize:16, fontWeight:700, color:"#f8fafc", margin:0 },
  perroRaza: { fontSize:12, color:"#64748b", margin:"2px 0 0" },
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
    <div onClick={() => (status === "available" || status === "selected" || status === "almost") ? onToggle(keyStr) : null}
      style={{ borderRadius:7, padding:"4px 2px", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:48, fontSize:13, border, background:bg, color, cursor, touchAction:"manipulation" }}>
      <span style={{ fontWeight: isToday ? 700 : 500 }}>{day}</span>
      {status !== "weekend" && <span style={{ fontSize:9, marginTop:2, opacity:0.85 }}>{count >= MAX_DIA ? "lleno" : `${count}/${MAX_DIA}`}</span>}
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("inicio");
  // Registro
  const [form, setForm] = useState({ nombre:"", celular:"", notas:"", numPerros:1, perros:[{nombre:"", raza:""}] });
  const [errors, setErrors] = useState({});
  // Plan y calendario
  const [plan, setPlan] = useState(null);
  const [diasSel, setDiasSel] = useState([]);
  const [semanaAviso, setSemanaAviso] = useState(null);
  const [calMes, setCalMes] = useState(hoy.getMonth());
  const [calAnio, setCalAnio] = useState(hoy.getFullYear());
  const [diasBloqueados, setDiasBloqueados] = useState([]);
  const [perroActivo, setPerroActivo] = useState(null); // { idx, nombre } — perro para el que se reserva
  // Firebase
  const [bookings, setBookings] = useState({});
  const [cargando, setCargando] = useState(false);
  // Login
  const [loginCel, setLoginCel] = useState("");
  const [loginErr, setLoginErr] = useState(false);
  const [usuarioActual, setUsuarioActual] = useState(null);
  // Agregar perro nuevo
  const [nuevosPerros, setNuevosPerros] = useState([{nombre:"", raza:"", notas:""}]);
  const [adminPass, setAdminPass] = useState("");
  const [adminData, setAdminData] = useState(null);
  const [adminErr, setAdminErr] = useState(false);
  const ADMIN_PASS = "brunod01142008";
  const [cancelarPerroIdx, setCancelarPerroIdx] = useState(null);
  const [diasACancelar, setDiasACancelar] = useState([]);

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

  // ── REGISTRO ───────────────────────────────────────────────────────────────
  const irAPlan = async () => {
    const errs = {};
    if (!form.nombre.trim()) errs.nombre = "Por favor escribe tu nombre";
    if (form.celular.length !== 10) errs.celular = "Ingresa un número válido de 10 dígitos";
    const sinNombre = form.perros.some(p => !p.nombre.trim());
    if (sinNombre) errs.perros = "El nombre de cada perro es obligatorio";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setCargando(true);
    const snap = await getDoc(doc(db, "usuarios", form.celular));
    if (snap.exists()) { setErrors({ celular:"Este número ya está registrado. Usa ¿Ya estás registrado?" }); setCargando(false); return; }
    setErrors({});
    // Primer perro por defecto
    setPerroActivo({ idx:0, nombre: form.perros[0].nombre });
    setDiasBloqueados([]);
    setPlan(null); setDiasSel([]); setSemanaAviso(null);
    setCargando(false);
    setScreen("plan");
  };

  // ── LOGIN ──────────────────────────────────────────────────────────────────
  const login = async () => {
    if (loginCel.length !== 10) { setLoginErr(true); return; }
    setLoginErr(false); setCargando(true);
    const snap = await getDoc(doc(db, "usuarios", loginCel));
    if (!snap.exists()) { setLoginErr(true); setCargando(false); return; }
    setUsuarioActual({ celular: loginCel, ...snap.data() });
    setCargando(false);
    setScreen("misDias");
  };

  // ── CALENDARIO ─────────────────────────────────────────────────────────────
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
    const ahora = new Date();
    const todayMidnight = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    const bloqueados = cinco.filter(k => {
      const d = keyToDate(k);
      return getCount(k) >= MAX_DIA || d < todayMidnight || diasBloqueados.includes(k);
    });
    if (bloqueados.length > 0) {
      setSemanaAviso("Uno o más días de esa semana no tienen espacio. Intenta otra semana.");
      setDiasSel([]); return;
    }
    setDiasSel(cinco);
  };

  const toggleDiaIndividual = (key) => {
    setSemanaAviso(null);
    if (getCount(key) >= MAX_DIA) { setSemanaAviso("Este día no tiene espacio disponible."); return; }
    setDiasSel(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const toggleDia = (key) => plan === "semanal" ? toggleDiaSemanal(key) : toggleDiaIndividual(key);

  const cambiarMes = (dir) => {
    setCalMes(m => {
      const nm = m + dir;
      if (nm < 0) { setCalAnio(a => a - 1); return 11; }
      if (nm > 11) { setCalAnio(a => a + 1); return 0; }
      return nm;
    });
  };

  // ── RESERVAR ───────────────────────────────────────────────────────────────
  const reservar = async () => {
    if (plan === "semanal" && diasSel.length !== 5) { setErrors({ dias:"Selecciona una semana" }); return; }
    if (diasSel.length === 0) { setErrors({ dias:"Selecciona al menos un día" }); return; }
    setErrors({}); setCargando(true);
    try {
      const celular = usuarioActual?.celular || form.celular;
      const usuarioRef = doc(db, "usuarios", celular);
      const usuarioSnap = await getDoc(usuarioRef);
      // Actualizar días del perro activo
      if (usuarioSnap.exists()) {
        const data = usuarioSnap.data();
        const perrosActualizados = [...(data.perros || [])];
        if (perroActivo !== null) {
          const diasAnteriores = perrosActualizados[perroActivo.idx]?.dias || [];
          perrosActualizados[perroActivo.idx] = { ...perrosActualizados[perroActivo.idx], dias: [...diasAnteriores, ...diasSel] };
        }
        await updateDoc(usuarioRef, { perros: perrosActualizados });
        setUsuarioActual({ ...usuarioActual, perros: perrosActualizados });
      } else {
        // Nuevo usuario — guardar con perros y días
        const perrosConDias = form.perros.map((p, i) => ({ ...p, dias: i === (perroActivo?.idx || 0) ? diasSel : [] }));
        await setDoc(usuarioRef, {
          nombre: form.nombre, celular: celular, notas: form.notas,
          perros: perrosConDias, fechaRegistro: new Date().toLocaleDateString("es-MX"),
        });
      }
      // Actualizar bookings con info del dueño y perro
      const celularUsado = usuarioActual?.celular || form.celular;
      const nombreDueno = usuarioActual?.nombre || form.nombre;
      const nombrePerro = perroActivo ? (usuarioActual?.perros?.[perroActivo.idx]?.nombre || form.perros?.[perroActivo.idx]?.nombre || "") : "";
      const newBookings = { ...bookings };
      for (const k of diasSel) {
        const bookingRef = doc(db, "bookings", k);
        const snapB = await getDoc(bookingRef);
        const dataB = snapB.exists() ? snapB.data() : { count: 0, reservas: [] };
        const reservasActuales = dataB.reservas || [];
        const nuevoCount = (dataB.count || 0) + 1;
        await setDoc(bookingRef, {
          count: nuevoCount,
          reservas: [...reservasActuales, { dueno: nombreDueno, celular: celularUsado, perro: nombrePerro }]
        });
        newBookings[k] = nuevoCount;
      }
      setBookings(newBookings);

      // Check if there are more dogs without days
      const perrosActuales = usuarioActual?.perros || [];
      const snapFresh = await getDoc(doc(db, "usuarios", celular));
      const perrosFresh = snapFresh.exists() ? snapFresh.data().perros || [] : perrosActuales;
      if (snapFresh.exists()) setUsuarioActual({ celular, ...snapFresh.data() });

      // Always send email notification
      try {
        const celularNotif = usuarioActual?.celular || form.celular;
        const nombreNotif = usuarioActual?.nombre || form.nombre;
        const perroNotif = perroActivo ? (perrosFresh[perroActivo.idx]?.nombre || "") : "";
        await fetch("https://formsubmit.co/brunodpyp@gmail.com", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify({
            _subject: "Nueva reservación - Paseador de perros",
            Nombre: nombreNotif,
            Celular: celularNotif,
            Perro: perroNotif,
            Dias: diasSel.join(", "),
            Plan: plan,
          })
        });
      } catch(e) { console.log("Email notification failed", e); }

      const siguienteIdx = perrosFresh.findIndex((p, i) => i > (perroActivo?.idx ?? -1) && (!p.dias || p.dias.length === 0));
      if (siguienteIdx !== -1) {
        // Go directly to plan for next dog
        setPerroActivo({ idx: siguienteIdx, nombre: perrosFresh[siguienteIdx].nombre });
        setDiasBloqueados([]);
        setPlan(null); setDiasSel([]); setSemanaAviso(null);
        setScreen("plan");
      } else {
        setScreen("gracias");
      }
    } catch (e) { setErrors({ dias:"Ocurrió un error, intenta de nuevo." }); }
    setCargando(false);
  };

  const reiniciar = () => {
    setForm({ nombre:"", celular:"", notas:"", numPerros:1, perros:[{nombre:"", raza:""}] });
    setPlan(null); setDiasSel([]); setSemanaAviso(null); setDiasBloqueados([]); setPerroActivo(null);
    setUsuarioActual(null); setLoginCel("");
    setScreen("inicio");
  };

  // ── RENDER CALENDARIO ──────────────────────────────────────────────────────
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
            const ahora2 = new Date(); const isPast = new Date(calAnio, calMes, day) < new Date(ahora2.getFullYear(), ahora2.getMonth(), ahora2.getDate());
            const isBloqueado = diasBloqueados.includes(key);
            const count = getCount(key);
            const full = count >= MAX_DIA;
            // full is simply when all 5 spots are taken
            const almost = count >= 3 && !full;
            const selected = diasSel.includes(key);
            let status = "available";
            if (isWeekend || isToday || isPast || isBloqueado) status = "weekend";
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

  // ═══════════════════════════════════════════════════════════════════════════
  // PANTALLAS
  // ═══════════════════════════════════════════════════════════════════════════

  if (screen === "inicio") return (
    <div style={S.root}><div style={S.wrap}>
      <p style={{ fontSize:32, fontWeight:700, color:"#f8fafc", margin:"0 0 4px" }} onClick={() => {
        const now = Date.now();
        if (!window._adminTaps) window._adminTaps = [];
        window._adminTaps = window._adminTaps.filter(t => now - t < 3000);
        window._adminTaps.push(now);
        if (window._adminTaps.length >= 5) { window._adminTaps = []; setScreen("adminLogin"); }
      }}>🐾 Paseador de perros</p>
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
      <a href="https://wa.me/528129816903?text=Hola,%20tengo%20una%20pregunta%20sobre%20el%20servicio%20de%20paseador%20de%20perros"
        target="_blank" rel="noopener noreferrer"
        style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, width:"100%", background:"#14532d", border:"1px solid #16a34a", borderRadius:12, padding:"12px", fontWeight:600, fontSize:14, color:"#4ade80", textDecoration:"none", marginBottom:8, boxSizing:"border-box" }}>
        💬 ¿Dudas? Escríbeme por WhatsApp
      </a>
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
              onClick={() => setForm(f => ({ ...f, numPerros:n, perros: Array.from({length:n}, (_,i) => f.perros[i] || {nombre:"",raza:""}) }))}>
              <div style={{ fontSize:15 }}>{n}</div>
              <div style={{ fontSize:11, marginTop:2 }}>{n===1?"perro":"perros"}</div>
            </button>
          ))}
        </div>
      </div>
      {Array.from({length: form.numPerros}).map((_, i) => (
        <div key={i} style={{ background:"#1e293b", border:"1px solid #334155", borderRadius:12, padding:"14px", marginBottom:12 }}>
          <p style={{ fontSize:13, fontWeight:700, color:"#f59e0b", margin:"0 0 10px" }}>Perro {i+1}</p>
          <div style={S.field}>
            <label style={S.label}>Nombre *</label>
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
      {errors.perros && <p style={{ ...S.err, marginBottom:8 }}>{errors.perros}</p>}
      <div style={S.field}>
        <label style={S.label}>Notas generales (opcional)</label>
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
      {perroActivo && <div style={{ ...S.infoBox, borderColor:"#f59e0b", color:"#f59e0b", marginBottom:16 }}>🐾 Reservando para: <strong>{perroActivo.nombre}</strong></div>}
      <p style={S.sub}>¿Cómo prefieres contratar el servicio?</p>
      {(() => {
        // Count how many other dogs have a semanal package
        // We'll calculate the discount at calendar time when we know the week
        // For now show base price, discount shown after week selection
        return (
          <>
            <div style={S.planGrid}>
              <div style={S.planCard(plan === "semanal")} onClick={() => { setPlan("semanal"); setErrors({}); }}>
                <div style={S.planEmoji}>📦</div>
                <div style={S.planName}>Paquete semanal</div>
                <div style={S.planPrice}>$500</div>
                <div style={S.planSub}>$100/día · 5 días seguidos</div>
              </div>
              <div style={S.planCard(plan === "individual")} onClick={() => { setPlan("individual"); setErrors({}); }}>
                <div style={S.planEmoji}>🎟️</div>
                <div style={S.planName}>Paseo individual</div>
                <div style={S.planPrice}>$150</div>
                <div style={S.planSub}>por día · días libres</div>
              </div>
            </div>
            {(usuarioActual?.perros?.length || 0) > 1 && plan === "semanal" && (
              <div style={{ ...S.infoBox, borderColor:"#92400e", color:"#fde68a", marginBottom:14 }}>
                💡 Si eliges la misma semana que otro de tus perros, aplica descuento por volumen
              </div>
            )}
          </>
        );
      })()}
      <div style={{ background:"#0f172a", border:"2px solid #334155", borderRadius:12, padding:"14px 16px", marginBottom:14, display:"flex", alignItems:"center", gap:12 }}>
        <span style={{ fontSize:28 }}>🕖</span>
        <div>
          <p style={{ fontSize:15, fontWeight:700, color:"#f8fafc", margin:"0 0 2px" }}>1 hora de paseo diario</p>
          <p style={{ fontSize:13, color:"#94a3b8", margin:0 }}>Todos los paseos son a las <strong style={{ color:"#f59e0b" }}>7:00 AM</strong>, de lunes a viernes</p>
        </div>
      </div>
      {plan === "semanal" && (
        <div style={{ ...S.infoBox, marginBottom:14 }}>
          📊 Lugares disponibles esta semana:
          {(() => {
            const ahora = new Date();
            const dow = (ahora.getDay() + 6) % 7;
            const lunes = new Date(ahora);
            lunes.setDate(ahora.getDate() - dow + 7); // next week's monday
            const dias = Array.from({length:5}, (_, i) => {
              const d = new Date(lunes);
              d.setDate(lunes.getDate() + i);
              return dateKey(d.getFullYear(), d.getMonth(), d.getDate());
            });
            const minDisponibles = Math.min(...dias.map(k => MAX_DIA - (bookings[k] || 0)));
            return <strong style={{ color: minDisponibles <= 2 ? "#f59e0b" : "#4ade80", marginLeft:6 }}>{minDisponibles} de {MAX_DIA}</strong>;
          })()}
        </div>
      )}
      {errors.plan && <p style={{ ...S.err, marginBottom:8 }}>{errors.plan}</p>}
      <button style={S.btnPrimary} onClick={irACalendario}>Elegir fecha</button>
      <button style={S.btnGhost} onClick={() => setScreen(usuarioActual ? "misDias" : "registro")}>← Volver</button>
    </div></div>
  );

  if (screen === "calendario") return (
    <div style={S.root}><div style={S.wrap}>
      <p style={S.title}>{plan === "semanal" ? "Elige tu semana" : "Elige tus días"}</p>
      {perroActivo && <div style={{ ...S.infoBox, borderColor:"#f59e0b", color:"#f59e0b", marginBottom:10 }}>🐾 Reservando para: <strong>{perroActivo.nombre}</strong></div>}
      <p style={S.sub}>{plan === "semanal" ? "Selecciona cualquier día hábil y se marcará esa semana completa" : ""}</p>
      <div style={S.infoBox}>
        {plan === "semanal"
          ? diasSel.length === 5
            ? (() => {
                // Check how many other dogs share this week
                const otrosPerros = (usuarioActual?.perros || []).filter((p, i) => i !== perroActivo?.idx && p.dias && diasSel.some(d => p.dias.includes(d)));
                const totalConDescuento = otrosPerros.length + 1;
                const precios = [500,800,1200,1600];
                const precio = precios[Math.min(totalConDescuento,4)-1];
                return (
                  <>
                    <strong style={{ color:"#4ade80" }}>¡Listo!</strong> Semana seleccionada
                    {totalConDescuento > 1
                      ? <span style={{ color:"#f59e0b", fontWeight:700 }}> · ${precio} con descuento por {totalConDescuento} perros 🎉</span>
                      : <span style={{ color:"#94a3b8" }}> · $500</span>}
                  </>
                );
              })()
            : "Selecciona cualquier día de la semana que quieras"
          : diasSel.length === 0 ? "Selecciona los días que quieras reservar"
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
      <button style={S.btnGhost} onClick={() => setScreen("plan")}>← Volver</button>
    </div></div>
  );

  if (screen === "gracias") return (
    <div style={S.root}><div style={S.wrap}>
      <p style={S.thanksTitle}>¡Gracias!</p>
      <p style={S.thanksMsg}>Tu paseador de perros te hablará por mensaje para acordar la manera de pago y tu ubicación para recoger a tu perro o perros.</p>
      <hr style={S.divider} />
      {perroActivo && <p style={S.secLabel}>Días reservados para {perroActivo.nombre}</p>}
      <div style={{ marginBottom:24 }}>
        {[...diasSel].sort().map(k => <span key={k} style={S.chip}>{formatFecha(k)}</span>)}
      </div>
      <button style={S.btnPrimary} onClick={() => {
        setDiasSel([]); setSemanaAviso(null);
        setScreen("misDias");
      }}>Ver mis reservaciones</button>
      <p style={{ fontSize:13, color:"#64748b", textAlign:"center", marginTop:8 }}>
        Para cancelar, entra a <strong style={{ color:"#94a3b8" }}>¿Ya estás registrado?</strong> y toca Cancelar reservación.
      </p>
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
    const perros = u.perros || [];
    return (
      <div style={S.root}><div style={S.wrap}>
        <p style={S.title}>Mis reservaciones</p>
        <p style={S.sub}>Hola {u.nombre}</p>
        {perros.length === 0 && <p style={{ color:"#64748b", fontSize:14 }}>Sin perros registrados aún</p>}
        {perros.map((perro, idx) => (
          <div key={idx} style={S.perroCard}>
            <div style={S.perroCardHeader}>
              <div>
                <p style={S.perroNombre}>{perro.nombre}</p>
                {perro.raza && <p style={S.perroRaza}>{perro.raza}</p>}
              </div>
              <button style={{ background:"none", border:"none", color:"#475569", fontSize:12, cursor:"pointer", padding:"2px 6px" }}
                onClick={async () => {
                  if (!window.confirm(`¿Seguro que quieres eliminar a ${perro.nombre}?`)) return;
                  const u = usuarioActual || {};
                  const perrosActualizados = (u.perros || []).filter((_, i) => i !== idx);
                  // Free up bookings for this dog's days
                  const newBookings = { ...bookings };
                  for (const k of (perro.dias || [])) {
                    const bookingRef = doc(db, "bookings", k);
                    const snapB = await getDoc(bookingRef);
                    if (snapB.exists()) {
                      const nuevoCount = Math.max(0, (snapB.data().count || 0) - 1);
                      if (nuevoCount === 0) {
                        await deleteDoc(bookingRef);
                        delete newBookings[k];
                      } else {
                        let removido = false;
                        const reservasFiltradas = (snapB.data().reservas || []).filter(r => {
                          if (!removido && r.perro === perro.nombre) { removido = true; return false; }
                          return true;
                        });
                        await setDoc(bookingRef, { count: nuevoCount, reservas: reservasFiltradas });
                        newBookings[k] = nuevoCount;
                      }
                    }
                  }
                  await updateDoc(doc(db, "usuarios", u.celular), { perros: perrosActualizados });
                  setBookings(newBookings);
                  setUsuarioActual({ ...u, perros: perrosActualizados });
                }}>🗑️ Borrar</button>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:10 }}>
              <button style={S.btnSmallAmber} onClick={() => {
                setPerroActivo({ idx, nombre: perro.nombre });
                setDiasBloqueados(perro.dias || []);
                setPlan(null); setDiasSel([]); setSemanaAviso(null);
                setScreen("plan");
              }}>+ Reservar para {perro.nombre}</button>
              {perro.dias && perro.dias.length > 0 && (
                <button style={{ ...S.btnSmall, borderColor:"#ef4444", color:"#ef4444", width:"100%", padding:"6px 0", textAlign:"center" }} onClick={() => {
                  setCancelarPerroIdx(idx);
                  setDiasACancelar([]);
                  setScreen("cancelar");
                }}>Cancelar reservación de {perro.nombre}</button>
              )}
            </div>
            <div>
              {!perro.dias || perro.dias.length === 0
                ? <p style={{ fontSize:12, color:"#475569" }}>Sin días reservados</p>
                : [...new Set(perro.dias)].sort().map(k => <span key={k} style={S.chip}>{formatFecha(k)}</span>)}
            </div>
            {perro.notas && <p style={{ fontSize:12, color:"#64748b", marginTop:8 }}>📝 {perro.notas}</p>}
          </div>
        ))}
        <hr style={S.divider} />
        {perros.length < 4 && (
          <button style={{ ...S.btnGhost, borderColor:"#f59e0b", color:"#f59e0b" }} onClick={() => {
            setNuevosPerros([{nombre:"", raza:"", notas:""}]);
            setScreen("agregarPerro");
          }}>🐾 Agregar otro perro</button>
        )}
        <button style={S.btnGhost} onClick={() => { setUsuarioActual(null); setLoginCel(""); setScreen("inicio"); }}>← Volver</button>
      </div></div>
    );
  }

  if (screen === "agregarPerro") {
    const u = usuarioActual || {};
    const numActual = (u.perros || []).length;
    const maxPuedoAgregar = Math.max(1, 4 - numActual);
    return (
      <div style={S.root}><div style={S.wrap}>
        <p style={S.title}>Agregar perros</p>
        <p style={S.sub}>¿Cuántos perros quieres agregar?</p>
        <div style={S.field}>
          <label style={S.label}>Cantidad a agregar</label>
          <div style={S.perrosBtns}>
            {Array.from({length: maxPuedoAgregar}, (_, i) => i + 1).map(n => (
              <button key={n} style={S.perroBtn(nuevosPerros.length === n)}
                onClick={() => setNuevosPerros(Array.from({length:n}, (_,i) => nuevosPerros[i] || {nombre:"", raza:"", notas:""}))}>
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
              <label style={S.label}>Nombre *</label>
              <input style={{ ...S.input, marginBottom:0 }} placeholder="Ej. Luna" value={nuevosPerros[i]?.nombre || ""}
                onChange={e => setNuevosPerros(p => { const np=[...p]; np[i]={...np[i], nombre:e.target.value}; return np; })} />
            </div>
            <div style={{ marginTop:10 }}>
              <label style={S.label}>Raza (opcional)</label>
              <input style={{ ...S.input, marginBottom:0 }} placeholder="Ej. Poodle" value={nuevosPerros[i]?.raza || ""}
                onChange={e => setNuevosPerros(p => { const np=[...p]; np[i]={...np[i], raza:e.target.value}; return np; })} />
            </div>
            <div style={{ marginTop:10 }}>
              <label style={S.label}>Notas (opcional)</label>
              <input style={{ ...S.input, marginBottom:0 }} placeholder="Ej. Perro ansioso, lleva snack" value={nuevosPerros[i]?.notas || ""}
                onChange={e => setNuevosPerros(p => { const np=[...p]; np[i]={...np[i], notas:e.target.value}; return np; })} />
            </div>
          </div>
        ))}
        <button style={S.btnPrimary} onClick={async () => {
          const sinNombre = nuevosPerros.some(p => !p.nombre.trim());
          if (sinNombre) { alert("El nombre de cada perro es obligatorio"); return; }
          setCargando(true);
          const perrosActuales = u.perros || [];
          const perrosConDias = nuevosPerros.map(p => ({ ...p, dias:[] }));
          const newPerros = [...perrosActuales, ...perrosConDias];
          const usuarioRef = doc(db, "usuarios", u.celular);
          await updateDoc(usuarioRef, { perros: newPerros });
          const newU = { ...u, perros: newPerros };
          setUsuarioActual(newU);
          // Ir a reservar días para el primer perro nuevo
          const primerNuevoIdx = perrosActuales.length;
          setPerroActivo({ idx: primerNuevoIdx, nombre: nuevosPerros[0].nombre });
          setDiasBloqueados([]);
          setPlan(null); setDiasSel([]); setSemanaAviso(null);
          setCargando(false);
          setScreen("plan");
        }}>Continuar</button>
        <button style={S.btnGhost} onClick={() => setScreen("misDias")}>← Volver</button>
      </div></div>
    );
  }

  if (screen === "cancelar") {
    const u = usuarioActual || {};
    const perros = u.perros || [];
    const perro = perros[cancelarPerroIdx] || {};
    const dias = [...(perro.dias || [])].sort();

    // Agrupar días en semanas (lun-vie consecutivos)
    const semanas = [];
    const diasUsados = new Set();
    dias.forEach(k => {
      if (diasUsados.has(k)) return;
      const cinco = get5HabilesDesde(k);
      const coinciden = cinco.filter(d => dias.includes(d));
      if (coinciden.length === 5) {
        semanas.push({ tipo:"semanal", dias: cinco, label: `${formatFecha(cinco[0])} – ${formatFecha(cinco[4])}` });
        cinco.forEach(d => diasUsados.add(d));
      }
    });
    // Días sueltos (no en ninguna semana completa)
    const diasSueltos = dias.filter(d => !diasUsados.has(d));

    const toggleCancelar = (key) => {
      setDiasACancelar(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
    };
    const toggleSemana = (diasSemana) => {
      const todosSeleccionados = diasSemana.every(d => diasACancelar.includes(d));
      if (todosSeleccionados) setDiasACancelar(prev => prev.filter(d => !diasSemana.includes(d)));
      else setDiasACancelar(prev => [...new Set([...prev, ...diasSemana])]);
    };

    const confirmarCancelacion = async () => {
      if (diasACancelar.length === 0) { alert("Selecciona al menos un día o semana para cancelar"); return; }
      setCargando(true);
      try {
        const celular = u.celular;
        const perrosActualizados = [...perros];
        perrosActualizados[cancelarPerroIdx] = {
          ...perrosActualizados[cancelarPerroIdx],
          dias: (perrosActualizados[cancelarPerroIdx].dias || []).filter(d => !diasACancelar.includes(d))
        };
        await updateDoc(doc(db, "usuarios", celular), { perros: perrosActualizados });
        // Restar de bookings
        const celularCancelar = u.celular;
        const nombrePerroCancelar = perros[cancelarPerroIdx]?.nombre || "";
        const newBookings = { ...bookings };
        for (const k of diasACancelar) {
          const bookingRef = doc(db, "bookings", k);
          const snapB = await getDoc(bookingRef);
          if (snapB.exists()) {
            const dataB = snapB.data();
            const nuevoCount = Math.max(0, (dataB.count || 0) - 1);
            if (nuevoCount === 0) {
              await deleteDoc(bookingRef);
              delete newBookings[k];
            } else {
              let removido = false;
              const reservasFiltradas = (dataB.reservas || []).filter(r => {
                if (!removido && r.celular === celularCancelar && r.perro === nombrePerroCancelar) {
                  removido = true;
                  return false;
                }
                return true;
              });
              await setDoc(bookingRef, { count: nuevoCount, reservas: reservasFiltradas });
              newBookings[k] = nuevoCount;
            }
          }
        }
        setBookings(newBookings);
        setUsuarioActual({ ...u, perros: perrosActualizados });
        setDiasACancelar([]);
        setScreen("misDias");
      } catch(e) { alert("Ocurrió un error, intenta de nuevo."); }
      setCargando(false);
    };

    return (
      <div style={S.root}><div style={S.wrap}>
        <p style={S.title}>Cancelar reservación</p>
        <p style={S.sub}>Selecciona los días que quieres cancelar para <strong style={{ color:"#f59e0b" }}>{perro.nombre}</strong></p>

        {semanas.length > 0 && (
          <>
            <p style={S.secLabel}>Semanas</p>
            {semanas.map((sem, i) => {
              const seleccionada = sem.dias.every(d => diasACancelar.includes(d));
              return (
                <div key={i} onClick={() => toggleSemana(sem.dias)}
                  style={{ background: seleccionada ? "#450a0a" : "#1e293b", border: seleccionada ? "1px solid #ef4444" : "1px solid #334155", borderRadius:12, padding:"12px 14px", marginBottom:8, cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:14, color: seleccionada ? "#ef4444" : "#f8fafc" }}>📅 {sem.label}</span>
                  <span style={{ fontSize:12, color: seleccionada ? "#ef4444" : "#64748b" }}>{seleccionada ? "✓ Seleccionada" : "5 días"}</span>
                </div>
              );
            })}
          </>
        )}

        {diasSueltos.length > 0 && (
          <>
            <p style={{ ...S.secLabel, marginTop: semanas.length > 0 ? 12 : 0 }}>Días individuales</p>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:16 }}>
              {diasSueltos.map(k => {
                const sel = diasACancelar.includes(k);
                return (
                  <div key={k} onClick={() => toggleCancelar(k)}
                    style={{ padding:"8px 14px", borderRadius:20, fontSize:13, cursor:"pointer", background: sel ? "#450a0a" : "#1e293b", color: sel ? "#ef4444" : "#94a3b8", border: sel ? "1px solid #ef4444" : "1px solid #334155" }}>
                    {formatFecha(k)}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {diasACancelar.length > 0 && (
          <div style={{ ...S.infoBox, borderColor:"#ef4444", color:"#fca5a5", marginBottom:14 }}>
            ⚠️ Se cancelarán <strong>{diasACancelar.length} día{diasACancelar.length>1?"s":""}</strong>. Esta acción no se puede deshacer.
          </div>
        )}

        <button style={{ ...S.btnPrimary, background:"#ef4444", opacity: cargando ? 0.6 : 1 }} onClick={confirmarCancelacion} disabled={cargando}>
          {cargando ? "Cancelando..." : "Confirmar cancelación"}
        </button>
        <button style={S.btnGhost} onClick={() => setScreen("misDias")}>← Volver</button>
      </div></div>
    );
  }

  if (screen === "adminLogin") return (
    <div style={S.root}><div style={S.wrap}>
      <p style={S.title}>Acceso administrativo</p>
      <p style={S.sub}>Ingresa la contraseña para continuar</p>
      <div style={S.field}>
        <label style={S.label}>Contraseña</label>
        <input style={S.input} type="password" placeholder="••••••••" value={adminPass}
          onChange={e => { setAdminPass(e.target.value); setAdminErr(false); }} />
        {adminErr && <p style={S.err}>Contraseña incorrecta</p>}
      </div>
      <button style={S.btnPrimary} onClick={async () => {
        if (adminPass !== ADMIN_PASS) { setAdminErr(true); return; }
        setCargando(true);
        // Load all users
        const snap = await getDocs(collection(db, "usuarios"));
        const users = [];
        snap.forEach(d => users.push(d.data()));
        // Load all bookings
        const snapB = await getDocs(collection(db, "bookings"));
        const bData = {};
        snapB.forEach(d => { bData[d.id] = d.data(); });
        // Load pagados
        const snapPag = await getDoc(doc(db, "admin", "pagados"));
        const pagados = snapPag.exists() ? snapPag.data() : {};
        setAdminData({ users, bookings: bData, pagados });
        setCargando(false);
        setAdminPass("");
        setScreen("admin");
      }}>Entrar</button>
      <button style={S.btnGhost} onClick={() => { setAdminPass(""); setAdminErr(false); setScreen("inicio"); }}>← Volver</button>
    </div></div>
  );

  if (screen === "admin") {
    const { users = [], bookings: bk = {} } = adminData || {};

    // Group by week
    const semanas = {};
    users.forEach(u => {
      (u.perros || []).forEach(perro => {
        (perro.dias || []).forEach(dia => {
          const d = keyToDate(dia);
          const dow = d.getDay();
          const diff = (dow + 6) % 7;
          const lunes = new Date(d);
          lunes.setDate(d.getDate() - diff);
          const semKey = dateKey(lunes.getFullYear(), lunes.getMonth(), lunes.getDate());
          if (!semanas[semKey]) semanas[semKey] = [];
          // Check if already added this user+dog combo for this week
          const exists = semanas[semKey].find(e => e.celular === u.celular && e.perro === perro.nombre);
          if (!exists) {
            semanas[semKey].push({ nombre: u.nombre, celular: u.celular, perro: perro.nombre, raza: perro.raza || "" });
          }
        });
      });
    });

    const semanasOrdenadas = Object.keys(semanas).sort();

    // Calculate price per user per week
    const getPrecio = (celular, semKey) => {
      const user = users.find(u => u.celular === celular);
      if (!user) return 500;
      const perrosEnSemana = (user.perros || []).filter(p =>
        (p.dias || []).some(d => {
          const dt = keyToDate(d);
          const dow = dt.getDay();
          const diff = (dow + 6) % 7;
          const lunes = new Date(dt);
          lunes.setDate(dt.getDate() - diff);
          return dateKey(lunes.getFullYear(), lunes.getMonth(), lunes.getDate()) === semKey;
        })
      ).length;
      return [500,800,1200,1600][Math.min(perrosEnSemana,4)-1];
    };

    return (
      <div style={S.root}><div style={S.wrap}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <p style={S.title}>Panel Admin</p>
          <button style={S.btnSmall} onClick={() => setScreen("inicio")}>Salir</button>
        </div>

        {semanasOrdenadas.length === 0 && <p style={{ color:"#64748b" }}>Sin reservaciones aún</p>}

        {semanasOrdenadas.map(semKey => {
          const [a,m,d] = semKey.split("-");
          const lunes = new Date(+a, +m-1, +d);
          const viernes = new Date(lunes); viernes.setDate(lunes.getDate() + 4);
          const labelSem = `${lunes.getDate()} – ${viernes.getDate()} ${MESES[viernes.getMonth()]} ${viernes.getFullYear()}`;
          const entradas = semanas[semKey];

          // Group by user
          const porUsuario = {};
          entradas.forEach(e => {
            if (!porUsuario[e.celular]) porUsuario[e.celular] = { nombre: e.nombre, celular: e.celular, perros: [] };
            porUsuario[e.celular].perros.push(e.perro + (e.raza ? ` (${e.raza})` : ""));
          });

          return (
            <div key={semKey} style={{ background:"#1e293b", border:"1px solid #334155", borderRadius:14, padding:"14px", marginBottom:14 }}>
              <p style={{ fontSize:13, fontWeight:700, color:"#f59e0b", margin:"0 0 12px" }}>📅 Semana {labelSem}</p>
              {Object.values(porUsuario).map((u, i) => {
                const precio = getPrecio(u.celular, semKey);
                return (
                  <div key={i} style={{ borderTop: i > 0 ? "1px solid #334155" : "none", paddingTop: i > 0 ? 10 : 0, marginTop: i > 0 ? 10 : 0 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                      <div>
                        <p style={{ fontSize:15, fontWeight:700, color:"#f8fafc", margin:"0 0 2px" }}>{u.nombre}</p>
                        <p style={{ fontSize:12, color:"#64748b", margin:"0 0 4px" }}>📱 {u.celular}</p>
                        <p style={{ fontSize:12, color:"#94a3b8", margin:0 }}>🐾 {u.perros.join(", ")}</p>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <p style={{ fontSize:20, fontWeight:700, color:"#4ade80", margin:0 }}>${precio}</p>
                        <p style={{ fontSize:10, color:"#64748b", margin:"0 0 6px" }}>semanal</p>
                        <button style={{
                          background: (adminData.pagados?.[semKey+"-"+u.celular]) ? "#14532d" : "#1e293b",
                          border: (adminData.pagados?.[semKey+"-"+u.celular]) ? "1px solid #4ade80" : "1px solid #334155",
                          color: (adminData.pagados?.[semKey+"-"+u.celular]) ? "#4ade80" : "#64748b",
                          borderRadius:8, padding:"4px 10px", fontSize:11, cursor:"pointer", fontWeight:600
                        }} onClick={async () => {
                          const pagoKey = semKey+"-"+u.celular;
                          const nuevoEstado = !(adminData.pagados?.[pagoKey]);
                          const pagadosRef = doc(db, "admin", "pagados");
                          const snapPag = await getDoc(pagadosRef);
                          const pagadosActuales = snapPag.exists() ? snapPag.data() : {};
                          await setDoc(pagadosRef, { ...pagadosActuales, [pagoKey]: nuevoEstado });
                          setAdminData(prev => ({
                            ...prev,
                            pagados: { ...(prev.pagados||{}), [pagoKey]: nuevoEstado }
                          }));
                        }}>
                          {(adminData.pagados?.[semKey+"-"+u.celular]) ? "✓ Pagado" : "Marcar pagado"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div style={{ borderTop:"1px solid #334155", marginTop:10, paddingTop:10, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <p style={{ fontSize:12, color:"#64748b", margin:0 }}>Total a cobrar esta semana</p>
                <p style={{ fontSize:18, fontWeight:700, color:"#f59e0b", margin:0 }}>
                  ${Object.values(porUsuario).reduce((acc, u) => acc + getPrecio(u.celular, semKey), 0)}
                </p>
              </div>
            </div>
          );
        })}

        <hr style={S.divider} />
        <p style={S.secLabel}>Todos los clientes ({users.length})</p>
        {users.map((u, i) => (
          <div key={i} style={{ background:"#1e293b", border:"1px solid #334155", borderRadius:12, padding:"12px 14px", marginBottom:8 }}>
            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <div>
                <p style={{ fontSize:14, fontWeight:700, color:"#f8fafc", margin:"0 0 2px" }}>{u.nombre}</p>
                <p style={{ fontSize:12, color:"#64748b", margin:"0 0 4px" }}>📱 {u.celular}</p>
                {(u.perros || []).map((p, j) => (
                  <p key={j} style={{ fontSize:12, color:"#94a3b8", margin:"2px 0 0" }}>
                    🐾 {p.nombre}{p.raza ? ` · ${p.raza}` : ""} — {(p.dias || []).length} día{(p.dias||[]).length!==1?"s":""}
                  </p>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div></div>
    );
  }

  return null;
}
