export const msalConfig = {
  auth: {
    clientId: "f62943ed-0c4a-4aa7-b047-79a610fc32a1",
    authority: "https://login.microsoftonline.com/a035ba86-23cc-4705-b45e-c98228a6eeb5",
    redirectUri: "https://smart-receipt-logger.vercel.app",  // IMPORTANT
  }
};

export const loginRequest = {
  scopes: [
    "User.Read",
    "Files.ReadWrite",
    "openid",
    "profile",
    "email"
  ]
};
