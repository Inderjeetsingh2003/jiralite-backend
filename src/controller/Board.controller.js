import {
  createBoardQ,
  deleteBoardQ,
  fetchboardQ,
  updateBoardQ,
} from "../database/dbQueries/BoardQuery.js";
import {
  boardMembersQ,
  setMemberduringInvitation,
} from "../database/dbQueries/Members.Query.js";
import {
  deleteStageByIDQ,
  findNumberofStagesQ,
  insertStagesQ,
  updateStageByIDQ,
} from "../database/dbQueries/StagesQuery.js";
import { finduserQ } from "../database/dbQueries/User.Query.js";
import { sendinvitation } from "../utils/invitationBoard.js";
import { sequenceManager } from "../utils/sequencemanager.js";
import { uuidgenerator } from "../utils/uuid.js";

export const createBoard = async (ctx) => {
  const { boardName, description, stages } = ctx.state.boardTaskData;

  let { boardId } = await sequenceManager(null, true);

  await createBoardQ({
    boardName,
    description,
    adminId: ctx.state.user.userId,
    boardId,
  });

  const stagesDocs = stages.map((stageName, index) => {
    return { boardId, stageName, _id: uuidgenerator(), stageOrder: index };
  });

  await insertStagesQ(stagesDocs);
  await setMemberduringInvitation(
    { boardId, userId: ctx.state.user.userId, email: ctx.state.user.email },
    true
  );

  ctx.status = 200;
  ctx.body = { success: 1, message: "board created successfully" };
};

export const inviteMember = async (ctx) => {
  const { boardId } = ctx.state.boardTaskData;

  const { email } = ctx.state.shared;
  let invitationUrl;
  let messageToSend;
  try {
    const existUser = await finduserQ({ email });
    if (existUser&&existUser.role === "admin") {
      ctx.throw(409,`${email} is already an Admin, you cannot him in your board`);
      
    }

    if (existUser&&existUser.role === "member") {
      const userId = existUser.userId;
      invitationUrl = process.env.INVITE_MEMBERUSEREXIST_URL;
      messageToSend = `admin has invited you to join ${ctx.state.boardTaskData.boardNameToSend}`;
      const { success, message } = await sendinvitation(
        // alreadyBoardMember = false because there is no member entry for this board
        userId,
        messageToSend,
        email,
        boardId,
        invitationUrl
      );
      if (!success) {
        ctx.status = 503;
        ctx.body = { success, message };
        return;
      }
      ctx.status = 200;
      ctx.body = { success, message };
    } else {
      let { userId } = await sequenceManager(true);

      invitationUrl = process.env.INVITE_MEMBERFIRSTTIME_URL;
      messageToSend = `singup in jiralite to get the access of ${ctx.state.boardTaskData.boardNameToSend}`;
      const { success, message } = await sendinvitation(
        //  alreadyBoardMember = false no memeber entry nor a user
        userId,
        messageToSend,
        email,
        boardId,
        invitationUrl
      );
      if (!success) {
        ctx.status = 503;
        ctx.body = { success, message };
        return;
      }
      ctx.status = 200;
      ctx.body = { success, message };
    }
  } catch (error) {
    
    ctx.throw(error)
  }
};
export const updateBoard = async (ctx) => {
  const { stages, adminId, boardId, boardNameToSend, ...dataToUpdate } =
    ctx.state.boardTaskData;

  await updateBoardQ(dataToUpdate, boardId);

  if (stages) {
    const existingStages = await findNumberofStagesQ(boardId);
    let currentMaxOrder = existingStages.length
      ? existingStages[0].stageOrder
      : -1;
    const stagesDocs = stages.map((stageName, index) => {
      return {
        boardId,
        stageName,
        _id: uuidgenerator(),
        stageOrder: currentMaxOrder + index + 1,
      };
    });
    await insertStagesQ(stagesDocs);
  }
  ctx.status = 200;
  ctx.body = { success: 1, message: "successfully updated the board" };
};
export const stageDelete = async (ctx) => {
  const { stageId } = ctx.state.boardTaskData;
  await deleteStageByIDQ(stageId);

  ctx.body = { message: "successfully deleted the stage" };
};
export const updateStage = async (ctx) => {
  const { stageId, boardId } = ctx.state.boardTaskData;
  const stageName = ctx.state.boardTaskData.stageName;
  const result = await updateStageByIDQ(stageId, boardId, stageName);
  ctx.status = 200;
  ctx.body = result;
};

export const getBoards = async (ctx) => {
  const { userId } = ctx.state.user;
  const result = await fetchboardQ(userId);

  ctx.status = 200;
  ctx.body = { result };
};
export const deleteBoard = async (ctx) => {
  const { boardId } = ctx.state.boardTaskData;
  const result = await deleteBoardQ(boardId);
  ctx.status = 200;
  ctx.body = result;
};

export const boardMember = async (ctx) => {
  const { boardId } = ctx.state.boardTaskData;
  const result = await boardMembersQ({ boardId, memberStatus: true });
  ctx.body = result;
};
