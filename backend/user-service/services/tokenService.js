import jwt from "jsonwebtoken";
import { jwtConfig } from "../config/authConfig.js";
import { v4 as uuidv4 } from "uuid";

export const generateAccessToken = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, isAdmin: user.isAdmin },
    jwtConfig.accessTokenSecret,
    jwtConfig.accessTokenOptions
  );
  return accessToken;
};

export const generateRefreshToken = (user) => {
  const refreshToken = jwt.sign(
    { id: user.id, jti: uuidv4() },
    jwtConfig.refreshTokenSecret,
    jwtConfig.refreshTokenOptions
  );
  return refreshToken;
};
