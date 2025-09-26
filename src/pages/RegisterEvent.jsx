import { useEffect, useRef, useState } from "react";
import { nanoid } from "nanoid";
import useDebounce from "../lib/useDebounce.js";
import { apiVehicleSearch, apiCreateEvent, apiCreateVehicle } from "../lib/api.js";

export default function RegisterEvent() {
  const [plate, setPlate] = useState("");
  const [direction, setDirection] = useState("IN");
  const [notes, setNotes] = useState("");

  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");

  // creación rápida de vehículo
  const [showCreate, setShowCreate] = useState(false);
  const [vehicleType, setVehicleType] = useState("AUTO");
  const [creating, setCreating] = useState(false);

  const debounced = useDebounce(plate, 300);
  const listRef = useRef(null);

  // buscar sugerencias
  useEffect(() => {
    const q = debounced.trim();
    if (!q) { setResults([]); setOpen(false); setShowCreate(false); return; }
    apiVehicleSearch(q)
      .then(arr => {
        setResults(arr);
        setOpen(arr.length > 0);
        setShowCreate(arr.length === 0 && q.length >= 2);
      })
      .catch(() => { setResults([]); setOpen(false); setShowCreate(false); });
  }, [debounced]);

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    const idempotencyKey = nanoid();
    const clientAt = new Date().toISOString();
    try {
      const r = await apiCreateEvent({ plate, direction, idempotencyKey, clientAt, notes });
      setMsg(r?.duplicate ? "Evento duplicado (ignorado)" : "Evento registrado");
      setNotes("");
      setOpen(false);
      // no borramos plate para permitir OUT inmediato
    } catch {
      setMsg("Error registrando evento");
    }
  }

  async function createVehicle() {
    setCreating(true);
    setMsg("");
    try {
      await apiCreateVehicle({ plate, meta: { type: vehicleType } });
      setMsg(`Vehículo ${plate} creado (${vehicleType}).`);
      setShowCreate(false);
      setResults([plate]); // fuerza sugerencia inmediata
    } catch {
      setMsg("No se pudo crear el vehículo");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="card">
      <h2>Registrar IN/OUT</h2>
      <form onSubmit={submit}>
        {/* PLACA + AUTOCOMPLETE */}
        <div style={{ position: "relative" }}>
          <label>Placa</label>
          <input
            className="input"
            value={plate}
            onChange={e=>{ setPlate(e.target.value.toUpperCase()); setOpen(true); }}
            onBlur={() => setTimeout(()=>setOpen(false), 150)}
            placeholder="ABC123"
            autoComplete="off"
          />
          {open && results?.length > 0 && (
            <div className="autocomplete-list" ref={listRef}>
              {results.map(p => (
                <div key={p} className="autocomplete-item" onMouseDown={()=>{ setPlate(p); setOpen(false); setShowCreate(false); }}>
                  {p}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CREAR VEHÍCULO SI NO HAY SUGERENCIAS */}
       {showCreate && (
        <div className="card" style={{ marginTop: 10, padding: 12, background: "#0b1220" }}>
            <div style={{ marginBottom: 8, fontWeight: 600 }}>
            No se encontró <span style={{ opacity: .9 }}>{plate}</span>. ¿Crear vehículo?
            </div>

            {/* ✅ Label por encima y luego la fila con select + botón */}
            <label>Tipo</label>
            <div className="row row-tight">
            <select
                className="input"
                value={vehicleType}
                onChange={e=>setVehicleType(e.target.value)}
            >
                <option value="AUTO">Auto</option>
                <option value="MOTO">Moto</option>
                <option value="AUTOBUS">Autobús</option>
                <option value="CAMION_FURGON">Camión/Furgón</option>
            </select>

            <button
                type="button"
                className="btn primary"
                disabled={creating || plate.trim().length < 2}
                onClick={createVehicle}
            >
                {creating ? "Creando..." : "Crear vehículo"}
            </button>
            </div>
        </div>
        )}


        {/* CAMPOS DE EVENTO */}
        <div className="row" style={{ marginTop: 8 }}>
          <div>
            <label>Dirección</label>
            <select className="input" value={direction} onChange={e=>setDirection(e.target.value)}>
              <option value="IN">Entrada</option>
              <option value="OUT">Salida</option>
            </select>
          </div>

          <div style={{ flex: 1 }}>
            <label>Notas</label>
            <input className="input" value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Opcional" />
          </div>
        </div>

        <button className="btn primary" style={{ marginTop: 12 }}>Guardar</button>
      </form>

      {msg && <div className="badge" style={{ marginTop: 8 }}>{msg}</div>}
    </div>
  );
}
