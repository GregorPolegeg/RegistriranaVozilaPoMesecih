import express from "express";
import userRoutes from "./src/prisma/routes/userRoutes";
import vehicleRoutes from "./src/prisma/routes/vehicleRoutes";
import accelerationRoutes from "./src/prisma/routes/accelerationRoutes";
import tripRoutes from "./src/prisma/routes/tripRoutes";

const app = express();

app.use(express.json());

app.use("/users", userRoutes);
app.use("/vehicles", vehicleRoutes);
app.use("/accelerations", accelerationRoutes);
app.use("/trips", tripRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
