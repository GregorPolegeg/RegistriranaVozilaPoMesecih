import {Router, Request, Response} from "express";
import prisma from "../prisma/prisma";
import {body, param, validationResult} from "express-validator";

const router = Router();

// Validation and Error Handling Middleware
const handleValidationErrors = (
  req: Request,
  res: Response,
  next: () => void
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({errors: errors.array()});
  }
  next();
};

// Endpoint to start a new trip
router.post(
  "/start",
  [body("vehicleId").isInt().withMessage("Vehicle ID must be an integer")],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    const {vehicleId} = req.body;

    try {
      const newTrip = await prisma.trip.create({
        data: {
          vehicleId,
          distance: 0,
        },
      });

      return res.json(newTrip);
    } catch (error) {
      console.error(error);
      return res.status(500).json({error: "Internal Server Error"});
    }
  }
);

// Endpoint to finish a trip
router.post(
  "/finish",
  [
    body("id").isInt().withMessage("ID must be an integer"),
    body("endTime")
      .isISO8601()
      .toDate()
      .withMessage("End time must be a valid date"),
    body("distance")
      .isFloat({min: 0})
      .withMessage("Distance must be a positive number"),
  ],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    const {id, endTime, distance} = req.body;

    try {
      const updatedTrip = await prisma.trip.update({
        where: {id: Number(id)},
        data: {endTime, distance},
      });

      return res.json(updatedTrip);
    } catch (error) {
      console.error(error);
      return res.status(500).json({error: "Internal Server Error"});
    }
  }
);

// Endpoint to get all trip of a user where distance is not 0
router.get(
  "/user/:userId",
  [param("userId").isInt().withMessage("User ID must be an integer")],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    const {userId} = req.params;

    try {
      const trip = await prisma.trip.findMany({
        where: {
          vehicle: {userId: Number(userId)},
          NOT: {distance: 0}, // Filter out trip with distance equal to 0
        },
        include: {vehicle: true},
      });

      return res.json(trip);
    } catch (error) {
      console.error(error);
      return res.status(500).json({error: "Internal Server Error"});
    }
  }
);

export default router;
