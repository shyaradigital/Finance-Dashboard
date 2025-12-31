import jwt from "jsonwebtoken";
import { jwtConfig, TokenPayload } from "../config/jwt";

export function generateAccessToken(payload: TokenPayload): string {
  // @ts-ignore - expiresIn accepts string values like "15m", "7d" etc.
  return jwt.sign(payload, jwtConfig.accessTokenSecret, {
    expiresIn: jwtConfig.accessTokenExpiry,
  });
}

export function generateRefreshToken(payload: TokenPayload): string {
  // @ts-ignore - expiresIn accepts string values like "15m", "7d" etc.
  return jwt.sign(payload, jwtConfig.refreshTokenSecret, {
    expiresIn: jwtConfig.refreshTokenExpiry,
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

