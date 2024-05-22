import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import prisma from "../prisma/prisma";

const router = Router();

// Endpoint to start a new acceleration
router.post(
  "/start",
  [body("vehicleId").isInt()],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { vehicleId } = req.body;
    if (vehicleId === null && vehicleId === undefined) {
      return res.status(500).json({ error: "No vehicle ID" });
    } else {
      try {
        const newAcceleration = await prisma.accelerations.create({
          data: {
            vehicleId,
            distance: 0,
          },
        });
        return res.json(newAcceleration);
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
      }
    }
  }
);

// Endpoint to finish an acceleration
router.put(
  "/finish/:id",
  [body("endTime").isISO8601(), body("distance").isFloat()],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { endTime, distance } = req.body;

    try {
      const updatedAcceleration = await prisma.accelerations.update({
        where: { id: Number(id) },
        data: {
          endTime: new Date(endTime),
          distance,
        },
      });
      return res.json(updatedAcceleration);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// Endpoint to get all accelerations of a user
router.get("/user/:userId", async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const accelerations = await prisma.accelerations.findMany({
      where: {
        vehicle: { userId: Number(userId) },
        NOT: { distance: 0 },
      },
      include: { vehicle: true },
    });
    return res.json(accelerations);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
