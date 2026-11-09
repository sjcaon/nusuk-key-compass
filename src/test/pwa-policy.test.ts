import { describe, expect, it } from "vitest";
import { canOfferInstall, refusesOfflineRegistration } from "@/lib/pwa-policy";

describe("Offline registration safety", () => {
  it("never registers in dev, framed previews, or with the kill switch", () => {
    expect(refusesOfflineRegistration(false, "localhost", false, "")).toBe(true);
    expect(refusesOfflineRegistration(true, "nusuk-key-compass.vercel.app", true, "")).toBe(true);
    expect(refusesOfflineRegistration(true, "nusuk-key-compass.vercel.app", false, "?sw=off")).toBe(true);
  });
  it("refuses all Lovable preview host families", () => {
    for (const host of ["id-preview--abc.lovable.app", "preview-v2--shop.gpt-eng.com", "preview--abc.gptengineer.run", "project--abc-dev.lovable.app", "demo.lovableproject.com", "lovableproject-dev.com", "beta.lovable.dev", "test.beta.lovable.dev"]) {
      expect(refusesOfflineRegistration(true, host, false, "")).toBe(true);
    }
  });
  it("allows published Lovable, Vercel, and custom domains", () => {
    for (const host of ["nusuk-key-compass.lovable.app", "nusuk-key-compass.vercel.app", "preview-v2--shop.example.com"]) {
      expect(refusesOfflineRegistration(true, host, false, "")).toBe(false);
    }
  });
});

describe("Install button availability", () => {
  it("offers installation only when the browser provides a prompt", () => {
    expect(canOfferInstall(true, false, false)).toBe(true);
    expect(canOfferInstall(false, false, false)).toBe(false);
  });
  it("hides installation when installed or in standalone mode", () => {
    expect(canOfferInstall(true, false, true)).toBe(false);
    expect(canOfferInstall(true, true, false)).toBe(false);
  });
});