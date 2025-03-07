//const Router=require('koa-router');
import Router from "koa-router";
import { authCheck } from "../middleware/auth.middleware.js";
import {
  boardIdvalidator,
  boardTasknamevalidator,
  checkAccess,
  descriptionvalidator,
  stageNamevalidator,
  stagesvalidator,
  uuidvalidator,
} from "../validator/textvalidator.js";
import { validatorAll } from "../middleware/validatorvalidation.js";
import {
  boardMember,
  createBoard,
  deleteBoard,
  getBoards,
  inviteMember,
  stageDelete,
  updateBoard,
  updateStage,
} from "../controller/Board.controller.js";
import { emailvalidator } from "../validator/Uservalidator.js";
import { chekentry } from "../middleware/mailInvite.middleware.js";
import { updateValidator } from "../middleware/updatevalidator.js";
const router = new Router();

router.prefix("/board");

router.post(
  "/",
  authCheck(["admin"]),
  validatorAll([boardTasknamevalidator, descriptionvalidator, stagesvalidator]),
  createBoard
);

router.post(
  "/inviteMember/:boardId",
  authCheck(["admin"]),
  validatorAll([emailvalidator, boardIdvalidator, checkAccess("admin")]),

  chekentry(),
  inviteMember
);
router.get("/", authCheck(["admin", "member"]), getBoards);
router.patch(
  "/:boardId",
  authCheck(["admin"]),
  updateValidator(),

  updateBoard
);
router.delete(
  "/:boardId",
  authCheck(["admin"]),
  validatorAll([boardIdvalidator, checkAccess("admin")]),
  deleteBoard
);
router.patch(
  "/stage/:boardId/:id",
  authCheck(["admin"]),
  validatorAll([
    boardIdvalidator,
    uuidvalidator("stage"),
    checkAccess("admin"),
    stageNamevalidator
  ]),
  updateStage
);

router.delete(
  "/stage/:id",
  authCheck(["admin"]),
  validatorAll([uuidvalidator("stage"), checkAccess("admin")]),
  stageDelete
);
router.get(
  "/:boardId",
  authCheck(["admin", "member"]),
  validatorAll([boardIdvalidator, checkAccess("member")]),
  boardMember
);
export default router;
