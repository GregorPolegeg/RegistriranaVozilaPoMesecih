import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;
  FaceScan: undefined;
  LoginWithPicture: undefined;
  PhotoDetail: { photoId: string };
};

export type PhotoDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PhotoDetail'>;
export type PhotoDetailScreenRouteProp = RouteProp<RootStackParamList, 'PhotoDetail'>;
