// src/utils/msalInstance.ts
import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig } from "../authConfig";

export const msalInstance = new PublicClientApplication({
  auth: msalConfig.auth,
  cache: msalConfig.cache,
  // default system options OK for now
});
