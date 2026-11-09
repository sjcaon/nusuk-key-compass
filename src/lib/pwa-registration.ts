import { refusesOfflineRegistration } from "./pwa-policy";

// Only this wrapper may register the app-shell worker. Never cache auth or database requests.
export async function registerOfflineApp() {
  if (!("serviceWorker" in navigator)) return;
  const refused = refusesOfflineRegistration(import.meta.env.PROD, window.location.hostname, window.self !== window.top, window.location.search);
  if (refused) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.filter((registration) => {
      const worker = registration.active ?? registration.waiting ?? registration.installing;
      return worker && new URL(worker.scriptURL).pathname === "/sw.js";
    }).map((registration) => registration.unregister()));
    return;
  }
  const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  // Check for updates on repeat visits; the generated worker activates new versions automatically.
  void registration.update().catch(() => {});
}