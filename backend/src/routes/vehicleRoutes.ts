import {Router, Request, Response, NextFunction} from "express";
import prisma from "../prisma/prisma";
import {body, validationResult} from "express-validator";
import jwt, { JwtPayload } from "jsonwebtoken";
const router = Router();

router.post(
  "/scraper",
  [
    body().isArray().withMessage("Request body must be an array."),
    body("*.userId")
      .optional()
      .isInt()
      .withMessage("User ID must be an integer."),
    body("*.firstRegDate")
      .isISO8601()
      .withMessage("First registration date must be a valid ISO 8601 date."),
    body("*.firstRegDateSlo")
      .isISO8601()
      .withMessage(
        "First registration date (Slo) must be a valid ISO 8601 date."
      ),
    body("*.brand").isString().withMessage("Brand must be a string."),
    body("*.model").isString().withMessage("Model must be a string."),
    body("*.vin").isString().withMessage("VIN must be a string."),
    body("*.maxSpeed").isFloat().withMessage("Max speed must be a float."),
    body("*.fuelType").isString().withMessage("Fuel type must be a string."),
    body("*.kilometers").isFloat().withMessage("Kilometers must be a float."),
    body("*.status").isString().withMessage("Status must be a string."),
    body("*.userAge").isInt().withMessage("User age must be an integer."),
    body("*.userLegalStatus")
      .isString()
      .withMessage("User legal status must be a string."),
    body("*.userIsOwner")
      .isString()
      .withMessage("User ownership status must be a string."),
    body("*.userCity").isString().withMessage("User city must be a string."),
    body("*.userMunicipality")
      .isString()
      .withMessage("User municipality must be a string."),
    body("*.ownerAge").isInt().withMessage("Owner age must be an integer."),
    body("*.ownerLegalStatus")
      .isString()
      .withMessage("Owner legal status must be a string."),
    body("*.vehicleCategory")
      .isString()
      .withMessage("Vehicle category must be a string."),
    body("*.envLabel")
      .isString()
      .withMessage("Environmental label must be a string."),
    body("*.originCountry")
      .isString()
      .withMessage("Origin country must be a string."),
    body("*.weight").isFloat().withMessage("Weight must be float."),
    body("*.nominalPower")
      .isFloat()
      .withMessage("Nominal power must be float."),
    body("*.engineDisplacement")
      .isFloat()
      .withMessage("Engine displacement must be float."),
    body("*.nominalEngineSpeed")
      .isFloat()
      .withMessage("Nominal engine speed must be float."),
    body("*.color").isString().withMessage("Color must be a string."),
    body("*.bodyType").isString().withMessage("Body type must be a string."),
    body("*.locationLng")
      .optional()
      .isFloat()
      .withMessage("Location longitude must be a float if provided."),
    body("*.locationLat")
      .optional()
      .isFloat()
      .withMessage("Location latitude must be a float if provided."),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({errors: errors.array()});
    }

    type Vehicle = {
      userId?: number;
      firstRegDate: string;
      firstRegDateSlo: string;
      brand: string;
      model: string;
      vin: string;
      maxSpeed: number;
      fuelType: string;
      kilometers: number;
      status: string;
      userAge: number;
      userLegalStatus: string;
      userIsOwner: string;
      userCity: string;
      userMunicipality: string;
      ownerAge: number;
      ownerLegalStatus: string;
      vehicleCategory: string;
      envLabel: string;
      originCountry: string;
      weight: number;
      nominalPower: number;
      engineDisplacement: number;
      nominalEngineSpeed: number;
      color: string;
      bodyType: string;
      locationLng?: number;
      locationLat?: number;
    };

    const vehicles: Vehicle[] = req.body;

    try {
      // Get the VINs of vehicles to be processed
      const vins = vehicles.map((vehicle) => vehicle.vin);

      // Find existing vehicles
      const existingVehicles = await prisma.vehicle.findMany({
        where: {vin: {in: vins}},
        select: {vin: true},
      });

      // Extract VINs of existing vehicles
      const existingVins = existingVehicles.map(
        (vehicle: {vin: string}) => vehicle.vin
      );

      // Filter out new vehicles to be created
      const newVehicles = vehicles.filter(
        (vehicle) => !existingVins.includes(vehicle.vin)
      );

      // Bulk create new vehicles
      if (newVehicles.length > 0) {
        await prisma.vehicle.createMany({
          data: newVehicles.map((vehicle) => ({
            userId: vehicle.userId,
            firstRegDate: new Date(vehicle.firstRegDate),
            firstRegDateSlo: new Date(vehicle.firstRegDateSlo),
            brand: vehicle.brand,
            model: vehicle.model,
            vin: vehicle.vin,
            maxSpeed: vehicle.maxSpeed,
            fuelType: vehicle.fuelType,
            kilometers: vehicle.kilometers,
            status: vehicle.status,
            userAge: vehicle.userAge,
            userLegalStatus: vehicle.userLegalStatus,
            userIsOwner: vehicle.userIsOwner,
            userCity: vehicle.userCity,
            userMunicipality: vehicle.userMunicipality,
            ownerAge: vehicle.ownerAge,
            ownerLegalStatus: vehicle.ownerLegalStatus,
            vehicleCategory: vehicle.vehicleCategory,
            envLabel: vehicle.envLabel,
            originCountry: vehicle.originCountry,
            weight: vehicle.weight,
            nominalPower: vehicle.nominalPower,
            engineDisplacement: vehicle.engineDisplacement,
            nominalEngineSpeed: vehicle.nominalEngineSpeed,
            color: vehicle.color,
            bodyType: vehicle.bodyType,
            locationLng: vehicle.locationLng,
            locationLat: vehicle.locationLat,
          })),
        });
      }

      // Update existing vehicles
      const updatedVehicles = await Promise.all(
        vehicles
          .filter((vehicle) => existingVins.includes(vehicle.vin))
          .map((vehicle) =>
            prisma.vehicle.update({
              where: {vin: vehicle.vin},
              data: {
                userId: vehicle.userId,
                firstRegDate: new Date(vehicle.firstRegDate),
                firstRegDateSlo: new Date(vehicle.firstRegDateSlo),
                brand: vehicle.brand,
                model: vehicle.model,
                maxSpeed: vehicle.maxSpeed,
                fuelType: vehicle.fuelType,
                kilometers: vehicle.kilometers,
                status: vehicle.status,
                userAge: vehicle.userAge,
                userLegalStatus: vehicle.userLegalStatus,
                userIsOwner: vehicle.userIsOwner,
                userCity: vehicle.userCity,
                userMunicipality: vehicle.userMunicipality,
                ownerAge: vehicle.ownerAge,
                ownerLegalStatus: vehicle.ownerLegalStatus,
                vehicleCategory: vehicle.vehicleCategory,
                envLabel: vehicle.envLabel,
                originCountry: vehicle.originCountry,
                weight: vehicle.weight,
                nominalPower: vehicle.nominalPower,
                engineDisplacement: vehicle.engineDisplacement,
                nominalEngineSpeed: vehicle.nominalEngineSpeed,
                color: vehicle.color,
                bodyType: vehicle.bodyType,
                locationLng: vehicle.locationLng,
                locationLat: vehicle.locationLat,
              },
            })
          )
      );

      console.log({
        created: newVehicles.length,
        updated: updatedVehicles.length,
      });
      return res.json({
        created: newVehicles.length,
        updated: updatedVehicles.length,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({error: "Internal Server Error"});
    }
  }
);

/* router.post(
  "/add",
  [
    body("userId").isInt().withMessage("User ID must be an integer."),
    body("firstRegDate")
      .isISO8601()
      .withMessage("First registration date must be a valid ISO 8601 date."),
    body("firstRegDateSlo")
      .isISO8601()
      .withMessage(
        "First registration date (Slo) must be a valid ISO 8601 date."
      ),
    body("brand").isString().withMessage("Brand must be a string."),
    body("model").isString().withMessage("Model must be a string."),
    body("vin").isString().withMessage("VIN must be a string."),
    body("maxSpeed").isFloat().withMessage("Max speed must be a float."),
    body("fuelType").isString().withMessage("Fuel type must be a string."),
    body("kilometers").isFloat().withMessage("Kilometers must be a float."),
    body("status").isString().withMessage("Status must be a string."),
    body("userAge").isInt().withMessage("User age must be an integer."),
    body("userLegalStatus")
      .isString()
      .withMessage("User legal status must be a string."),
    body("userIsOwner")
      .isString()
      .withMessage("User ownership status must be a string."),
    body("userCity").isString().withMessage("User city must be a string."),
    body("userMunicipality")
      .isString()
      .withMessage("User municipality must be a string."),
    body("ownerAge").isInt().withMessage("Owner age must be an integer."),
    body("ownerLegalStatus")
      .isString()
      .withMessage("Owner legal status must be a string."),
    body("vehicleCategory")
      .isString()
      .withMessage("Vehicle category must be a string."),
    body("envLabel")
      .isString()
      .withMessage("Environmental label must be a string."),
    body("originCountry")
      .isString()
      .withMessage("Origin country must be a string."),
    body("weight").isFloat().withMessage("Weight must be float."),
    body("nominalPower")
      .isFloat()
      .withMessage("Nominal power must be float."),
    body("engineDisplacement")
      .isFloat()
      .withMessage("Engine displacement must be float."),
    body("nominalEngineSpeed")
      .isFloat()
      .withMessage("Nominal engine speed must be float."),
    body("color").isString().withMessage("Color must be a string."),
    body("bodyType").isString().withMessage("Body type must be a string."),
    body("locationLng")
      .optional()
      .isFloat()
      .withMessage("Location longitude must be a float if provided."),
    body("locationLat")
      .optional()
      .isFloat()
      .withMessage("Location latitude must be a float if provided."),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({errors: errors.array()});
    }
    const {
      userId,
      firstRegDate,
      firstRegDateSlo,
      brand,
      model,
      vin,
      maxSpeed,
      fuelType,
      kilometers,
      status,
      userAge,
      userLegalStatus,
      userIsOwner,
      userCity,
      userMunicipality,
      ownerAge,
      ownerLegalStatus,
      vehicleCategory,
      envLabel,
      originCountry,
      weight,
      nominalPower,
      engineDisplacement,
      nominalEngineSpeed,
      color,
      bodyType,
      locationLng,
      locationLat,
    }: {
      userId?: number;
      firstRegDate: string;
      firstRegDateSlo: string;
      brand: string;
      model: string;
      vin: string;
      maxSpeed: number;
      fuelType: string;
      kilometers: number;
      status: string; //todo
      userAge: number;
      userLegalStatus: string;
      userIsOwner: string;
      userCity: string;
      userMunicipality: string;
      ownerAge: number;
      ownerLegalStatus: string;
      vehicleCategory: string;
      envLabel: string;
      originCountry: string;
      weight: number;
      nominalPower: number;
      engineDisplacement: number;
      nominalEngineSpeed: number;
      color: string;
      bodyType: string;
      locationLng?: number;
      locationLat?: number;
    } = req.body;

    try {
      const existingVehicle = await prisma.vehicle.findUnique({
        where: {vin: vin},
      });

      if (existingVehicle) {
        const updatedVehicle = await prisma.vehicle.update({
          where: {vin},
          data: {
            userId: userId ?? existingVehicle.userId,
          },
        });
        return res.json(updatedVehicle);
      } else {
        const newVehicle = await prisma.vehicle.create({
          data: {
            userId,
            firstRegDate: new Date(firstRegDate),
            firstRegDateSlo: new Date(firstRegDateSlo),
            brand,
            model,
            vin,
            maxSpeed,
            fuelType,
            kilometers,
            status,
            userAge,
            userLegalStatus,
            userIsOwner,
            userCity,
            userMunicipality,
            ownerAge,
            ownerLegalStatus,
            vehicleCategory,
            envLabel,
            originCountry,
            weight,
            nominalPower,
            engineDisplacement,
            nominalEngineSpeed,
            color,
            bodyType,
            locationLng,
            locationLat,
          },
        });
        return res.json(newVehicle);
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({error: "Internal Server Error"});
    }
  } 
); */ // Spremeni da prvo checkenmo vin vnesen in ce ga mamo ze v bazi, ce nimaamo pol komaj damo opcijo za create

router.get("/", async (req: Request, res: Response) => {
  try {
    const {limit = 50, offset = 0} = req.query;
    const vehicles = await prisma.vehicle.findMany({
      take: Number(limit),
      skip: Number(offset),
    });
    return res.json(vehicles);
  } catch (error) {
    console.error(error);
    return res.status(500).json({error: "Internal Server Error"});
  }
});
interface AuthenticatedRequest extends Request {
  userId?: number;
}

function isJwtPayload(decoded: unknown): decoded is JwtPayload {
  return typeof decoded === "object" && decoded !== null && "userId" in decoded;
}

const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_TOKEN as string, (err, decoded) => {
    if (err) return res.sendStatus(403);

    if (isJwtPayload(decoded)) {
      req.userId = parseInt(decoded.userId);
      next();
    } else {
      res.sendStatus(403);
    }
  });
};

router.get("/user", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {

    const userId = req.userId;

    const vehicles = await prisma.vehicle.findMany({
      where: { userId },
      select: {
        id: true,
        brand: true,
        model: true,
        fuelType: true,
        bodyType: true,
      }
    });

    return res.json(vehicles);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
