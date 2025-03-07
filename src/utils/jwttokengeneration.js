import jsonwebtoken from "jsonwebtoken";

const generateJwtToken = (userId) => {
  const accessToken = jsonwebtoken.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  return accessToken;
};
export { generateJwtToken };
