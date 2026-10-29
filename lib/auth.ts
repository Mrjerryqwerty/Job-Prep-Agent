// Single-user passcode gate. Cookie holds a hash of the passcode, never the passcode itself.
export async function tokenFor(passcode: string) {
  const data = new TextEncoder().encode(`${passcode}:dassault-prep`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
export const COOKIE = "dp_auth";
