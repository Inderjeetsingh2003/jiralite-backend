 import { client } from "../../server.js";

import {
  createTaskQ,
  deleteTaskQ,
  fetchTaskStageQ,
  searchTaskQ,
  updateTaskQ,
} from "../database/dbQueries/Task.Query.js";
import { finduserQ } from "../database/dbQueries/User.Query.js";
import { createQueue } from "../utils/bullQueue.js";
import { updateTaskcouterQ } from "../utils/TasksequenceManager.js";
import { uuidgenerator } from "../utils/uuid.js";

export const createTask = async (ctx) => {
  const {
    adminId,
    boardNameToSend,

    ...boardTaskDataWithoutAdminID
  } = ctx.state.boardTaskData;
  const { assignedUserId, boardName } = ctx.state.boardTaskData;
  const assignUser = String(assignedUserId);
  let numberOfTasks = await client.get(assignUser);
  numberOfTasks = numberOfTasks ? parseInt(numberOfTasks, 10) : 0;
  if (numberOfTasks >= 3) {
    ctx.throw(
      400,
      "assigned user is already having three tasks to complete, please do not bother him more"
    );
  }
  const _id = uuidgenerator();
  const newEntry = {
    ...boardTaskDataWithoutAdminID,
    createdBy: ctx.state.user.userId,
    _id,
    status: "pending",
  };
  const result = await createTaskQ(newEntry);
  await updateTaskcouterQ(newEntry.boardId);
  await client.incr(assignUser);
  const user = await finduserQ({ userId: assignedUserId });
  const emailQueue=createQueue('emailService')
  emailQueue.add("Email", {
    email: user.email,
    title: boardName,
    boardName: boardNameToSend,
  });

  ctx.status = 200;
  ctx.body = {
    message: `task created successfully and sending mail to the user to inform them `,
  };
};

export const fetchTaskStage = async (ctx) => {
  const { boardId, Priority, sortOrder } = ctx.state.boardTaskData;
  const result = await fetchTaskStageQ(boardId, Priority, sortOrder);
  if (!result.length) {
    ctx.status = 200;
    ctx.body = { success: 0, result };
    return;
  }
  ctx.status = 200;
  ctx.body = { result, message: "your stages and tasks " };
};
export const deleteTask = async (ctx) => {
  const { id } = ctx.params;
  const result = await deleteTaskQ(id);
  ctx.status = 200;
  ctx.body = result;
};

export const updateTask = async (ctx) => {
  const dataToUpdate = {
    ...ctx.state.boardTaskData,
    ...(ctx.request.body.stageId && {
      stageId: ctx.request.body.stageId,
    }),
  };

  const result = await updateTaskQ(dataToUpdate);
  if (!result.success) {
    ctx.status = 400;
    ctx.body = result;
    return;
  }
  ctx.status = 200;
  ctx.body = result;
};

export const searchTask = async (ctx) => {
  const { searchQuery } = ctx.state.boardTaskData;
  const { userId } = ctx.state.user;

  const result = await searchTaskQ(searchQuery, userId);
  ctx.status = 200;
  ctx.body = result;
};
