import { Router, Request, Response } from 'express';
import prisma from '../prisma/prisma';
import { body, validationResult } from 'express-validator';

const router = Router();

// Endpoint to start a new trip
router.post('/start', async (req: Request, res: Response) => {
  const { vehicleId } = req.body;

  try {
    const newTrip = await prisma.trips.create({
      data: { vehicleId, 
      distance: 0
    },
    });

    return res.json(newTrip);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to finish a trip
router.post('/finish', async (req: Request, res: Response) => {
  const { id, endTime, distance } = req.body;

  try {
    const updatedTrip = await prisma.trips.update({
      where: { id: Number(id) },
      data: { endTime, distance },
    });

    return res.json(updatedTrip);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Endpoint to get all trips of a user where distance is not 0
router.get('/user/:userId', async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const trips = await prisma.trips.findMany({
      where: {
        vehicle: { userId: Number(userId) },
        NOT: { distance: 0 }, // Filter out trips with distance equal to 0
      },
      include: { vehicle: true },
    });

    return res.json(trips);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
