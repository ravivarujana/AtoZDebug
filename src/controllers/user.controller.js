import { PrismaClient } from "../generated/prisma/index.js";
import { ApiError } from "../utils/ApiError.js";
import { compare, hash } from "bcrypt";
import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";

const prisma = new PrismaClient();

function generateJwtToken(payload, secret, expiry) {
  return jwt.sign(payload, secret, { expiresIn: expiry });
}

async function generateToken(payload) {
  return {
    accessToken: generateJwtToken(
      payload,
      process.env.ACCESS_TOKEN_SECRET,
      process.env.ACCESS_SECRET_EXPIRY
    ),
    refreshToken: generateJwtToken(
      { username: payload.username },
      process.env.REFRESH_TOKEN_SECRET,
      process.env.REFRESH_SECRET_EXPIRY
    ),
  };
}

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (!Object.keys(req.body).length || !username || !password || !email) {
    throw new ApiError(400, "Invalid request body");
  }

  const isUserExist = await prisma.user.findFirst({
    where: {
      OR: [{ username, email }],
    },
  });

  if (isUserExist) {
    throw new ApiError(409, "User already exist");
  }
  const saltRounds = parseInt(process.env.SALT_ROUNDS, 10) || 10;
  const hashedPassword = await hash(password, saltRounds);

  const saveUser = await prisma.user.create({
    data: {
      email,
      username,
      password: hashedPassword,
    },
  });
  res.status(200).json({
    message: `User ${saveUser.username} has been created successfully`,
  });
});

const loginUser = asyncHandler(async (req, res) => {
  if (!process.env.ACCESS_TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
    throw new ApiError("JWT secrets are missing in environment variables");
  }

  const { username, password } = req.body;
  if (!Object.keys(req.body).length || !username || !password) {
    throw new ApiError(400, "Invalid request body");
  }

  const findUser = await prisma.user.findUnique({
    where: {
      username: username,
    },
  });

  if (!findUser) {
    throw new ApiError(401, "User not found");
  }

  const comparePassword = await compare(password, findUser.password);

  if (!comparePassword) {
    throw new ApiError(401, "Password is incorrect");
  }

  const { refreshToken, accessToken } = await generateToken({
    username: findUser.username,
    email: findUser.email,
  });

  console.log("token generated", accessToken);
  console.log("token generated", refreshToken);

  res.cookie("jwt", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 1000 * 60 * 15,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });

  res.status(200).json({
    message: "Login successful",
    user: {
      username: findUser.username,
      email: findUser.email,
    },
  });
});

const logoutUser = asyncHandler(async (req, res) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  res.clearCookie("jwt", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);
  res.status(200).json({ message: "User logged out successfully" });
});

export { registerUser, loginUser, logoutUser };
