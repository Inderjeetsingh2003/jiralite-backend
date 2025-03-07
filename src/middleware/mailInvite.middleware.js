import dbclient from "../database/dbcon.js";
import { finduserQ } from "../database/dbQueries/User.Query.js";
import { sendinvitation } from "../utils/invitationBoard.js";

export const chekentry = () => {
  return async (ctx, next) => {
    const { email } = ctx.state.shared;
    const { boardId } = ctx.state.boardTaskData;
    const existingMember = await dbclient
      .db("jiralite")
      .collection("members")
      .findOne({ email, boardId });
    const existUser = await finduserQ({ email });

    if (!existingMember) {
      await next();
    } else if (existingMember && !existingMember.memberStatus) {
      let invitationUrl = existUser
        ? process.env.INVITE_MEMBERUSEREXIST_URL
        : process.env.INVITE_MEMBERFIRSTTIME_URL;
      let messageToSend = existUser
        ? `admin has invited you to join ${ctx.state.boardTaskData.boardNameToSend}`
        : `singup in jiralite to get the access of ${ctx.state.boardTaskData.boardNameToSend}`;
      const { success, message } = await sendinvitation(
        existingMember.userId,
        messageToSend,
        email,
        boardId,
        invitationUrl,
        true
      );

      if (!success) {
        ctx.status = 503;
        ctx.body = message;
        return;
      }
      ctx.status = 200;
      ctx.body = { success, message };
      return;
    } else {
      ctx.status = 400;
      ctx.body = {message:"user is already in you this board"};
    }
  };
};
