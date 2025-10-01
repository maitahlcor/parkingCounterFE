import Dexie from "dexie";

export const db = new Dexie("pc_offline");
db.version(1).stores({
  events_outbox: "idempotencyKey,createdAt",      // eventos pendientes
  vehicles_cache: "normalizedPlate,plate",        // sugerencias
  vehicles_pending: "normalizedPlate,plate"       // vehículos por enviar
});

// helpers
export const normalizePlate = (s="") =>
  s.toUpperCase().replace(/[\s-]/g, "").trim();
