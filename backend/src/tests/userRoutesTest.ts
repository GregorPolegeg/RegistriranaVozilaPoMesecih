import request from "supertest";
import express from "express";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";
import router from "../routes/userRoutes"; // Adjust the import path as necessary
import prisma from "../prisma/prisma";

// Set up the Express app with the router
const app = express();
app.use(express.json());
app.use(router);

describe("User API Routes", () => {
  let userId: number;
  let token: string;

  beforeAll(async () => {
    const uniqueEmail = `testuser_${Date.now()}@example.com`;

    const user = await prisma.user.create({
      data: {
        firstName: "Test",
        lastName: "User",
        email: uniqueEmail,
        password: "hashedpassword",
      },
    });
    userId = user.id;
    token = jwt.sign({userId: user.id}, process.env.JWT_TOKEN as string, {
      expiresIn: "1h",
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: "testuser_",
        },
      },
    });
    await prisma.$disconnect();
  });

  describe("GET /profile", () => {
    it("should return the user profile for a valid token", async () => {
      const response = await request(app)
        .get("/profile")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.email).toBeDefined();
      expect(response.body.vehicles).toBeDefined();
    });
  });
});
