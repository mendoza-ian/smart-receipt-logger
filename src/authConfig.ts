export const msalConfig = {
  auth: {
    clientId: "f7d7ec84-9d43-47a2-85e1-0129539c41e4",
    authority: "https://login.microsoftonline.com/a035ba86-23cc-4705-b45e-c98228a6eeb5", 
    redirectUri: "https://smart-receipt-logger.vercel.app",
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
