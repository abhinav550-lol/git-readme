import jwt from "jsonwebtoken";
import type { Request } from "express";

interface JwtPayload {
  [key: string]: any;
}

/**
 * Signs a JWT with the given payload and saves it in the session.
 * @param req - Express request object (must have session available)
 * @param payload - Data to encode in the JWT
 * @returns The signed JWT token
 */
const setSession = (req: Request, payload: JwtPayload): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  const token = jwt.sign(payload, secret, { expiresIn: "7d" });

  // Save the token in the session
  (req.session as any).token = token;

  return token;
};




export default setSession;
