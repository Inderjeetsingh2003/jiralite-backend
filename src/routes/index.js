import task from "../routes/Task.js";
import testing from "../routes/serverRoute.js";
import user from "./UserRoutes.js";
import board from "./Board.js";
import comments from "./Comments.js";

const routers = [task, testing, user, board, comments];

const setRoutes = async (app) => {
  routers.forEach((router) => {
    app.use(router.routes()).use(router.allowedMethods());
  });
};
export { setRoutes };
