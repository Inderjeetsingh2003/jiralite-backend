import { v4 as uuidv4 } from "uuid";

export const uuidgenerator = () => {
  const uid = uuidv4();
  return uid;
};
