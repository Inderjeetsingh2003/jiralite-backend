import dbclient from "../dbcon.js";
import { getDbConfig } from "../../config/index.js";
export const createCommentQ = async (dataToAdd) => {
  return dbclient
    .db(getDbConfig.databaseName)
    .collection("comments")
    .insertOne({ ...dataToAdd });
};

export const fetchCommentsQ = async (taskId) => {
  const result = await dbclient

    .db(getDbConfig.databaseName)
    .collection("task")
    .aggregate([
      {
        $match: { _id: taskId },
      },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "taskId",
          as: "comments",
        },
      },
      { $unwind: { path: "$comments", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "user",
          localField: "comments.writtenBy",
          foreignField: "userId",
          as: "comments.commentBy",
        },
      },
      {
        $addFields: {
          "comments.commentBy": {
            $arrayElemAt: ["$comments.commentBy.name", 0],
          },
        },
      },
      {
        $group: {
          _id: null,
          comments: {
            $push: {
              $cond: {
                if: { $gt: [{ $type: "$comments._id" }, "missing"] },
                then: "$comments",
                else: "$$REMOVE",
              },
            },
          },
        },
      },
      {
        $project: { _id: 0 },
      },
    ])
    .toArray();
  return result;
};

export const findCommentById = async (id) => {
  return dbclient
    .db(getDbConfig.databaseName)
    .collection("comments")
    .findOne({ _id: id });
};

export const updateCommentQ = async (commentsId, comment) => {
  return dbclient
    .db(getDbConfig.databaseName)
    .collection("comments")
    .updateOne({ _id: commentsId }, { $set: { comment } });
};

export const deleteCommentQ = async (commentsId) => {
  return dbclient
    .db(getDbConfig.databaseName)
    .collection("comments")
    .deleteOne({ _id: commentsId });
};

export const deletecommentbyTaskId = async (taskObjectIds, session) => {
  return dbclient
    .db(getDbConfig.databaseName)
    .collection("comments")
    .deleteMany({ taskId: { $in: taskObjectIds } }, { session });
};
