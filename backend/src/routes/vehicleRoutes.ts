import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { body, validationResult } from 'express-validator';

const router = Router();

router.post(
  '/add',
  [
    body('userId').optional().isInt(),
    body('firstRegDate').isDate(),
    body('firstRegDateSlo').isDate(),
    body('brand').isString(),
    body('vin').isString(),
    body('maxSpeed').isFloat(),
    body('fuelTypeDesc').isString(),
    body('kilometersMiles').isFloat(),
    body('locationLng').optional().isFloat(),
    body('locationLat').optional().isFloat(),
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
      vin,
      maxSpeed,
      fuelTypeDesc,
      kilometersMiles,
      locationLng,
      locationLat,
    }: {
      userId?: number,
      firstRegDate: string,
      firstRegDateSlo: string,
      brand: string,
      vin: string,
      maxSpeed: number,
      fuelTypeDesc: string,
      kilometersMiles: number,
      locationLng?: number,
      locationLat?: number,
    } = req.body;

    try {
      const existingVehicle = await prisma.vehicles.findUnique({
        where: { vin: vin },
      });

      if (existingVehicle) {
        const updatedVehicle = await prisma.vehicles.update({
          where: { vin },
          data: {
            userId: userId ?? existingVehicle.userId,
            firstRegDate: new Date(firstRegDate),
            firstRegDateSlo: new Date(firstRegDateSlo),
            brand,
            maxSpeed,
            fuelTypeDesc,
            kilometersMiles,
            locationLng,
            locationLat,
          },
        });
        return res.json(updatedVehicle);
      } else {
        const newVehicle = await prisma.vehicles.create({
          data: {
            userId,
            firstRegDate: new Date(firstRegDate),
            firstRegDateSlo: new Date(firstRegDateSlo),
            brand,
            vin,
            maxSpeed,
            fuelTypeDesc,
            kilometersMiles,
            locationLng,
            locationLat,
          },
        });
        return res.json(newVehicle);
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }  
);

router.get('/list', async (req: Request, res: Response) => {
  try {
    const { limit, offset } = req.query;
    let vehicles;
    if (limit && offset) {
      vehicles = await prisma.vehicles.findMany({
        take: Number(limit),
        skip: Number(offset),
      });
    } else {
      vehicles = await prisma.vehicles.findMany();
    }
    return res.json(vehicles);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
