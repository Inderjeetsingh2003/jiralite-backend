import Router from "koa-router";
import { authCheck } from "../middleware/auth.middleware.js";
import {
  assignedUservalidator,
  boardIdvalidator,
  boardTasknamevalidator,
  checkAccess,
  descriptionvalidator,
  duedatevalidator,
  searchValidator,
  taskpriorityvalidator,
  uuidvalidator,
} from "../validator/textvalidator.js";
import { validatorAll } from "../middleware/validatorvalidation.js";
import {
  createTask,
  deleteTask,
  fetchTaskStage,
  searchTask,
  updateTask,
} from "../controller/Task.controller.js";
import { updateValidator } from "../middleware/updatevalidator.js";

const router = new Router();
router.prefix("/task");

router.post(
  "/:id/:boardId",
  authCheck(["admin", "member"]),
  validatorAll([
    boardIdvalidator,
    boardTasknamevalidator,
    descriptionvalidator,
    uuidvalidator("stage"),
    checkAccess("member"),
    assignedUservalidator,
    taskpriorityvalidator,
    duedatevalidator,
  ]),
  createTask
  //createTaskWithFile
);

router.get(
  "/search",
  authCheck(["member", "admin"]),
  validatorAll([searchValidator]),
  searchTask
);
router.get(
  "/:boardId",
  authCheck(["member", "admin"]),
  updateValidator(),

  fetchTaskStage
);

router.delete(
  "/:id",
  authCheck(["admin"]),
  validatorAll([uuidvalidator("task"), checkAccess("admin")]),
  deleteTask
);
router.patch(
  "/:id",
  authCheck(["admin", "member"]),
  updateValidator("task"),

  updateTask
);

export default router;
