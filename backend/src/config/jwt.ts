import env from "./env";

export const jwtConfig = {
  accessTokenSecret: env.JWT_SECRET,
  refreshTokenSecret: env.JWT_REFRESH_SECRET,
  accessTokenExpiry: "15m",
  refreshTokenExpiry: "7d",
};

export interface TokenPayload {
  userId: string;
  email: string;
}

