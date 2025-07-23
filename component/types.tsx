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
  SigninOldUser:undefined;
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
    district: string
    };
  OTPEOLDUSER: {
    mobileNumber: string;
    
  };
  Dashboard: undefined;
  NewCrop: undefined;
  EngNavBar: undefined;
  SlectCrop: undefined;
  CropItem: undefined;
  SelectCrop: { cropId: string, selectedVariety: any };
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
  AssertsFixedView: {category:string, toolId:any};
  AddFixedAsset: undefined;
  fixedDashboard: undefined;
  News: { newsId: number };
  NewsSinhala: { newsId: number };
  NewsTamil: { newsId: number };
  MyCrop: undefined;
  SinhalaMyCrop: undefined;
  TamilMyCrop: undefined;

  PublicForum: { postId: string, userId: number };
  PublicForumReplies: { postId: string };
  PublicForumPost: undefined;
  CropCalander: { cropId: string; cropName: string, startedAt:Date,requiredImages:any , farmId:number};
  CropCalanderTamil: { cropId: string; cropName: string };
  CropCalanderSinhala: { cropId: string; cropName: string };
  UpdateAsset:{category:string,toolId:any};
  CropEnrol: { cropId: string, status: string, onCulscropID: number};

  MembershipScreen:undefined;
  ComplainForm: undefined;
  ComplainHistory: undefined;
  BankDetailsScreen: {
    firstName: string;
    lastName: string;
    nic: string;
    mobileNumber: string;
    selectedDistrict: string;
  };
  PrivacyPolicy:undefined;
  TermsConditions:undefined;
  LocationDetailsScreen:undefined;
  Main: { screen:keyof RootStackParamList; params?: any };
  EngEditProfile: undefined;

  DeleteFarmer: undefined;
  UserFeedback: undefined;
  TransactionHistory: undefined;
  TransactionReport:{ registeredFarmerId: number;
    userId: number;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    address: string;
    NICnumber: string;
    totalAmount: number;
    bankAddress: string | null;
    accountNumber: string | null;
    accountHolderName: string | null;
    bankName: string | null;
    branchName: string | null;
    selectedDate: string;
    empId: string;
    centerId: string;
    companyId: string;
    transactionDate : string;
  };
    AddNewFarmFirst: undefined;
    FirstLoginProView: undefined;
 FirstTimePackagePlan: { packageType: string };
PaymentGatewayView: { packageType: string };
 AddNewFarmBasicDetails: undefined;
  AddNewFarmSecondDetails: undefined;
Addmemberdetails: { loginCredentialsNeeded: string };
AddFarmList: undefined;
UnloackPro:undefined;
AddNewCrop:{farmId: Number};
FarmCropEnroll:{ cropId: string, status: string, onCulscropID: number ,farmId:Number};
FarmDetailsScreen:{farmId: Number}
EditManagersScreen: { farmId: number }; 
FarmCropItem:undefined
FarmCropVariety:undefined
EditFarm:{ farmId: number }
AddnewStaff:{ farmId: number }
EditStaffMember:{staffMemberId:number}
FarmCropSelectCard:undefined
MyCultivation:undefined
FarmSelectCrop: {
    cropId: string;
    selectedVariety: any;
    farmId: Number
  };
  PublicForumPostEdit: {
    postId: string
  }
  OwnerQRcode: undefined;
  LabororEngProfile: undefined;
  LabororDashbord: undefined
};

type MainTabParamList = {
  Dashboard: undefined;
  ComplainForm: undefined;
  ComplainHistory: undefined;
  EngEditProfile: undefined;
  MyCrop: undefined;
  TransactionHistory: undefined;

};
