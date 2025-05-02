import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";

async function validateToken(req, res, next) {
  if (!req.cookies["jwt"]) {
    throw new ApiError(401, "Unauthorized Access, please login.");
  }

  try {
    const decoded = jwt.verify(
      req.cookies["jwt"],
      process.env.ACCESS_TOKEN_SECRET
    );
    req.user = decoded;
    next();
  } catch (err) {
    throw new ApiError(401, "Invalid or expired token");
  }
}

export default validateToken;
