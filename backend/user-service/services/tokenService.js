import jwt from "jsonwebtoken";
import { jwtConfig } from "../config/authConfig.js";
import { v4 as uuidv4 } from "uuid";
import redisService from "./redisService.js";
import { UnauthorisedError } from "../utils/httpErrors.js";

class TokenService {
  static generateAccessToken(user) {
    const accessToken = jwt.sign(
      { id: user.id, isAdmin: user.isAdmin },
      jwtConfig.accessTokenSecret,
      jwtConfig.accessTokenOptions
    );
    return accessToken;
  }

  static generateRefreshToken(user) {
    const refreshToken = jwt.sign(
      { id: user.id, jti: uuidv4() },
      jwtConfig.refreshTokenSecret,
      jwtConfig.refreshTokenOptions
    );
    return refreshToken;
  }

  static async verifyToken(token, secret) {
    return new Promise((resolve, reject) => {
      jwt.verify(token, secret, (err, decoded) => {
        if (err) {
          reject(new UnauthorisedError());
        }
        resolve(decoded);
      });
    });
  }

  static async blacklistToken(userId, jti, expiration) {
    const blacklistTokenKey = this.generateBlacklistedTokenKey(userId, jti);
    return await redisService.setKeyWithExpiration(blacklistTokenKey, "blacklisted", expiration);
  }

  static async isRefreshTokenBlacklisted(userId, jti) {
    const blacklistTokenKey = this.generateBlacklistedTokenKey(userId, jti);
    return await redisService.exists(blacklistTokenKey);
  }

  static generateBlacklistedTokenKey(userId, jti) {
    return `${userId}:${jti}`;
  }
}

export default TokenService;
