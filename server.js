import dotenv from "dotenv";
dotenv.config();
import Koa from "koa";
import cors from "@koa/cors";
import { createClient } from "redis";
import { setRoutes } from "./src/routes/index.js";
import bodyparser from "koa-bodyparser";
import multer from "koa-multer";
import  '../jiralite-backend/src/utils/worker.js'
const app = new Koa();

app.use(cors());

const upload = multer();
const client = createClient();
// error handling middleware
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    console.log(error);
    ctx.status = error.status || 500;
    ctx.body = {
      message: error.message || "internal server error",
      success: 0,
    };
  }
});

app.use(
  bodyparser({
    enableTypes: ["text", "json", "form", "raw"],
  })
);

app.use(upload.any());

app.use(async (ctx, next) => {
  if (ctx.req.body) {
    ctx.request.body = ctx.req.body;
  }
  await next();
});
client.on("connect", () => {
  console.log("the redis server is connected");
});
client.on("error", (err) => {
  console.log("unable to connect to redis");
});

async function connectRedis() {
  await client.connect();
}
connectRedis();
setRoutes(app);
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`server is listening at ${PORT}`);

});

export { client };
