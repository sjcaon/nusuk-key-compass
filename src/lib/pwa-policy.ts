export function refusesOfflineRegistration(production: boolean, hostname: string, inFrame: boolean, search: string) {
  const host = hostname.toLowerCase();
  const lovableDomain = /\.(lovable\.app|gpt-eng\.com|gptengineer\.run)$/.test(host);
  const label = host.split(".")[0];
  return !production || inFrame || new URLSearchParams(search).get("sw") === "off"
    || (lovableDomain && (/^(?:id-preview|preview)(?:-[a-z0-9]+)?--.+$/.test(label) || /^project--.+-dev$/.test(label)))
    || /(^|\.)(lovableproject\.com|lovableproject-dev\.com|beta\.lovable\.dev)$/.test(host);
}

export function canOfferInstall(hasPrompt: boolean, standalone: boolean, installed: boolean) {
  return hasPrompt && !standalone && !installed;
}