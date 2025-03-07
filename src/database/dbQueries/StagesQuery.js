import dbclient from "../dbcon.js";
import { deletecommentbyTaskId } from "./CommentsQuery.js";
import { findTasksByLinkedIds } from "./Task.Query.js";
import { getDbConfig } from "../../config/index.js";
// will be imported in the createBoard function to store the stages linked to a board
export const insertStagesQ = async (stagesDocs) => {
  await dbclient
    .db(getDbConfig.databaseName)
    .collection("stages")
    .insertMany(stagesDocs);
};

export const findStageQByIDQ = async (id) => {
  return dbclient
    .db(getDbConfig.databaseName)
    .collection("stages")
    .findOne({ _id: id });
};

// this is a transction -->tasks delets--> stage delete..
export const deleteStageByIDQ = async (stageId) => {
  const session = dbclient.startSession();
  try {
    session.startTransaction();
    const taskObjectIds = await findTasksByLinkedIds({ stageId });

    if (taskObjectIds.length) {
      await deletecommentbyTaskId(taskObjectIds, session);
    }
    await dbclient
      .db(getDbConfig.databaseName)
      .collection("task")
      .deleteMany({ stageId }, { session });

    const deleteStageResult = await dbclient
      .db(getDbConfig.databaseName)
      .collection("stages")
      .deleteOne({ _id: stageId }, { session });
    if (deleteStageResult.deletedCount === 0) {
      throw new Error("stage deletion falied.. rolling back the chages");
    }
    await session.commitTransaction();
    return;
  } catch (error) {
    await session.abortTransaction();
    throw new Error("unable to delete the stages");
  } finally {
    session.endSession();
  }
};

export const updateStageByIDQ = async (stageId, boardId, stageName) => {
  await dbclient
    .db(getDbConfig.databaseName)
    .collection("stages")
    .updateOne({ boardId, _id: stageId }, { $set: { stageName } });

  return { success: 1, message: "the  stageName updated  successfully" };
};

export const findNumberofStagesQ = async (boardId) => {
  return dbclient
    .db(getDbConfig.databaseName)
    .collection("stages")
    .find({ boardId })
    .sort({ stageOrder: -1 })
    .toArray();
};

export const stageExistInDatabaseQ = async (boardId, stageName) => {
  return dbclient
    .db(getDbConfig.databaseName)
    .collection("stages")
    .findOne({
      boardId,
      stageName: { $regex: new RegExp(`^${stageName}$`, "i") },
    });
};
