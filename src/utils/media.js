/**
 * Gallery items may be a plain URL string or an object { url, label }.
 * These helpers normalize access so components work with either shape
 * (keeps things robust if the Supabase schema returns either later).
 */
export const imgUrl = (item) =>
  typeof item === "string" ? item : item?.url || "";

export const imgLabel = (item) =>
  typeof item === "string" ? "" : item?.label || "";
