import Joi from "joi";
import { findboardQ } from "../database/dbQueries/BoardQuery.js";
import { validate as isValidUUID } from "uuid";
import {
  findStageQByIDQ,
  stageExistInDatabaseQ,
} from "../database/dbQueries/StagesQuery.js";
import { PriorityMap } from "../utils/Priority.js";

import { findTaskByIDQ } from "../database/dbQueries/Task.Query.js";
import { findCommentById } from "../database/dbQueries/CommentsQuery.js";
import { isMemberQ } from "../database/dbQueries/Members.Query.js";

export const boardTasknamevalidator = (ctx) => {
  let { name = "" } = ctx.request.body;
  if (typeof name !== "string") {
    return { field: "name", message: "name must be a string" };
  }
  name = name.trim();
  if (!name || name === "") {
    return { field: "name", message: "enter name" };
  }
  const wordCount = name.split(/\s+/).length;
  if (wordCount < 1 || wordCount > 7) {
    return {
      field: "name",
      message: "must contain between 1 to 7 words",
    };
  }
  ctx.state.boardTaskData = {
    ...(ctx.state.boardTaskData || {}),
    boardName: name,
  };

  return null;
};

export const descriptionvalidator = async (ctx) => {
  let { description = "" } = ctx.request.body;
  if (typeof description !== "string") {
    return { field: "description", message: "description must be a string" };
  }
  description = description.trim();
  if (!description || description === "") {
    return { field: "description", message: "enter descrpiton of the board" };
  }
  const wordCount = description.split(/\s+/).length;
  if (wordCount < 4 || wordCount > 20) {
    return {
      field: "description ",
      message: "must contain between 4 to 50 words",
    };
  }
  ctx.state.boardTaskData = { ...(ctx.state.boardTaskData || {}), description };

  return null;
};

export const stagesvalidator = async (ctx) => {
  let { stages = [] } = ctx.request.body;
  if (!Array.isArray(stages) || stages.length === 0) {
    return { field: "stages", message: "stages array is required" };
  }
  const tempstages = [];
  const stageset = new Set();
  for (let stage of stages) {
    if (typeof stage !== "string") {
      return { filed: "stageName", message: "stage name must be a string" };
    }
    stage = stage.trim();
    if (stage === "") {
      return { field: "stage", message: `${stage} must be a non empty string` };
    }
    if (stage.length > 15) {
      return {
        field: "stages",
        message: `stage name ${stage} exceeds 15 characters`,
      };
    }

    const lowercasestage = stage.toLowerCase();
    if (stageset.has(lowercasestage)) {
      return { field: "stages", message: `duplicate element ${stage} found` };
    }
    stageset.add(lowercasestage);
    tempstages.push(stage);
  }

  ctx.state.boardTaskData = {
    ...(ctx.state.boardTaskData || {}),
    stages: tempstages,
  };

  return null;
};

export const boardIdvalidator = async (ctx) => {
  let boardId = ctx.request.params?.boardId;
  boardId = parseInt(boardId);
  if (!boardId || isNaN(boardId)) {
    return { field: "boardId", message: "not a valid board id" };
  }
  const existBoard = await findboardQ(boardId);
  if (!existBoard) {
    return { field: "boardId", message: "no such board available" };
  }
  ctx.state.boardTaskData = {
    ...(ctx.state.boardTaskData || {}),
    adminId: existBoard.adminId,
    boardId: existBoard.boardId,
    boardNameToSend: existBoard.boardName,
  };
  ctx.state.data = existBoard;
  return null;
};

export const uuidvalidator = (collectionType) => async (ctx) => {
  const id = ctx.params?.id;
  if (!isValidUUID(id)) {
    return { field: "id", message: "invlaid uuidid" };
  }
  let existDoc;
  if (collectionType === "stage") {
    existDoc = await findStageQByIDQ(id);
  } else if (collectionType === "task") {
    existDoc = await findTaskByIDQ(id);
  } else if (collectionType === "comments") {
    existDoc = await findCommentById(id);
  } else {
    return { field: "collectionType", message: "invalid collection type" };
  }

  if (!existDoc) {
    return {
      filed: "id",
      message: `no doc in ${collectionType} with this ${id} exists`,
    };
  }

  ctx.state.boardTaskData = {
    ...(ctx.state.boardTaskData || {}),
    [`${collectionType}Id`]: existDoc._id,
  };
  ctx.state.data = existDoc; // to check the authentication of the user for manupilation
  return null;
};

export const taskpriorityvalidator = async (ctx) => {
  let { Priority = "" } = ctx.request.body;
  Priority = Priority ? String(Priority).trim() : "";
  if (!Priority || Priority === "") {
    return { field: "Priority", message: "Priority must be declare" };
  }
  Priority = PriorityMap[Priority];
  if (!Priority) {
    return { field: "Priority", message: "High,Low,Medium" };
  }

  ctx.state.boardTaskData = { ...(ctx.state.boardTaskData || {}), Priority };
  return null;
};

export const assignedUservalidator = async (ctx) => {
  let assignedUserId = ctx.request.body?.assignedUserId;
  const boardId = ctx.state?.data?.boardId;
  if (!assignedUserId || !boardId) {
    return { message: "Invalid request, Missing assigned user or board data." };
  }

  assignedUserId = Number(assignedUserId);
  if (isNaN(assignedUserId)) {
    return { field: "assignedUserId", message: "Invalid user ID format." };
  }
  const member = await isMemberQ({ userId: assignedUserId, boardId });
  if (!member) {
    return {
      field: " assignedUserId",
      message: "user does not exists in your board",
    };
  }

  ctx.state.boardTaskData = {
    ...(ctx.state.boardTaskData || {}),
    assignedUserId,
  };
  return null;
};

