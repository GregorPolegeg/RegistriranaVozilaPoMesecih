import { Router, Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";
import prisma from "../prisma/prisma";
import { body, validationResult } from "express-validator";
import multer from "multer";
import path from "path";

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    let extension = path.extname(file.originalname); // Get file extension
    if (!extension) {
      extension = '.mp4'; // Default to .mp4 if no extension is found
    }
    cb(null, `${uniqueSuffix}${extension}`); // Use unique suffix and retain or add extension
  }
});

const upload = multer({
  storage: storage,
});



// User registration and video upload
router.post(
  "/register",
  upload.single('file'),
  [
    body("firstName").isString().withMessage("First name must be a string"),
    body("lastName").isString().withMessage("Last name must be a string"),
    body("email").isEmail().withMessage("Invalid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, password } = req.body;
    const videoFile = req.file;

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const videoUrl = videoFile ? path.join(videoFile.destination, videoFile.filename) : null;

      const newUser = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          password: hashedPassword,
          videoUrl, // Save the video URL
        },
      });

      const token = jwt.sign({ userId: newUser.id }, "your_jwt_secret_key", {
        expiresIn: "1h",
      });

      res.status(201).json({ message: "User successfully created", token, userId: newUser.id });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: "User could not be created" });
    }
  }
);

// Video upload endpoint
router.post("/uploadVideo", upload.single('file'), async (req: Request, res: Response) => {
  const { userId } = req.body;
  const videoFile = req.file;

  if (!userId || !videoFile) {
    return res.status(400).json({ error: "User ID and video file are required" });
  }

  try {
    const videoUrl = path.join(videoFile.destination, videoFile.filename);

    await prisma.user.update({
      where: { id: Number(userId) },
      data: { videoUrl },
    });

    res.status(200).json({ message: "Video uploaded successfully", videoUrl });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Video could not be uploaded" });
  }
});

// User login
// User login
// User login
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Invalid email"),
    body("password").isString().withMessage("Password must be a string"),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user || !user.password) {
        return res.status(400).json({ error: "Invalid email or password" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ error: "Invalid email or password" });
      }

      const token = jwt.sign({ userId: user.id }, "your_jwt_secret_key", {
        expiresIn: "1h",
      });

      res.json({ token, userId: user.id });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: "Could not log in" });
    }
  }
);



// Image upload endpoint
router.post("/uploadImage", upload.single('file'), async (req: Request, res: Response) => {
  const { userId } = req.body;
  const imageFile = req.file;

  if (!userId || !imageFile) {
    return res.status(400).json({ error: "User ID and image file are required" });
  }

  try {
    const imageUrl = path.join(imageFile.destination, imageFile.filename);

    await prisma.user.update({
      where: { id: Number(userId) },
      data: { imageUrl },
    });

    res.status(200).json({ message: "Image uploaded successfully", imageUrl });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Image could not be uploaded" });
  }
});


// Fetch all users
router.get("/", async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Could not fetch users" });
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

// Fetch user profile
router.get(
  "/profile",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.userId },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(user);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: "Could not fetch user" });
    }
  }
);

export default router;
