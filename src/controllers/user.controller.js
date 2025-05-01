import { PrismaClient } from "../generated/prisma/index.js";
import { ApiError } from "../utils/ApiError.js";
import { compare, hash } from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

async function generateToken(payload) {
  try {
    const refreshToken = await jwt.sign(
      {
        username: payload.username,
      },
      process.env.REFRESH_SECRET_SECRET,
      {
        expiresIn: process.env.REFRESH_SECRET_EXPIRY,
      }
    );
    const accessToken = await jwt.sign(
      {
        username: payload.username,
        email: payload.email,
      },
      process.env.ACCESS_SECRET_SECRET,
      {
        expiresIn: process.env.ACCESS_SECRET_EXPIRY,
      }
    );

    return { refreshToken, accessToken };
  } catch (err) {
    throw new ApiError(500, "Internal Server Error");
  }
}

const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  if (!Object.keys(req.body).length) {
    throw new ApiError(400, "Invalid request body");
  }

  try {
    const isUserExist = await prisma.user.findFirst({
      where: {
        OR: [{ username, email }],
      },
    });

    if (isUserExist)
      return res.status(409).json({ message: "User already exist" });

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
  } catch (err) {
    throw new ApiError(500, `Error: ${err}`);
  }
};

const loginUser = async (req, res) => {
  const { username, password } = req.body;
  if (!Object.keys(req.body).length || !username || !password) {
    throw new ApiError(400, "Invalid request body");
  }
  try {
    const findUser = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });

    if (!findUser) {
      return res.status(401).json({ message: "User not found" });
    }

    const comparePassword = await compare(password, findUser.password);

    if (!comparePassword) {
      throw new ApiError(401, "Password is incorrect");
    }

    const { refreshToken, accessToken } = await generateToken({
      username: findUser.username,
      email: findUser.email,
    });

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

    res.status(200).json({ message: "Login successful" });
  } catch (err) {
    throw new ApiError(500, `Error: ${err}`);
  }
};

export { registerUser, loginUser };
