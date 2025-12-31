import jwt, { SignOptions } from "jsonwebtoken";
import { jwtConfig, TokenPayload } from "../config/jwt";

export function generateAccessToken(payload: TokenPayload): string {
  const options: SignOptions = {
    expiresIn: jwtConfig.accessTokenExpiry,
  };
  return jwt.sign(payload as object, jwtConfig.accessTokenSecret, options);
}

export function generateRefreshToken(payload: TokenPayload): string {
  const options: SignOptions = {
    expiresIn: jwtConfig.refreshTokenExpiry,
  };
  return jwt.sign(payload as object, jwtConfig.refreshTokenSecret, options);
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

