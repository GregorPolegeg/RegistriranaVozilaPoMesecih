import {Router, Request, Response, NextFunction} from "express";
import bcrypt from "bcryptjs";
import jwt, {JwtPayload} from "jsonwebtoken";
import prisma from "../prisma/prisma";
import {body, validationResult} from "express-validator";

const router = Router();

router.post(
  "/register",
  [
    body("firstName").isString().withMessage("First name must be a string"),
    body("lastName").isString().withMessage("Last name must be a string"),
    body("email").isEmail().withMessage("Invalid email"),
    body("password")
      .isLength({min: 6})
      .withMessage("Password must be at least 6 characters long"),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors
        .array()
        .map((error) => error.msg)
        .join(", ");
      return res.status(400).json({error: errorMessages});
    }

    const {firstName, lastName, email, password} = req.body;

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          password: hashedPassword,
        },
      });
      res.json({message: "User successfully created"});
    } catch (error) {
      console.error(error);
      res.status(400).json({error: "User could not be created"});
    }
  }
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Invalid email"),
    body("password").isString().withMessage("Password must be a string"),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({errors: errors.array()});
    }

    const {email, password} = req.body;

    try {
      const user = await prisma.user.findUnique({
        where: {email},
      });

      if (!user || !user.password) {
        return res.status(400).json({error: "Invalid email or password"});
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(400).json({error: "Invalid email or password"});
      }

      const token = jwt.sign({userId: user.id}, "your_jwt_secret_key", {
        expiresIn: "1h",
      });

      res.json({token});
    } catch (error) {
      console.error(error);
      res.status(400).json({error: "Could not log in"});
    }
  }
);

router.get("/", async (req, res) => {
  try {
    const user = await prisma.user.findMany();
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(400).json({error: "Could not fetch user"});
  }
});

interface AuthenticatedRequest extends Request {
  userId?: number;
}

// Type guard to check if the decoded token is a JwtPayload
function isJwtPayload(decoded: unknown): decoded is JwtPayload {
  return typeof decoded === "object" && decoded !== null && "userId" in decoded;
}

// Middleware to authenticate and extract userId from token
const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, "your_jwt_secret_key", (err, decoded) => {
    if (err) return res.sendStatus(403);

    if (isJwtPayload(decoded)) {
      req.userId = decoded.userId;
      next();
    } else {
      res.sendStatus(403);
    }
  });
};

router.get(
  "/profile",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = await prisma.user.findUnique({
        where: {id: req.userId},
      });

      if (!user) {
        return res.status(404).json({error: "User not found"});
      }

      res.json(user);
    } catch (error) {
      console.error(error);
      res.status(400).json({error: "Could not fetch user"});
    }
  }
);

export default router;
