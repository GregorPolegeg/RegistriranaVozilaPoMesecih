declare module "@env" {
  export const API_URL: string;
}

interface Vehicle {
  id: number;
  brand: string;
  model: string;
  vin: string;
  fuelType: string;
  bodyType: string;
  trips?: Trip[];
  accelerations?: Acceleration[];
}

interface Profile {
  email: string;
  firstName: string;
  lastName: string;
  vehicles: Vehicle[];
}

interface Trip {
  id: number;
  vehicleId: number;
  startTime: string;
  endTime: string;
  distance: number;
}

interface Acceleration {
  id: number;
  vehicleId: number;
  startTime: string;
  endTime: string;
  distance: number;
}
