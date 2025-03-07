//import { authCheck } from "../middleware/auth.middleware";
import Router from "koa-router";
import { authCheck } from "../middleware/auth.middleware.js";
import { validatorAll } from "../middleware/validatorvalidation.js";
import { checkComments } from "../validator/CommentsValidator.js";
import {
  createComment,
  deleteComment,
  fetchComments,
  updateComment,
} from "../controller/Comment.controller.js";
import { checkAccess, uuidvalidator } from "../validator/textvalidator.js";
const router = new Router();
router.prefix("/comment");

router.post(
  "/:id",
  authCheck(["admin", "member"]),
  validatorAll([checkComments, uuidvalidator("task"), checkAccess("member")]),
  createComment
);
router.get(
  "/:id",
  authCheck(["admin", "member"]),
  validatorAll([uuidvalidator("task"), checkAccess("member")]),
  fetchComments
);

router.patch(
  "/:id",
  authCheck(["admin", "member"]),
  validatorAll([
    uuidvalidator("comments"),
    checkAccess("author"),
    checkComments,
  ]),
  updateComment
);
router.delete(
  "/:id",
  authCheck(["admin", "member"]),
  validatorAll([uuidvalidator("comments"), checkAccess("author")]),
  deleteComment
);
export default router;
