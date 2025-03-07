//const Joi=require("joi");
import dbclient from "../database/dbcon.js";
import dotenv from "dotenv";
import { decryptInviteToken } from "../utils/sequencemanager.js";
dotenv.config();

export const emailvalidator = (ctx) => {
  let { email = "" } = ctx.request.body;
  email = email ? String(email).trim().toLowerCase() : "";
  if (!email || email === "") {
    return { field: "email", message: "enter email" };
  }
  const emailRegex = /^[\w\.-]+@[a-zA-Z\d\.-]+\.[a-zA-Z]{2,6}$/;
  if (!emailRegex.test(email) || email.length > 40) {
    return {
      field: "email",
      message: "Enter a valid email (max 40 characters)",
    };
  }
  ctx.state.shared = {
    ...(ctx.state.shared || {}),
    email,
  };
  return null;
};

export const namevalidator = (ctx) => {
  let name = ctx.request?.body?.name;
  if (typeof name !== "string") {
    return { field: "name", message: "the name must be a string" };
  }

  name = name.trim();

  if (!name || name === "") {
    return { field: "name", message: "enter name" };
  }

  const usernameRegex = /^[A-Za-z0-9@._-]+$/;
  if (!usernameRegex.test(name)) {
    return {
      field: "name",
      message: "Name can only contain letters, numbers, @, ., _, and -",
    };
  }
  if (name.length < 4 || name.length > 25) {
    return {
      field: "name",
      message: "Enter a valid name (min 4 and max 25 characters)",
    };
  }

  ctx.state.shared = {
    ...(ctx.state.shared || {}),
    name,
  };
  return null;
};

export const passwordvalidator = (ctx) => {
  let { password = "" } = ctx.request.body;
  password = password ? String(password).trim() : "";

  if (!password || password === "") {
    return { field: "password", message: "enter password" };
  }
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{4,16}$/;

  if (!passwordRegex.test(password)) {
    return {
      field: "password",
      message:
        "Password must be 4-16 characters long, include at least one uppercase letter, one lowercase letter, one digit, and one special character (@$!%*?&).",
    };
  }
  ctx.state.shared = {
    ...(ctx.state.shared || {}),
    password,
  };
  return null;
};
export const loginPasswordValidator = (ctx) => {
  let { password = "" } = ctx.request.body;
  password = password ? String(password).trim() : "";
  if (!password || password === "") {
    return { field: "password", message: "password must be provided" };
  }
  ctx.state.shared = {
    ...(ctx.state.shared || {}),
    password,
  };
  return null;
};
export const boolvalidator = (ctx) => {
  const { isverified } = ctx.request.body;
  if (typeof isverified !== "boolean") {
    return { field: "isverified", message: "enter valid iverfied" };
  }
  return null;
};

export const userExistvalidator = async (ctx) => {
  let email = ctx.state.shared?.email;
  if (!email) {
    return {
      field: "email",
      message: "email is required to check the entry in the database",
    };
  }
  try {
    const db = dbclient.db("jiralite");

    const userCollection = db.collection("user");

    const existingUser = await userCollection.findOne({ email });
    if (existingUser) {
      return {
        field: "email",
        message:
          "user already exists with this email, login to access the dashboard",
      };
    }
    return null;
  } catch (error) {
    return { message: "unable to search in database for existing user", error };
  }
};

export const tokenvalidator = async (ctx) => {
  let { token = "" } = ctx.query;
  token = token ? String(token).trim() : "";
  if (!token || token === "") {
    return {
      field: "validation token",
      message: "member token is not in the query",
    };
  }
  const payload = decryptInviteToken(token);
  if (!payload) {
    return { message: "invalid invitation token" };
  }
  ctx.state.payload = payload;
  return null;
};
