import { decryptInviteToken } from "../utils/sequencemanager.js";

export const checkTokenExpiry = () => {
  return async (ctx, next) => {
    const roletoken = ctx.query.token;

    const payload = decryptInviteToken(roletoken);

    if (!payload) {
      ctx.throw(401, "Invalid to Tempered token");
    }
    ctx.state.payload = { ...(ctx.state.payload || {}), ...payload };

    await next();
  };
};
