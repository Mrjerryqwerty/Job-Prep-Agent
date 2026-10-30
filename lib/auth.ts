// Passcode gates. Cookies hold a hash of the passcode, never the passcode itself.
export async function tokenFor(passcode: string, scope: "app" | "admin" = "app") {
  const data = new TextEncoder().encode(`${passcode}:dassault-prep:${scope}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
export const COOKIE = "dp_auth"; // shared app passcode
export const CAND_COOKIE = "dp_cand"; // which candidate is using the app
export const ADMIN_COOKIE = "dp_admin"; // separate admin passcode
