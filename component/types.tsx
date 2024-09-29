// types.ts (or similar file)
export type RootStackParamList = {
  Lanuage: undefined; // This screen has no params
  SigninSelection: undefined;
  SigninSinhala: undefined;
  SigninSeTamil: undefined;
  SignupForumTamil: undefined;
  SigninTamil: undefined;
  SuccessScreen: undefined;
  SigninSinhalasc: undefined;
  // News:undefined;
  Signin: undefined;
  SignupForum: undefined;
  Selectedcrop: undefined;
  SignumpFS: undefined;
  SignupFT: undefined;
  Splash: undefined;
  Verify: undefined;
  TamilVerify: undefined;
  OTPS: {
    mobileNumber: string;
    firstName: string;
    lastName: string;
    nic: string;
  };
  OTPE: {
    mobileNumber: string;
    firstName: string;
    lastName: string;
    nic: string;
  };
  Dashboard: undefined;
  NewCrop: undefined;
  EngNavBar: undefined;
  SlectCrop: undefined;
  CropItem: undefined;
  SelectCrop: { cropId: string };
  SinhalaVerify: undefined;
  SinhalaDashbord: undefined;
  SinhalaNewCrop: undefined;
  OtpTamilverification: {
    mobileNumber: string;
    firstName: string;
    lastName: string;
    nic: string;
  };
  TamilDashbord: undefined;
  TamilNewCrop: undefined;
  EngProfile: undefined;
  EngQRcode: undefined;
  EngEditProfile: undefined;
  WeatherForecastEng: undefined;
  FiveDayForecastEng: undefined;
  FiveDayForecastSinhala: undefined;
  WeatherForecastSinhala: undefined;
  SinProfile: undefined;
  SinEditProfile: undefined;
  WeatherForecastTamil: undefined;
  FiveDayForecastTamil: undefined;
  TamilProfile: undefined;
  TamilEditProfile: undefined;
  SinQRcode: undefined;
  TamilQRcode: undefined;
  CurrentAssert: undefined;
  AddAsset: undefined;
  RemoveAsset: undefined;
  AssertsFixedView: undefined;
  AddFixedAsset: undefined;
  fixedDashboard: undefined;
  News: { newsId: number };
  NewsSinhala: { newsId: number };
  NewsTamil: { newsId: number };
  MyCrop: undefined;
  SinhalaMyCrop: undefined;
  TamilMyCrop: undefined;

  PublicForum: { postId: string };
  PublicForumReplies: { postId: string };
  PublicForumPost: undefined;
  CropCalander: { cropId: string; cropName: string };
  CropCalanderTamil: { cropId: string; cropName: string };
  CropCalanderSinhala: { cropId: string; cropName: string };

  // Add other screens and their params here
};
