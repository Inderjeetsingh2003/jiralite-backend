import dbclient from "../dbcon.js";
import { getDbConfig } from "../../config/index.js";
export const setMemberduringInvitation = async (obj, memberStatus) => {
  try {
    const newEntry = { ...obj, memberStatus };
    await dbclient
      .db(getDbConfig.databaseName)
      .collection("members")
      .insertOne(newEntry);
  } catch (error) {
    throw new Error("unable to set the entery of the member during invitation");
  }
};

export const retriveMemberToSaveQ = async (boardId, email) => {
  try {
    await dbclient
      .db(getDbConfig.databaseName)
      .collection("members")
      .updateOne(
        { email, boardId },
        { $set: { memberStatus: true }, $unset: { expireTime: "" } }
      );
  } catch (error) {
    throw new Error(
      "unable to update the status of the member during acceptance"
    );
  }
};

export const boardMembersQ = async (filter) => {
  return dbclient
    .db(getDbConfig.databaseName)
    .collection("members")
    .aggregate([
      {
        $match: { ...filter },
      },
      {
        $lookup: {
          from: "user",
          localField: "userId",
          foreignField: "userId",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails",
      },
      {
        $project: {
          _id: 0,
          userId: 1,
          name: "$userDetails.name",
        },
      },
    ])
    .toArray();
};

export const checkExpireTokenQ = async (filter) => {
  return dbclient
    .db(getDbConfig.databaseName)
    .collection("members")
    .findOne(filter);
};

export const isMemberQ = async (filter) => {
  return dbclient
    .db(getDbConfig.databaseName)
    .collection("members")
    .findOne({ ...filter, memberStatus: true });
};
