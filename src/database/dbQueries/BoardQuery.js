import dbclient from "../dbcon.js";
import { deletecommentbyTaskId } from "./CommentsQuery.js";
import { findTasksByLinkedIds } from "./Task.Query.js";
import { getDbConfig } from "../../config/index.js";

export const createBoardQ = async ({
  boardName,
  description,
  adminId,
  boardId,
}) => {
  return dbclient.db(getDbConfig.databaseName).collection("board").insertOne({
    boardName,
    description,
    boardId,
    adminId,
  });
};

export const fetchboardQ = async (userId) => {
  return dbclient
    .db(getDbConfig.databaseName)
    .collection("members")
    .aggregate([
      { $match: { userId: userId } },
      {
        $lookup: {
          from: "board",
          localField: "boardId",
          foreignField: "boardId",
          as: "boardDetails",
        },
      },
      { $unwind: "$boardDetails" },
      {
        $project: {
          _id: 0,
          boardName: "$boardDetails.boardName",
          description: "$boardDetails.description",
          adminId: "$boardDetails.adminId",
          boardId: "$boardDetails.boardId",
        },
      },
    ])
    .toArray();
};

export const updateBoardQ = async (dataToUpdate, boardId) => {
  return dbclient
    .db(getDbConfig.databaseName)
    .collection("board")
    .updateOne({ boardId }, { $set: dataToUpdate });
};

export const findboardQ = async (boardId) => {
  return await dbclient
    .db(getDbConfig.databaseName)
    .collection("board")
    .findOne({ boardId });
};

export const deleteBoardQ = async (boardId) => {
  const session = dbclient.startSession();

  try {
    session.startTransaction();
    const taskObjectIds = await findTasksByLinkedIds({ boardId });

    if (taskObjectIds.length) {
      await deletecommentbyTaskId(taskObjectIds, session);
    }
    await dbclient
      .db(getDbConfig.databaseName)
      .collection("comments")
      .deleteMany({ boardId }, { session });
    await dbclient
      .db(getDbConfig.databaseName)
      .collection("task")
      .deleteMany({ boardId }, { session });
    await dbclient
      .db(getDbConfig.databaseName)
      .collection("members")
      .deleteMany({ boardId }, { session });
    await dbclient
      .db(getDbConfig.databaseName)
      .collection("stages")
      .deleteMany({ boardId }, { session });
    await dbclient
      .db(getDbConfig.databaseName)
      .collection("TaskSequence")
      .deleteOne({ boardId }, { session });
    const deleteBoard = await dbclient
      .db(getDbConfig.databaseName)
      .collection("board")
      .deleteOne({ boardId: boardId });

    if (deleteBoard.deletedCount === 0) {
      throw new Error("unable to delele the board");
    }
    await session.commitTransaction();
    return { success: 1, message: "board deleted successfully" };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
