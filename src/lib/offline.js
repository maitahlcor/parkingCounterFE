import { db, normalizePlate } from "./db.js";
import { apiCreateVehicle, apiSyncBatch } from "./api.js";

// --- ENCOLAR ---
export async function enqueueEvent(evt) {
  // evt: { plate, direction, idempotencyKey, clientAt, notes }
  const now = Date.now();
  await db.events_outbox.put({ ...evt, createdAt: now });
  // guarda placa para autocomplete local
  await db.vehicles_cache.put({
    plate: evt.plate,
    normalizedPlate: normalizePlate(evt.plate)
  });
}

export async function enqueueVehicle({ plate, type }) {
  const n = normalizePlate(plate);
  await db.vehicles_pending.put({ plate, type, normalizedPlate: n, createdAt: Date.now() });
  await db.vehicles_cache.put({ plate, normalizedPlate: n });
}

// --- SINCRONIZAR ---
export async function syncAll({ batchSize = 50 } = {}) {
  if (!navigator.onLine) return { status: "offline" };

  // 1) vehículos pendientes
  const vPend = await db.vehicles_pending.toArray();
  for (const v of vPend) {
    try {
      await apiCreateVehicle({ plate: v.plate, meta: { type: v.type } });
      await db.vehicles_pending.delete(v.normalizedPlate);
    } catch {
      // si falla auth/red, detenemos y reintentamos luego
      return { status: "error", step: "vehicles" };
    }
  }

  // 2) eventos en lotes
  let left = await db.events_outbox.count();
  while (left > 0) {
    const batch = await db.events_outbox
      .orderBy("createdAt")
      .limit(batchSize)
      .toArray();

    const payload = batch.map(b => ({
      plate: b.plate,
      direction: b.direction,
      idempotencyKey: b.idempotencyKey,
      clientAt: b.clientAt,
      notes: b.notes
    }));

    try {
      const { savedKeys = [], duplicateKeys = [] } = await apiSyncBatch(payload);
      const done = new Set([...savedKeys, ...duplicateKeys]);
      // borra los procesados
      await db.events_outbox.where("idempotencyKey").anyOf([...done]).delete();
    } catch (e) {
      // 401 u otro error => parar y reintentar luego
      return { status: "error", step: "events" };
    }

    left = await db.events_outbox.count();
  }

  return { status: "ok" };
}

export async function pendingCounts() {
  return {
    events: await db.events_outbox.count(),
    vehicles: await db.vehicles_pending.count()
  };
}
