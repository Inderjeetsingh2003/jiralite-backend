import { google } from "googleapis";
import { oAuth2Client } from "../config/googleauth.js";

export const googleauth = () => {
  return async (ctx, next) => {
    const authorizationUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: ["openid", "profile", "email"],
      prompt: "consent",
    });
    ctx.redirect(authorizationUrl);

    const { code } = ctx.query;
    if (!code) {
      ctx.status = 400;
      ctx.body = "authorization code not found";
      return;
    }

    try {
      const { tokens } = await oAuth2Client.getToken(code);
      oAuth2Client.setCredentials(tokens);

      const oauth2 = google.oauth2({ auth: oAuth2Client, version: "v2" });
      const user = await oauth2.userinfo.get();
    } catch (error) {
      ctx.status = 500;
      ctx.body = "Authentication failed";
    }
  };
};
