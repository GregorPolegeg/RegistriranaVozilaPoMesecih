import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;
  FaceScan: undefined;
  VehicleList: undefined;
  UserProfile: undefined;
  LoginWithPicture: undefined;
  TripTracker: undefined;
  MQTTClient: undefined;
  DisplayTripScreen: { tripId: number };
  DisplayTripsScreen: undefined;
  PhotoDetail: { photoId: string };
};

