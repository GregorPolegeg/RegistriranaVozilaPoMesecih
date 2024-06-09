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

const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const toRad = (value: number) => value * Math.PI / 180;

  const R = 6371; // Radius of the Earth in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
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
      tripId: number;
    }
    const { tripId }: FinishTrip = req.body;
    const endTime = new Date();

    try {
      const locations = await prisma.location.findMany({
        where: { tripId },
        orderBy: { timestamp: 'asc' }
      });

      let totalDistance = 0;
      for (let i = 1; i < locations.length; i++) {
        totalDistance += calculateDistance(
          locations[i - 1].lat,
          locations[i - 1].lng,
          locations[i].lat,
          locations[i].lng
        );
      }

      const updatedTrip = await prisma.trip.update({
        where: { id: tripId },
        data: { endTime, distance: totalDistance },
      });

      return res.json(updatedTrip);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
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

router.get(
  "/trip/:tripId",
  [param("tripId").isInt().withMessage("Trip ID must be an integer")],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    const { tripId } = req.params;

    try {
      const trip = await prisma.trip.findUnique({
        where: { id: Number(tripId) },
        include: { locations: true },
      });

      if (!trip) {
        return res.status(404).json({ error: "Trip not found" });
      }

      return res.json(trip);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
);


export default router;
