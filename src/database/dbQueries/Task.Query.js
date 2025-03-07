import dbclient from "../dbcon.js";
import { getDbConfig } from "../../config/index.js";
export const createTaskQ = async (newEntry) => {
  await dbclient
    .db(getDbConfig.databaseName)
    .collection("task")
    .insertOne(newEntry);
};

export const fetchTaskStageQ = async (
  boardId,
  Priority = null,
  sortOrder = 1
) => {
  return dbclient
    .db(getDbConfig.databaseName)
    .collection("stages")
    .aggregate([
      { $match: { boardId } },
      {
        $lookup: {
          from: "task",
          localField: "_id",
          foreignField: "stageId",
          as: "tasks",
        },
      },
      { $unwind: { path: "$tasks", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "user",
          localField: "tasks.assignedUserId",
          foreignField: "userId",
          as: "assignedUser",
        },
      },
      {
        $addFields: {
          "tasks.assignedUserName": { $arrayElemAt: ["$assignedUser.name", 0] },
        },
      },
      {
        $group: {
          _id: "$_id",
          stageName: { $first: "$stageName" },
          boardId: { $first: "$boardId" },
          stageOrder: { $first: "$stageOrder" },
          tasks: {
            $push: {
              $cond: {
                if: { $gt: [{ $type: "$tasks._id" }, "missing"] },
                then: "$tasks",
                else: "$$REMOVE",
              },
            },
          },
        },
      },
      { $sort: { stageOrder: 1 } },
      {
        $project: {
          _id: 1,
          stageName: 1,
          boardId: 1,
          tasks: {
            $filter: {
              input: "$tasks",
              as: "task",
              cond: Priority ? { $eq: ["$$task.Priority", Priority] } : {},
            },
          },
        },
      },
      {
        $addFields: {
          tasks: {
            $sortArray: { input: "$tasks", sortBy: { dueDate: sortOrder } },
          },
        },
      },
    ])
    .toArray();
};

export const findTaskByIDQ = async (id) => {
  return dbclient
    .db(getDbConfig.databaseName)
    .collection("task")
    .findOne({ _id: id });
};

export const deleteTaskQ = async (id) => {
  const session = dbclient.startSession();
  try {
    session.startTransaction();
    await dbclient
      .db(getDbConfig.databaseName)
      .collection("comments")
      .deleteMany({ taskId: id }, { session });
    const result = await dbclient
      .db(getDbConfig.databaseName)
      .collection("task")
      .deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      throw new Error("unable to delete the task");
    }
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw new Error("unable to dele the task");
  } finally {
    session.endSession();
  }
  return { success: 1, message: "task deleted successfully" };
};

export const updateTaskQ = async (dataToUpdate) => {
  const { taskId, boardNameToSend, ...data } = dataToUpdate;
  const result = await dbclient
    .db(getDbConfig.databaseName)
    .collection("task")
    .updateOne({ _id: taskId }, { $set: data });
  if (result.matchedCount === 1) {
    return { success: 1, message: "task updated successfully" };
  }
  throw new Error("unable to update the task");
};

export const searchTaskQ = async (searchQuery, userId) => {
  const userBoardIds = await dbclient
    .db(getDbConfig.databaseName)
    .collection("members")
    .find({ userId, memberStatus: true }, { boardId: 1, _id: 0 })
    .toArray();
  const boardIds = userBoardIds.map((val) => val.boardId);
  if (!boardIds.length) return [];
  return dbclient
    .db(getDbConfig.databaseName)
    .collection("task")
    .aggregate([
      {
        $match: {
          boardId: { $in: boardIds },
          $text: { $search: searchQuery },
        },
      },
      {
        // Perform a lookup to get the user details based on the assignedUserId
        $lookup: {
          from: "user", // Join with the user collection
          localField: "assignedUserId", // Field in the task collection
          foreignField: "userId", // Field in the user collection
          as: "assignedUser", // Alias for the resulting array of matched documents
        },
      },
      {
        $unwind: "$assignedUser", // Unwind the array to get a single user document
      },
      {
        $project: {
          // Include the required fields from the task
          _id: 1,
          boardId: 1,
          boardName: 1,
          description: 1,
          stageId: 1,
          assignedUserId: 1,
          Priority: 1,
          dueDate: 1,
          createdBy: 1,
          assignedUserName: "$assignedUser.name", // Only include the 'name' field from the assignedUser document
        },
      },
    ])
    .toArray();
};

export const findTasksByLinkedIds = async (filter) => {
  const taskIds = await dbclient
    .db(getDbConfig.databaseName)
    .collection("task")
    .find(filter, { projection: { _id: 1 } })
    .toArray();

  const taskObjectIds = taskIds.map((task) => task._id);
  return taskObjectIds;
};

export const findTaskByDueDate = async (filter) => {
  return dbclient.db(getDbConfig.databaseName).collection("task").aggregate([{
    $match:filter
  },{$lookup:{
    from:'user',
    localField:'assignedUserId',
    foreignField:'userId',
    as:'userDetails'
  }},{
    $unwind:"$userDetails"
  },{
    $project:{
      email:'$userDetails.email',
      taskname:"$$ROOT.boardName"
    }
  }]).toArray()
};
