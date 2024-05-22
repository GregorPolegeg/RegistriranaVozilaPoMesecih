import { Router, Request, Response } from "express";
import { body, param, validationResult } from "express-validator";
import prisma from "../prisma/prisma";

const router = Router();

// Validation and Error Handling Middleware
const handleValidationErrors = (req: Request, res: Response, next: () => void) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Endpoint to start a new acceleration
router.post(
  "/start",
  [body("vehicleId").isInt().withMessage("Vehicle ID must be an integer")],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    const { vehicleId } = req.body;

    if (vehicleId === null || vehicleId === undefined) {
      return res.status(400).json({ error: "Vehicle ID is required" });
    }

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
);

// Endpoint to finish an acceleration
router.put(
  "/finish/:id",
  [
    param("id").isInt().withMessage("ID must be an integer"),
    body("endTime").isISO8601().withMessage("End time must be a valid date"),
    body("distance").isFloat({ min: 0 }).withMessage("Distance must be a positive number"),
  ],
  handleValidationErrors,
  async (req: Request, res: Response) => {
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
router.get(
  "/user/:userId",
  [param("userId").isInt().withMessage("User ID must be an integer")],
  handleValidationErrors,
  async (req: Request, res: Response) => {
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
  }
);

export default router;
