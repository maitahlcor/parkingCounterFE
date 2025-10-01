// src/lib/api.js
const BASE_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/,'');
if (!BASE_URL) {
  console.error('❌ VITE_API_URL no está definida. Crea .env con VITE_API_URL=http://localhost:4000/api');
}

function authHeader() {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiLogin({ email, accessCode }) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, accessCode }),
  });
  if (!res.ok) throw new Error("Login failed");
  return res.json();
}

export async function apiMe() {
  const res = await fetch(`${BASE_URL}/me`, { headers: { ...authHeader() } });
  if (!res.ok) throw new Error("Unauthorized");
  return res.json();
}

export async function apiVehicleSearch(q) {
  const url = new URL(`${BASE_URL}/vehicles`);
  url.searchParams.set("search", q);
  const res = await fetch(url, { headers: { ...authHeader() } });
  if (!res.ok) throw new Error("Search failed");
  return res.json();
}

export async function apiCreateVehicle({ plate, meta }) {
  const res = await fetch(`${BASE_URL}/vehicles`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify({ plate, meta }),
  });
  if (!res.ok) throw new Error("Create vehicle failed");
  return res.json();
}

export async function apiCreateEvent({ plate, direction, idempotencyKey, clientAt, notes }) {
  const res = await fetch(`${BASE_URL}/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify({ plate, direction, idempotencyKey, clientAt, notes }),
  });
  if (!res.ok) throw new Error("Create event failed");
  return res.json();
}

export async function apiListEvents({ plate, from, to } = {}) {
  const url = new URL(`${BASE_URL}/events`);
  if (plate) url.searchParams.set("plate", plate);
  if (from) url.searchParams.set("from", from);
  if (to) url.searchParams.set("to", to);
  const res = await fetch(url, { headers: { ...authHeader() } });
  if (!res.ok) throw new Error("List events failed");
  return res.json();
}

export async function apiSyncBatch(events) {
  const res = await fetch(`${BASE_URL}/sync/batch`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify({ events })
  });
  if (!res.ok) throw new Error("Sync failed");
  return res.json(); // { savedKeys:[], duplicateKeys:[] }
}
