import asyncHandler from "express-async-handler";
import { prisma } from "../config/prismaConfig";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const registerUser = asyncHandler(async (req, res) => {
  let { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
  }
  const userExist = await prisma.user.findUnique({
    where: { email },
  });
  if (!userExist) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });
    res.status(200).send({ message: "Success created user", user });
  } else {
    res.status(201).send({ message: "User already exist" });
  }
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password, id } = req.body;
  if (!email || !password) {
    res.status(400);
  }
  const user = await prisma.user.findUnique({ where: { id } });
  const accessSecret: string = process.env.ACCESS_SECRET as string;
  if (user && (await bcrypt.compare(password, user.password))) {
    const accessToken = jwt.sign(
      {
        user: { email: user.email, id: user.id },
      },

      accessSecret,
      { expiresIn: "15m" }
    );
    res.status(200).send({ accessToken });
  } else {
    res.status(401).send({ message: "Email or password invalid", users: user });
  }
});

export const refreshToken = asyncHandler(async (req, res, next) => {
  const { id } = req.body;
  if (!id) {
    res.status(400);
  }
  const user = await prisma.user.findUnique({ where: { id } });
  const accessSecret: string = process.env.ACCESS_SECRET as string;
  if (user) {
    const refreshJWTToken = jwt.sign(
      {
        user: { email: user.email, id: user.id },
      },

      accessSecret,
      { expiresIn: "15m" }
    );
    res.status(200).send({ refreshJWTToken });
  } else {
    res.status(401).send({ message: "user not found", users: user });
  }
});

export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany();
  const { id: userId } = req.params;

  const isAdmin = await prisma.admin.findUnique({ where: { id: userId } });
  if (isAdmin) {
    res.status(200).send({ message: "All users", users: users });
  } else {
    res.status(500).send({ message: "No access" });
  }
});

export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({ where: { id: id } });
    res.status(200).send(user);
  } catch (error: any) {
    res.status(500).send({ message: error.message });
  }
});

export const getUser = asyncHandler(async (req, res) => {
  res.status(200).send(req.body.user);
});
