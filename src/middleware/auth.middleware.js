import jsonwebtoken from "jsonwebtoken";
import dbclient from "../database/dbcon.js";

const authCheck = (requiredRoles = []) => {
  return async (ctx, next) => {
    const token = ctx.request.headers.authorization?.split(" ")[1];
    if (!token) {
      ctx.status = 403;
      ctx.body = { message: "unauthorized accesss" };
      return;
    } else {
      // try {
      const user = jsonwebtoken.verify(token, process.env.JWT_SECRET);
      const db = dbclient.db("jiralite");
      const userCollection = db.collection("user");

      const existingUser = await userCollection.findOne(
        { userId: user.userId },
        { projection: { password: 0 } }
      );
      if (!existingUser) {
        ctx.status = 403;
        ctx.body = { message: "unauthorized access" };
        return;
      }
      if (requiredRoles.length && !requiredRoles.includes(existingUser.role)) {
        ctx.status = 403;
        ctx.body = { message: "forbidden access!!" };
        return;
      }
      ctx.state.user = existingUser;
      await next();
      // } catch (error) {
      //   ctx.status = 403;
      //   ctx.body = { message: "unauhtorizedd access" };
      //   return;
      // }
    }
  };
};
export { authCheck };
