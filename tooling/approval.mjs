const WINDOW_MS = 30_000;
const used = new Set();
const exact = (value, keys) => value && typeof value === "object" && !Array.isArray(value) && JSON.stringify(Object.keys(value).sort()) === JSON.stringify([...keys].sort());
export function requireFreshApproval(approval, {scope, budget, now = Date.now()} = {}) {
  if (!exact(approval, ["issuedAt", "interactionId", "scope", "budget"])) throw Error("fresh approval token is malformed");
  if (typeof approval.interactionId !== "string" || !approval.interactionId) throw Error("fresh approval token is malformed");
  if (approval.scope !== scope || JSON.stringify(approval.budget) !== JSON.stringify(budget)) throw Error("fresh approval token scope or budget is invalid");
  if (!Number.isSafeInteger(approval.issuedAt) || approval.issuedAt > now || now - approval.issuedAt > WINDOW_MS) throw Error("fresh approval token is stale or future-dated");
  if (used.has(approval.interactionId)) throw Error("fresh approval token was replayed");
  used.add(approval.interactionId);
  return true;
}
export const approvalWindowMs = WINDOW_MS;
