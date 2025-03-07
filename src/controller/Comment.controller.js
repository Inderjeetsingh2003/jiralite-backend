import {
  createCommentQ,
  deleteCommentQ,
  fetchCommentsQ,
  updateCommentQ,
} from "../database/dbQueries/CommentsQuery.js";
import { uuidgenerator } from "../utils/uuid.js";

export const createComment = async (ctx) => {
  const { comment } = ctx.state.commentData;
  const writtenBy = ctx.state.user.userId;
  const { taskId } = ctx.state.boardTaskData;
  const _id = uuidgenerator();
  let date = new Date().toISOString()

  await createCommentQ({ taskId, comment, writtenBy, date, _id });
  ctx.body = { message: "comment added successfully" };
};

export const fetchComments = async (ctx) => {
  const { taskId } = ctx.state.boardTaskData;
  const result = await fetchCommentsQ(taskId);
  ctx.body = result[0];
};

export const updateComment = async (ctx) => {
  const { commentsId } = ctx.state.boardTaskData;
  const { comment } = ctx.state.commentData;
  await updateCommentQ(commentsId, comment);
  ctx.body = { message: "commit updated successfully" };
};

export const deleteComment = async (ctx) => {
  const { commentsId } = ctx.state.boardTaskData;

  await deleteCommentQ(commentsId);
  ctx.body = "comment successfully deleted";
};
