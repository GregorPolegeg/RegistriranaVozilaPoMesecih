declare module "@env" {
  export const API_URL: string;
  export const KOMAR: string;
  export const PYTHON_URL: string;
}

declare module 'react-native-paho-mqtt' {
    export class Client {
      constructor(options: ClientOptions);
      connect(options?: ConnectOptions): Promise<void>;
      disconnect(): void;
      subscribe(topic: string, options?: SubscribeOptions): Promise<void>;
      unsubscribe(topic: string): Promise<void>;
      publish(message: Message): Promise<void>;
      on(event: 'connectionLost', callback: (responseObject: { errorCode: number; errorMessage: string }) => void): void;
      on(event: 'messageReceived', callback: (message: Message) => void): void;
    }
  
    export interface ClientOptions {
      uri: string;
      clientId: string;
      storage: {
        setItem: (key: string, item: string) => void;
        getItem: (key: string) => Promise<string | null>;
        removeItem: (key: string) => void;
      };
    }
  
    export interface ConnectOptions {
      userName?: string;
      password?: string;
      cleanSession?: boolean;
      keepAliveInterval?: number;
      timeout?: number;
      useSSL?: boolean;
      mqttVersion?: number;
      mqttVersionExplicit?: boolean;
      reconnect?: boolean;
    }
  
    export interface SubscribeOptions {
      qos?: 0 | 1 | 2;
    }
  
    export interface Message {
      destinationName: string;
      payloadString: string;
      qos: 0 | 1 | 2;
      retained: boolean;
      duplicate: boolean;
    }
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


interface Acceleration {
  id: number;
  vehicleId: number;
  startTime: string;
  endTime: string;
  distance: number;
}

type Locationn = {
    id: number;
    tripId: number;
    lat: number;
    lng: number;
    timestamp: string;
};

type Trip = {
    id: number;
    vehicleId: number;
    startTime: string;
    endTime: string;
    distance: number;
    locations: Locationn[];
  };
  
