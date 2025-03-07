import {
  userSignUpQ,
  adminsignupQ,
  finduserQ,
} from "../database/dbQueries/User.Query.js";
import bcrypt from "bcrypt";
import { generateJwtToken } from "../utils/jwttokengeneration.js";

import {
  decryptInviteToken,
  sequenceManager,
} from "../utils/sequencemanager.js";
import {
  checkExpireTokenQ,
  retriveMemberToSaveQ,
} from "../database/dbQueries/Members.Query.js";
import { google } from "googleapis";
import { oAuth2Client } from "../config/googleauth.js";
import { findboardQ } from "../database/dbQueries/BoardQuery.js";
import { sendinvitation } from "../utils/invitationBoard.js";

export const userSignUp = async (ctx) => {
  const roleToken = ctx.query.token;
  const { email, password, name } = ctx.state.shared;
  const hashPassword = await bcrypt.hash(password, 10);
  if (!roleToken) {
    let { userId } = await sequenceManager(true);
    await adminsignupQ({
      email,
      password: hashPassword,
      name,
      userId,
    });
    ctx.status = 200;
    const accessToken = generateJwtToken(userId);
    ctx.body = {
      success: true,
      message: "admin added successfully",
      accessToken,
      admin: true,
    };
  } else {
    const payload = decryptInviteToken(roleToken);

    if (payload.email === email) {
      await retriveMemberToSaveQ(payload.boardId, payload.email);
      await userSignUpQ({
        email,
        name,
        password: hashPassword,
        userId: payload.userId,
      });
      const accessToken = generateJwtToken(payload.userId);
      ctx.status = 200;
      ctx.body = {
        success: true,
        message: "member added successfully",
        accessToken,
        admin: false,
      };
    } else {
      ctx.status = 404;
      ctx.body = "you are not invited";
    }
  }
};
export const redirectToGoogle = async (ctx) => {
  const authorizationUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["openid", "profile", "email"],
    prompt: "consent",
  });
  ctx.redirect(authorizationUrl);
};
export const handleGoogleCallback = async (ctx) => {
  const { code } = ctx.query;
  if (!code) {
    ctx.status = 400;
    ctx.body = { success: 0, message: "authorization code not found" };
  }

  try {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    const oauth2 = google.oauth2({ auth: oAuth2Client, version: "v2" });
    const user = await oauth2.userinfo.get();
    let email = user.data.email;
    let name = user.data.name;
    const alreadyUser = await finduserQ({ email });
    if (!alreadyUser) {
      let { userId } = await sequenceManager(true);
      await adminsignupQ({ email, name, userId });
      const existUser = await finduserQ({ email });
      ctx.state.shared = existUser;
      const accessToken = generateJwtToken(userId);
      ctx.status = 200;
      ctx.redirect(`${process.env.GOOGLE_ONSUCCESS_URL}?token=${accessToken}`);
      return;
    }
    const accessToken = generateJwtToken(alreadyUser.userId);
    ctx.state.shared = alreadyUser;

    ctx.status = 200;
    ctx.redirect(`${process.env.GOOGLE_ONSUCCESS_URL}?token=${accessToken}`);
    return;
  } catch (error) {
    throw new Error("google auth fails");
  }
};
export const userLogin = async (ctx) => {
  const { email, password } = ctx.state.shared;
  const userExist = await finduserQ({ email });
  if (userExist) {
    const comparePass = await bcrypt.compare(password, userExist.password);
    if (comparePass) {
      const accessToken = generateJwtToken(userExist.userId);
      ctx.status = 200;
      ctx.body = {
        success: 1,
        message: "login successfull",
        accessToken,
        admin: userExist.role === "admin",
      };
    } else {
      ctx.status = 404;
      ctx.body = { success: 0, message: "invalid creadentials" };
    }
  } else {
    ctx.status = 404;
    ctx.body = { success: 0, message: "user not found" };
  }
};
export const alreadyUserInviteAccept = async (ctx) => {
  const { email, boardId, userId } = ctx.state.payload;
  await retriveMemberToSaveQ(boardId, email);
  const accessToken = generateJwtToken(userId);
  ctx.body = { success: 1, message: "invite accepted", accessToken };
};

export const checkToken = async (ctx) => {
  const { boardId, email, userId } = ctx.state.payload;
  const result = await checkExpireTokenQ({ boardId, email, userId });
  if (!result) {
    ctx.throw(404, "board does not exist");
  }
  const { expireTime } = result;
  const currentDate = Date.now();
  if (currentDate > expireTime) {
    const { boardName } = await findboardQ(boardId);

    const existUser = await finduserQ({ userId });
    let invitationUrl = existUser
      ? process.env.INVITE_MEMBERUSEREXIST_URL
      : process.env.INVITE_MEMBERFIRSTTIME_URL;
    let messageToSend = existUser
      ? `admin has invited you to join ${boardName}`
      : `singup in jiralite to get the access of ${boardName}`;
    const { success } = await sendinvitation(
      userId,
      messageToSend,
      email,
      boardId,
      invitationUrl,
      true
    );
    if (!success) {
      ctx.throw(503, "unable to send the new invitation");
      return;
    }
    ctx.body = {
      success: 0,
      message:
        "your invitation was expired, we have sent you a new one.. please check out the mail",
    };
  }

  ctx.body = { success: 1 };
};

export const checkAccessToken = async (ctx) => {
  ctx.body = {
    success: 1,
    message: "valid AccessToken",
    admin: ctx.state.user.role === "admin",
  };
};
