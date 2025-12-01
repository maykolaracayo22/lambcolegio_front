// src/lib/config.ts
export const API_BASE = import.meta.env.VITE_API_BASE?.toString().replace(/\/+$/, "") || "";
export const HAS_API = Boolean(API_BASE);
