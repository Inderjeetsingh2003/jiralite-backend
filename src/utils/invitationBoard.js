import dbclient from "../database/dbcon.js";
import { setMemberduringInvitation } from "../database/dbQueries/Members.Query.js";
import { sendmail } from "./mailsender.js";
import { generteInviteToken } from "./sequencemanager.js";

export const sendinvitation = async (
  userId,
  messageToSend,
  email,
  boardId,
  invitationUrl,
  alreadyBoardMember = false
) => {
  const { token, expireTime } = generteInviteToken(email, userId, boardId);

  const { success, message } = await sendmail(
    token,
    messageToSend,
    email,
    invitationUrl
  );
  if (success && !alreadyBoardMember) {
    await setMemberduringInvitation(
      { boardId, userId, email, expireTime },
      false
    );
    return { success, message };
  } else if (success && alreadyBoardMember) {
    await dbclient
      .db("jiralite")
      .collection("members")
      .updateOne({ email, boardId }, { $set: { expireTime } });
    return { success, message };
  } else {
    return { success, message };
  }
};
