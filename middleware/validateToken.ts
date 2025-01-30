import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";

const validateToken = asyncHandler(async (req, res, next) => {
  let token;

  let authHeader: string = (req.headers.Authorization ||
    req.headers.authorization) as string;

  if (authHeader && authHeader.startsWith("Bearer")) {
    token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.ACCESS_SECRET as string, (err, decoded) => {
      if (err) {
        res.status(401).send({ message: "User is not authorized" });
      } else {
        res.status(200).send(decoded);
      }
    });
    if (!token) {
      res.status(401).send({ message: "User is not authorized" });
    }
  }
});

export { validateToken };
