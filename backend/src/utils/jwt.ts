import jwt from "jsonwebtoken";
import { jwtConfig, TokenPayload } from "../config/jwt";

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, jwtConfig.accessTokenSecret, {
    expiresIn: jwtConfig.accessTokenExpiry as string | number,
  });
}

export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, jwtConfig.refreshTokenSecret, {
    expiresIn: jwtConfig.refreshTokenExpiry as string | number,
  });
}

export function verifyAccessToken(token: string): TokenPayload {
  try {
    const decoded = jwt.verify(token, jwtConfig.accessTokenSecret) as TokenPayload;
    return decoded;
  } catch (error) {
    throw new Error("Invalid or expired access token");
  }
}

export function verifyRefreshToken(token: string): TokenPayload {
  try {
    const decoded = jwt.verify(token, jwtConfig.refreshTokenSecret) as TokenPayload;
    return decoded;
  } catch (error) {
    throw new Error("Invalid or expired refresh token");
  }
}

