import express from 'express';
import userRoutes from './src/prisma/routes/userRoutes';
import vehicleRoutes from './src/prisma/routes/vehicleRoutes';

const app = express();

app.use(express.json());

app.use('/user', userRoutes);
app.use('/vehicle', vehicleRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
