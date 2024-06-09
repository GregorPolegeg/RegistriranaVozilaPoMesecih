import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthContextType {
  isLoggedIn: boolean;
  token: string | null;
  userId: string | null;
  vehicleId: number | null;
  addVehicle: (id: number) => void;
  login: (id: string, userId: string) => void;
  login2FA: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [vehicleId, setVehicleId] = useState<number | null>(null);
  const [twoFactor, setTwoFactor] = useState<boolean>(false);

  useEffect(() => {
    const loadUserId = async () => {
      try {
        const savedToken = await AsyncStorage.getItem("token");
        const userId = await AsyncStorage.getItem("userId");
        if (savedToken && userId) {
          setToken(savedToken);
          setUserId(userId);
        }
      } catch (error) {
        console.error("Failed to load token or userId from storage", error);
      }
    };

    loadUserId();
  }, []);

  const login = async (id: string, userId: string) => {
    setToken(id);
    setUserId(userId);
    try {
      await AsyncStorage.setItem("token", id);
    } catch (error) {
      console.error("Failed to save userId to storage", error);
    }
  };

  const login2FA = () => {
    setTwoFactor(true);
  };

  const addVehicle = async (id: number) => {
    setVehicleId(id);
    try {
      await AsyncStorage.removeItem("token");
    } catch (error) {
      console.error("Failed to remove userId from storage", error);
    }
  };

  const logout = async () => {
    setToken(null);
    setUserId(null);
    try {
      await AsyncStorage.removeItem("token");
    } catch (error) {
      console.error("Failed to remove userId from storage", error);
    }
  };
  const isLoggedIn = token !== null && twoFactor;

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        userId,
        token,
        login,
        logout,
        addVehicle,
        vehicleId,
        login2FA,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
