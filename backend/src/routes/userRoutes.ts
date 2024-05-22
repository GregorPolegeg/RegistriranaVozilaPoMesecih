import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma/prisma';
import { body, validationResult } from 'express-validator';

const router = Router();

router.post(
  '/register',
  [
    body('firstName').isString().withMessage('First name must be a string'),
    body('lastName').isString().withMessage('Last name must be a string'),
    body('email').isEmail().withMessage('Invalid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  ],
  async (req : Request, res : Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, password } = req.body;

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await prisma.users.create({
        data: {
          firstName,
          lastName,
          email,
          password: hashedPassword,
        },
      });
      res.json({ message: 'User successfully created' });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: 'User could not be created' });
    }
  }
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Invalid email'),
    body('password').isString().withMessage('Password must be a string'),
  ],
  async (req : Request, res : Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const user = await prisma.users.findUnique({
        where: { email },
      });

      if (!user || !user.password) {
        return res.status(400).json({ error: 'Invalid email or password' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ error: 'Invalid email or password' });
      }

      const token = jwt.sign({ userId: user.id }, 'your_jwt_secret_key', {
        expiresIn: '1h',
      });

      res.json({ token });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: 'Could not log in' });
    }
  }
);

router.get('/', async (req, res) => {
  try {
    const users = await prisma.users.findMany();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Could not fetch users' });
  }
});

export default router;
