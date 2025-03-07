import {
  assignedUservalidator,
  boardIdvalidator,
  boardTasknamevalidator,
  checkAccess,
  descriptionvalidator,
  duedatevalidator,
  priorityFilterValidator,
  sortOrderValidator,
  stageExistInDatabase,
  stageIdInBodyValidator,
  stagesvalidator,
  taskpriorityvalidator,
  uuidvalidator,
} from "../validator/textvalidator.js";

export const updateValidator = (collectionType) => {
  return async (ctx, next) => {
    const validators = [];
    if ("name" in ctx.request.body) validators.push(boardTasknamevalidator);
    if ("description" in ctx.request.body)
      validators.push(descriptionvalidator);
   
    if ("boardId" in ctx.request.params) validators.push(boardIdvalidator);
    if ("stages" in ctx.request.body)
      {
        validators.push(stagesvalidator);
        validators.push(stageExistInDatabase)
      }
    if ("dueDate" in ctx.request.body) validators.push(duedatevalidator);
    if ("id" in ctx.request.params) validators.push(uuidvalidator(collectionType));
    if ("assignedUserId" in ctx.request.body)
      validators.push(assignedUservalidator);
    if("stageId" in ctx.request.body) validators.push(stageIdInBodyValidator)
    if ("Priority" in ctx.query) validators.push(priorityFilterValidator);
    if ("Priority" in ctx.request.body) validators.push(taskpriorityvalidator);
    if("sortOrder" in ctx.query) validators.push(sortOrderValidator)
      validators.push(checkAccess("member"))
    const errors = [];
    for (const validator of validators) {
      const error = await validator(ctx);
      if (error) {
        errors.push(error);
      }
    }
    if (errors.length > 0) {
      ctx.status = 400;
      ctx.body = { success: 0, errors };
      return;
    }

    await next();
  };
};
