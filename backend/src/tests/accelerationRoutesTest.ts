import request from "supertest";
import express from "express";
import router from "../routes/accelerationRoutes"; // Adjust the import path as necessary
import prisma from "../prisma/prisma";

// Set up the Express app with the router
const app = express();
app.use(express.json());
app.use(router);

describe("Acceleration API Routes", () => {
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

  describe("PUT /finish/:id", () => {
    it("should return 400 if id is not an integer", async () => {
      const response = await request(app).put("/finish/notAnInteger").send({
        endTime: "2023-06-01T00:00:00.000Z",
        distance: 100,
      });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it("should return 400 if endTime is not a valid date", async () => {
      const response = await request(app).put("/finish/1").send({
        endTime: "invalidDate",
        distance: 100,
      });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it("should return 400 if distance is not a positive number", async () => {
      const response = await request(app).put("/finish/1").send({
        endTime: "2023-06-01T00:00:00.000Z",
        distance: -100,
      });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe("GET /user/:userId", () => {
    it("should return 400 if userId is not an integer", async () => {
      const response = await request(app).get("/user/notAnInteger");

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it("should return a list of accelerations for a user", async () => {
      const response = await request(app).get("/user/1");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});
