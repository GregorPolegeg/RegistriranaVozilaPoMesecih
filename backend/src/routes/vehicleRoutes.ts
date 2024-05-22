import { Router, Request, Response } from "express";
import prisma from "../prisma/prisma";
import { body, validationResult } from "express-validator";

const router = Router();

router.post(
  "/add",
  [
    body("userId")
      .optional()
      .isInt()
      .withMessage("User ID must be an integer."),
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
    body("userGender")
      .isString()
      .withMessage("User gender must be a string."),
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
    body("ownerGender")
      .isString()
      .withMessage("Owner gender must be a string."),
    body("vehicleCategory")
      .isString()
      .withMessage("Vehicle category must be a string."),
    body("envLabel").isString().withMessage("Environmental label must be a string."),
    body("originCountry")
      .isString()
      .withMessage("Origin country must be a string."),
    body("weight").isInt().withMessage("Weight must be an integer."),
    body("nominalPower").isInt().withMessage("Nominal power must be an integer."),
    body("engineDisplacement")
      .isInt()
      .withMessage("Engine displacement must be an integer."),
    body("nominalEngineSpeed")
      .isInt()
      .withMessage("Nominal engine speed must be an integer."),
    body("engineType").isString().withMessage("Engine type must be a string."),
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
      return res.status(400).json({ errors: errors.array() });
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
      userGender,
      userIsOwner,
      userCity,
      userMunicipality,
      ownerAge,
      ownerLegalStatus,
      ownerGender,
      vehicleCategory,
      envLabel,
      originCountry,
      weight,
      nominalPower,
      engineDisplacement,
      nominalEngineSpeed,
      engineType,
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
      status: string;
      userAge: number;
      userLegalStatus: string;
      userGender: string;
      userIsOwner: string;
      userCity: string;
      userMunicipality: string;
      ownerAge: number;
      ownerLegalStatus: string;
      ownerGender: string;
      vehicleCategory: string;
      envLabel: string;
      originCountry: string;
      weight: number;
      nominalPower: number;
      engineDisplacement: number;
      nominalEngineSpeed: number;
      engineType: string;
      color: string;
      bodyType: string;
      locationLng?: number;
      locationLat?: number;
    } = req.body;

    try {
      const existingVehicle = await prisma.vehicle.findUnique({
        where: { vin: vin },
      });

      if (existingVehicle) {
        const updatedVehicle = await prisma.vehicle.update({
          where: { vin },
          data: {
            userId: userId ?? existingVehicle.userId,
            firstRegDate: new Date(firstRegDate),
            firstRegDateSlo: new Date(firstRegDateSlo),
            brand,
            model,
            maxSpeed,
            fuelType,
            kilometers,
            status,
            userAge,
            userLegalStatus,
            userGender,
            userIsOwner,
            userCity,
            userMunicipality,
            ownerAge,
            ownerLegalStatus,
            ownerGender,
            vehicleCategory,
            envLabel,
            originCountry,
            weight,
            nominalPower,
            engineDisplacement,
            nominalEngineSpeed,
            engineType,
            color,
            bodyType,
            locationLng,
            locationLat,
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
            userGender,
            userIsOwner,
            userCity,
            userMunicipality,
            ownerAge,
            ownerLegalStatus,
            ownerGender,
            vehicleCategory,
            envLabel,
            originCountry,
            weight,
            nominalPower,
            engineDisplacement,
            nominalEngineSpeed,
            engineType,
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
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

router.get("/list", async (req: Request, res: Response) => {
  try {
    const { limit, offset } = req.query;
    let vehicles;
    if (limit && offset) {
      vehicles = await prisma.vehicle.findMany({
        take: Number(limit),
        skip: Number(offset),
      });
    } else {
      vehicles = await prisma.vehicle.findMany();
    }
    return res.json(vehicles);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
