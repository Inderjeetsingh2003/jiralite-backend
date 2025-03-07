import Router from "koa-router";
import { validatorAll } from "../middleware/validatorvalidation.js";
import {
  emailvalidator,
  loginPasswordValidator,
  namevalidator,
  passwordvalidator,
  tokenvalidator,
  userExistvalidator,
} from "../validator/Uservalidator.js";
import {
  alreadyUserInviteAccept,
  checkAccessToken,
  checkToken,
  handleGoogleCallback,
  redirectToGoogle,
  userLogin,
  userSignUp,
} from "../controller/User.controller.js";
import { checkTokenExpiry } from "../middleware/checkTokenExpire.js";
import { authCheck } from "../middleware/auth.middleware.js";

const router = new Router();

router.prefix("/user");

router.post(
  "/",
  validatorAll([
    emailvalidator,
    namevalidator,
    passwordvalidator,
    userExistvalidator,
  ]),
  userSignUp
);
router.post(
  "/acceptinvitation",
  validatorAll([tokenvalidator]),
  alreadyUserInviteAccept
);

router.post(
  "/login",
  validatorAll([emailvalidator,loginPasswordValidator]),
  userLogin
);

router.get("/checkAccessToken",authCheck(),checkAccessToken)
router.get("/auth/google", redirectToGoogle);
router.get("/auth/google/callback", handleGoogleCallback);
router.get('/checkExpire',checkTokenExpiry(),checkToken)
export default router;
