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
          startTime: new Date(),
          distance: 0,
        },
      });

      return res.status(201).json({ tripId: newTrip.id });
    } catch (error) {
      console.error(error);
      return res.status(500).json({error: "Internal Server Error"});
    }
  }
);

// Endpoint to finish a trip
router.post(
  "/finish",
  async (req: Request, res: Response) => {
    type FinishTrip = {
      tripId: number,
      distance: number
    }
    const {tripId, distance = 10} : FinishTrip  = req.body;
    const endTime = new Date();
    try {
      const updatedTrip = await prisma.trip.update({
        where: {id: tripId},
        data: {endTime, distance},
      });

      return res.json(updatedTrip);
    } catch (error) {
      console.error(error);
      return res.status(500).json({error: "Internal Server Error"});
    }
  }
);

router.post("/updateLocation", async (req: Request, res: Response) => {
  const { tripId, lat, lng } = req.body;

  if (!tripId || lat === undefined || lng === undefined) {
    return res.status(400).json({ error: "Trip ID, latitude and longitude are required" });
  }

  try {
    await prisma.location.create({
      data: {
        tripId: Number(tripId),
        lat: Number(lat),
        lng: Number(lng),
        timestamp: new Date(),
      },
    });

    res.status(200).json({ message: "Location updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not update location" });
  }
});

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
