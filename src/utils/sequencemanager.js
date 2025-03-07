import dbclient from "../database/dbcon.js";
import crypto from "crypto";

const SECRET_KEY = Buffer.from(process.env.USER32BIT_TOKEN_KEY, "hex");
const IV = Buffer.from(process.env.USER16BIT_TOKEN_KEY, "hex");
export const sequenceManager = async (user = false, board = false) => {
  const sequenceDoc = await dbclient
    .db("jiralite")
    .collection("sequenceManager")
    .findOne({});
  let { userId, boardId } = sequenceDoc;

  const updateFields = {};
  if (user) {
    userId += 1;
    updateFields.userId = userId;
  }
  if (board) {
    boardId += 1;
    updateFields.boardId = boardId;
  }

  if (Object.keys(updateFields).length > 0) {
    await dbclient
      .db("jiralite")
      .collection("sequenceManager")
      .updateOne({}, { $set: updateFields });
  }

  return { userId, boardId };
};

export const generteInviteToken = (email, userId, boardId) => {
  const cipher = crypto.createCipheriv("aes-256-cbc", SECRET_KEY, IV);
  const data = JSON.stringify({ email, userId, boardId });
  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");
  const token = `${IV.toString("hex")}:${encrypted}`;
  const expireTime = Date.now() + 15 * 60 * 1000;
  return { token, expireTime };
};

export const decryptInviteToken = (token) => {
  try {
    const [ivHex, encrypted] = token.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc", SECRET_KEY, iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    const payload = JSON.parse(decrypted);
    return payload;
  } catch (error) {
    return null;
  }
};