export const duedatevalidator = async (ctx) => {
  const { dueDate } = ctx.request.body;
  const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
  const match = dateRegex.test(dueDate);
  if (!match) {
    return {
      field: "due date",
      message: "invalid date format. Use YYYY-MM-DD",
    };
  }

  const date = new Date(dueDate);

  if (isNaN(date.getTime())) {
    return { field: "due date", message: "invalid date" };
  }
  const formattedDueDate = date.toISOString().split("T")[0];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date < today) {
    return { field: "due date", message: "due date cannot be in the past" };
  }
  ctx.state.boardTaskData = {
    ...(ctx.state.boardTaskData || {}),
    dueDate: formattedDueDate,
  };
  return null;
};
export const searchValidator = async (ctx) => {
  const { searchQuery } = ctx.query;
  if (
    !searchQuery ||
    typeof searchQuery !== "string" ||
    searchQuery.trim() === "" ||
    !/^[a-zA-Z0-9\s\-_]+$/.test(searchQuery) ||
    searchQuery.length < 2 ||
    searchQuery.length > 100
  ) {
    return {
      field: "search query",
      message:
        "Search query must be a non-empty string (2-100 characters) including(-,_)",
    };
  }
  ctx.state.boardTaskData = { ...(ctx.state.boardTaskData | {}), searchQuery };
  return null;
};

export const priorityFilterValidator = async (ctx) => {
  let Priority = ctx.query?.Priority;
  Priority = parseInt(Priority);

  if (isNaN(Priority) || Priority < 1 || Priority > 3) {
    return { field: "Priority", message: "invalid range" };
  }
  ctx.state.boardTaskData = { ...(ctx.state.boardTaskData || {}), Priority };
  return null;
};

export const sortOrderValidator = async (ctx) => {
  let sortOrder = ctx.query?.sortOrder;
  sortOrder = parseInt(sortOrder);
  if (isNaN(sortOrder) || (sortOrder !== 1 && sortOrder !== -1)) {
    return { field: "sortOrder", message: "sorting order must be 1 or -1" };
  }
  ctx.state.boardTaskData = { ...(ctx.state.boardTaskData || {}), sortOrder };
  return null;
};

export const checkAccess = (accessType) => async (ctx) => {
  const userId = ctx.state?.user?.userId;
  const boardId = ctx.state?.data?.boardId;
  const commentWrittenBy = ctx.state?.data?.writtenBy;

  if (!userId) {
    return null;
  }

  if (accessType === "admin") {
    if (!boardId) {
      return null;
    }

    const board = await findboardQ(boardId);
    if (board.adminId !== userId) {
      return { filed: `${boardId}`, message: "not found" };
    }
  } else if (accessType === "member") {
    if (!boardId) {
      return null;
    }

    const memberExist = await isMemberQ({ boardId, userId });
    if (!memberExist) {
      return { filed: `${boardId}`, message: "not found" };
    }
  } else if (accessType === "author") {
    if (!commentWrittenBy) {
      return null;
    }
    if (commentWrittenBy !== userId) {
      return { filed: "comment not found", message: "not found" };
    }
  }

  return null;
};

export const stageIdInBodyValidator = async (ctx) => {
  const stageId = ctx.request.body?.stageId;
  let boardId = ctx.params?.boardId;
  boardId = parseInt(boardId);
  if (!isValidUUID(stageId)) {
    return { field: "id", message: "invlaid uuidid" };
  }
  let existDoc;
  const id = stageId;
  existDoc = await findStageQByIDQ(id);
  if (!existDoc) {
    return { field: "stageId", message: "no such stageId exists" };
  }
  ctx.state.data = existDoc;
  return null;
};

export const stageExistInDatabase = async (ctx) => {
  let stages = ctx.state?.boardTaskData?.stages;
  const boardId = ctx.state?.data?.boardId;
  if (!boardId) {
    return { message: "missing board id to update the stages in the database" };
  }
  if (!Array.isArray(stages)) {
    return { message: "stages must be Array" };
  }
  if (stages.length === 0) {
    return { field: "stages", message: "stages cannot be empty array" };
  }
  const results = await Promise.all(
    stages.map(async (stageName) => {
      if (typeof stageName !== "string" || stageName.trim() === "") {
        return { field: "stageName", message: "stageName must be a string" };
      }
      const stageExist = await stageExistInDatabaseQ(boardId, stageName);

      if (stageExist) {
        return {
          field: "stages",
          message: `stage ${stageName} already exists for the board`,
        };
      }
      return null;
    })
  );
  return results.find((result) => result !== null) || null;
};

export const stageNamevalidator = async (ctx) => {
  let { stageName = "" } = ctx.request.body;
  const boardId = ctx.state?.data?.boardId;
  if (typeof stageName !== "string") {
    return { field: "stageName", message: "stageName must be a string" };
  }
  if (!boardId) {
    return {
      field: "boardID",
      message: "provide the boardID to update the stage",
    };
  }
  stageName = stageName.trim();
  if (stageName === "") {
    return {
      field: "stage",
      message: `${stageName} must be a non empty string`,
    };
  }
  if (stageName.length > 15) {
    return {
      field: "stages",
      message: `stage name ${stage} exceeds 15 characters`,
    };
  }
  const stageExist = await stageExistInDatabaseQ(boardId, stageName);
  if (stageExist) {
    return {
      field: "stages",
      message: `stage ${stageName} already exists for the board`,
    };
  }
  ctx.state.boardTaskData = { ...(ctx.state.boardTaskData || {}), stageName };
  return null;
};
