import dbclient from "../dbcon.js";
import { getDbConfig } from "../../config/index.js";
export const adminsignupQ = async (obj) => {
  const newuser = { ...obj, role: "admin" };
  const db = dbclient.db(getDbConfig.databaseName);
  const userCollection = db.collection("user");
  try {
    await userCollection.insertOne({ ...newuser });
  } catch (error) {
    throw new Error("Unable to register the admin");
  }
};

export const userSignUpQ = async (obj) => {
  const newuser = { ...obj, role: "member" };
  try {
    await dbclient
      .db(getDbConfig.databaseName)
      .collection("user")
      .insertOne({ ...newuser });
  } catch (error) {
    throw new Error("unable to register the member");
  }
};

export const finduserQ = async (filter) => {
  return dbclient
    .db(getDbConfig.databaseName)
    .collection("user") 
    .findOne(filter);
};
