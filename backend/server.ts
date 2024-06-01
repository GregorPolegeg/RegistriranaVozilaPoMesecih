import express from "express";
import userRoutes from "./src/routes/userRoutes";
import vehicleRoutes from "./src/routes/vehicleRoutes";
import accelerationRoutes from "./src/routes/accelerationRoutes";
import tripRoutes from "./src/routes/tripRoutes";
import cors from "cors";

const app = express();

app.use(express.json());

app.use(cors());

app.options('*', cors());
app.use((req, res, next) => {
  console.log(`${req.method} request for '${req.url}'`);
  next();
});

app.use("/users", userRoutes);
app.use("/vehicles", vehicleRoutes);
app.use("/accelerations", accelerationRoutes);
app.use("/trips", tripRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
