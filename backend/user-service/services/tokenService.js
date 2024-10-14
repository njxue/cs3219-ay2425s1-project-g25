import jwt from "jsonwebtoken";
import { jwtConfig } from "../config/authConfig.js";

export const generateAccessToken = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, isAdmin: user.isAdmin },
    jwtConfig.accessTokenSecret,
    jwtConfig.accessTokenOptions
  );
  return accessToken;
};

export const generateRefreshToken = (user) => {
  const refreshToken = jwt.sign({ id: user.id }, jwtConfig.refreshTokenSecret, jwtConfig.refreshTokenOptions);
  return refreshToken;
};
