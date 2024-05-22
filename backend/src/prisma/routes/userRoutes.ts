import { Router } from 'express';
import prisma from '../prisma';

const router = Router();

router.post('/add', async (req, res) => {
  const { name, email } = req.body;

  try {
    const newUser = await prisma.user.create({
      data: { name, email },
    });
    res.json(newUser);
  } catch (error) {
    res.status(400).json({ error: 'User could not be created' });
  }
});

router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(400).json({ error: 'Could not fetch users' });
  }
});

export default router;
