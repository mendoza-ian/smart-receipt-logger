// src/authConfig.ts
export const msalConfig = {
  auth: {
    clientId: "f628493d-dc34-4aa7-bc47-79a1640fc3a1", // <-- your confirmed clientId
    authority: "https://login.microsoftonline.com/a035ba86-23cc-4705-b45e-c98228a6eeb5", // <-- IBS tenant ID
    redirectUri: typeof window !== "undefined" && window.location.origin ? window.location.origin : "http://localhost:5173",
  },
  cache: {
    cacheLocation: "localStorage", // or "sessionStorage" — localStorage persists between tabs
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: [
    "openid",
    "profile",
    "email",
    "User.Read",
    "Files.ReadWrite",
    "Sites.ReadWrite.All", // may require admin consent
  ],
};
