import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  findUserByEmail as _findUserByEmail,
  findUserById as _findUserById,
  invalidateRefreshToken,
  updateUserRefreshToken,
} from "../model/repository.js";
import { formatUserResponse } from "./user-controller.js";

export async function handleLogin(req, res) {
  const { email, password } = req.body;
  if (email && password) {
    try {
      const user = await _findUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Wrong email and/or password" });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({ message: "Wrong email and/or password" });
      }

      // Generate access and refresh token
      const accessToken = jwt.sign({ id: user.id }, process.env.JWT_ACCESS_TOKEN_SECRET, {
        expiresIn: "10s",
      });

      const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_REFRESH_TOKEN_SECRET, {
        expiresIn: "1d",
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "Lax", // Set to secure=true, sameSite: None in prod
      });

      // Save the refresh token in db
      const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
      await updateUserRefreshToken(user.id, hashedRefreshToken);

      return res.status(200).json({
        message: "User logged in",
        data: { accessToken, user: { ...formatUserResponse(user) } },
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  } else {
    return res.status(400).json({ message: "Missing email and/or password" });
  }
}

export async function handleLogout(req, res) {
  try {
    if (!req.cookies.refreshToken) {
      return res.sendStatus(204);
    }
    const refreshToken = req.cookies.refreshToken;
    jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET, async (err, user) => {
      if (err) {
        return res.status(403).json({ message: "Forbidden: Token error", error: err.message });
      }

      // Destroy refreshToken in cookie
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: false,
        sameSite: "Lax", // Set to secure=true, sameSite: None in prod
      });

      // Invalidate refresh token
      await invalidateRefreshToken(user.id);

      return res.status(200).json({ message: "Successfully logged out" });
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err.message });
  }
}

export async function handleVerifyToken(req, res) {
  try {
    const verifiedUser = req.user;
    return res.status(200).json({ message: "Token verified", data: verifiedUser });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

export async function refresh(req, res) {
  if (!req.cookies.refreshToken) {
    return res.status(401).json({ message: "Unauthorised: No token" });
  }
  const refreshToken = req.cookies.refreshToken;
  jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET, async (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden: Token error" });
    }
    const dbUser = await _findUserById(user.id);
    if (!dbUser) {
      return res.status(401).json({ message: "Unauthorised: No such user" });
    }
    const dbRefreshToken = dbUser.refreshToken;

    // Validate refresh token same value as the one in db; check for token revocation
    if (!dbRefreshToken) {
      return res.status(403).json({ message: "Forbidden: Missing refresh token in db" });
    }

    const refreshTokensMatch = await bcrypt.compare(refreshToken, dbRefreshToken);
    if (!refreshTokensMatch) {
      return res.status(403).json({ message: "Forbidden: Invalid refresh token" });
    }
    const accessToken = jwt.sign({ id: user.id }, process.env.JWT_ACCESS_TOKEN_SECRET, {
      expiresIn: "10s", // TODO: Short live for testing
    });

    return res.status(200).json({
      message: "Access token refreshed",
      data: accessToken,
    });
  });
}
