import dbclient from "../database/dbcon.js";

export const updateTaskcouterQ = async (boardId) => {
  const result = await dbclient
    .db("jiralite")
    .collection("TaskSequence")
    .updateOne({ boardId }, { $inc: { taskcounter: 1 } }, { upsert: true });
};
