import request from "supertest";
import express from "express";
import jwt from "jsonwebtoken";
import router from "../routes/vehicleRoutes";
import prisma from "../prisma/prisma";
// Set up the Express app with the router
const app = express();
app.use(express.json());
app.use(router);

describe("Vehicle API Routes", () => {
  let token: string;

  beforeAll(() => {
    // Create a token for authentication
    token = jwt.sign({userId: 1}, process.env.JWT_TOKEN as string, {
      expiresIn: "1h",
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("POST /scraper", () => {
    it("should return 400 if the request body is not an array", async () => {
      const response = await request(app)
        .post("/scraper")
        .send({some: "object"});

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it("should create new vehicles and update existing ones", async () => {
      const vehicles = [
        {
          firstRegDate: "2023-01-01",
          firstRegDateSlo: "2023-01-01",
          brand: "BrandX",
          model: "ModelY",
          vin: "123VIN",
          maxSpeed: 120,
          fuelType: "Gasoline",
          kilometers: 10000,
          status: "active",
          userAge: 30,
          userLegalStatus: "legal",
          userIsOwner: "yes",
          userCity: "CityA",
          userMunicipality: "MunicipalityB",
          ownerAge: 45,
          ownerLegalStatus: "legal",
          vehicleCategory: "SUV",
          envLabel: "A",
          originCountry: "CountryX",
          weight: 1500,
          nominalPower: 100,
          engineDisplacement: 2000,
          nominalEngineSpeed: 3000,
          color: "red",
          bodyType: "sedan",
          locationLng: 15.0,
          locationLat: 45.0,
        },
      ];

      const response = await request(app).post("/scraper").send(vehicles);

      expect(response.status).toBe(200);
      expect(response.body.created).toBeDefined();
      expect(response.body.updated).toBeDefined();
    });
  });

  describe("GET /", () => {
    it("should return a list of vehicles", async () => {
      const response = await request(app)
        .get("/")
        .query({limit: 10, offset: 0});

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe("GET /user", () => {
    it("should return 401 if no token is provided", async () => {
      const response = await request(app).get("/user");

      expect(response.status).toBe(401);
    });

    it("should return user vehicles if token is valid", async () => {
      const response = await request(app)
        .get("/user")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});
