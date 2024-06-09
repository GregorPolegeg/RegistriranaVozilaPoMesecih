import request from "supertest";
import express from "express";
import router from "../routes/tripRoutes"; // Adjust the import path as necessary
import prisma from "../prisma/prisma";

// Set up the Express app with the router
const app = express();
app.use(express.json());
app.use(router);

describe("Trip API Routes", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("POST /start", () => {
    it("should return 400 if vehicleId is not provided", async () => {
      const response = await request(app).post("/start").send({});

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it("should return 400 if vehicleId is not an integer", async () => {
      const response = await request(app)
        .post("/start")
        .send({vehicleId: "notAnInteger"});

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe("POST /updateLocation", () => {
    it("should return 400 if tripId, lat, or lng is not provided", async () => {
      const response = await request(app)
        .post("/updateLocation")
        .send({lat: 45, lng: 15});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe(
        "Trip ID, latitude and longitude are required"
      );
    });
  });

  describe("GET /user/:userId", () => {
    it("should return 400 if userId is not an integer", async () => {
      const response = await request(app).get("/user/notAnInteger");

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it("should return a list of trips for a user", async () => {
      const response = await request(app).get("/user/1");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});
