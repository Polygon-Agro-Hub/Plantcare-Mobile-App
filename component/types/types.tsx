export type RootStackParamList = {
  Lanuage: undefined;
  Signin: undefined;
  Signup: undefined;
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
    district: string;
  };
  OTPEOLDUSER: {
    mobileNumber: string;
  };
  Dashboard: undefined;
  NewCrop: undefined;
  EngNavBar: undefined;
  SlectCrop: undefined;
  CropItem: undefined;
  SelectCrop: { cropId: string; selectedVariety: any };
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
  QRcode: undefined;
  WeatherForecast: undefined;
  FiveDayForecast: undefined;
  SinProfile: undefined;
  SinEditProfile: undefined;
  TamilProfile: undefined;
  TamilEditProfile: undefined;
  SinQRcode: undefined;
  TamilQRcode: undefined;
  CurrentAssert: { farmId?: Number | number; farmName?: string } | undefined;
  AddAsset: { farmId?: Number | number; farmName?: string } | undefined;
  RemoveAsset: undefined;
  AssertsFixedView: { category: string; toolId?: any; farmId?: Number | number; farmName?: string };
  AddFixedAsset: { farmId?: Number | number; farmName?: string } | undefined;
  fixedDashboard: { farmId?: Number | number; farmName?: string } | undefined;
  News: { newsId: number };
  NewsSinhala: { newsId: number };
  NewsTamil: { newsId: number };
  MyCrop: undefined;
  SinhalaMyCrop: undefined;
  TamilMyCrop: undefined;
  SoilGridsScreen: undefined;
  PublicForum: { postId: string; userId: number };
  PublicForumReplies: { postId: string; own: string; userId: number };
  PublicForumPost: undefined;
  CropCalander: {
    cropId: string;
    cropName: string;
    startedAt: Date;
    requiredImages: any;
    farmId: number;
    farmName?: string;
    imageId?: Number;
  };
  CropCalanderTamil: { cropId: string; cropName: string };
  CropCalanderSinhala: { cropId: string; cropName: string };
  UpdateAsset: {
    category: string;
    toolId: any;
    selectedTools: number[];
  };
  CropEnrol: { cropId: string; status: string; onCulscropID: number };

  MembershipScreen: undefined;
  ComplainForm: undefined;
  ComplainHistory: undefined;
  BankDetailsScreen: {
    firstName: string;
    lastName: string;
    nic: string;
    mobileNumber: string;
    selectedDistrict: string;
  };
  PrivacyPolicy: undefined;
  TermsConditions: undefined;
  LocationDetailsScreen: undefined;
  Main: { screen: keyof RootStackParamList; params?: any };
  EditProfile: undefined;
  ManagerDashbord: undefined;
  DeleteFarmer: undefined;
  UserFeedback: undefined;
  TransactionHistory: undefined;
  TransactionReport: {
    registeredFarmerId: number;
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
    transactionDate: string;
  };
  AddNewFarmFirst: undefined;
  FirstLoginProView: undefined;
  FirstTimePackagePlan: { packageType: string };
  PaymentGatewayView: { packageType: string };
  PaymentGatewayeRenew: { packageType: string };
  AddNewFarmBasicDetails: {
    membership?: string;
    currentFarmCount?: number;
    fromSecondScreen?: boolean;
  };
  AddNewFarmSecondDetails: undefined;
  Addmemberdetails: { loginCredentialsNeeded: string };
  AddFarmList: undefined;
  UnloackPro: undefined;
  UnLockProRenew: undefined;
  AddNewFarmUnloackPro: undefined;
  AddNewCrop: { farmId: Number };
  FarmCropEnroll: {
    cropId: string;
    status: string;
    onCulscropID: number;
    farmId: Number;
  };
  FarmDetailsScreen: { farmId: Number; farmName: string };
  EditManagersScreen: {
    farmId: number;
    membership: string;
    renew: string;
    regCode: string;
  };
  ManageMembersManager: {
    farmId?: Number;
    farmName?: string;
    imageId?: Number;
  };
  ManageMembersSupervisor: {
    farmId?: Number;
    farmName?: string;
    imageId?: Number;
  };
  FarmCropItem: undefined;
  FarmCropVariety: undefined;
  EditFarm: { farmId: number; from?: string };
  FromFramEditFarm: { farmId: number; from?: string };
  AddnewStaff: { farmId: number; regCode: string };
  ManagerAddStaff: { farmId: number };
  EditStaffMember: {
    staffMemberId: number;
    farmId: number;
    membership: string;
    renew: string;
    regCode: string;
  };
  SupervisorAddStaff: { farmId: number };
  ManageEditscreen: { staffMemberId: number; farmId: number; farmName: string };
  SupervisorEditScreen: {
    staffMemberId: number;
    farmId: number;
    farmName: string;
  };
  FarmCropSelectCard: undefined;
  MyCultivation: undefined;
  FarmSelectCrop: {
    cropId: string;
    selectedVariety: any;
    farmId: Number;
  };
  PublicForumPostEdit: {
    postId: string;
  };
  OwnerQRcode: undefined;
  ManagerFarmDetails: {
    farmId?: Number;
    farmName?: string;
    imageId?: Number;
  };
  LabororEngProfile: undefined;
  LabororDashbord: undefined;
  SupervisorProfileView: undefined;
  ManagerProfileView: undefined;
  FarmCropVarietySelectCard: {
    cropId: Number;
    selectedVariety: string;
    farmId: number;
  };

  FarmCropCalander: {
    cropId: string;
    cropName: string;
    startedAt: Date;
    requiredImages: any;
    farmId: number;
    farmName: string;
    ongoingCropId: string;
    hasCertificate: boolean;
  };
  FarmCertificateTask: { farmId: Number; farmName: string };
  FarmCurrectAssetRemove: { farmId: Number; farmName: string };
  EarnCertificate: {
    farmId: number;
    registrationCode?: string;
  };
  CultivationEarnCertificate: {
    farmId: number;
    registrationCode?: string;
    farmName?: string;
  };
  PaymentScreen: {
    certificateName: string;
    certificatePrice: string;
    certificateValidity: string;
    certificateId: number;
    farmId?: number;
    registrationCode?: string;
    processFee?: number;
    fullTotal?: number;
  };
  PaymentSummary: {
    subTotal?: number;
    processingFeePercentage?: number;
    processingFee?: number;
    fullTotal?: number;
    title?: string;
    isRequestInspection?: boolean;
    requestItems?: any[];
    nextScreen?: string;
    nextScreenParams?: any;
    isCertificatePayment?: boolean;
    certificateType?: "Farm" | "Cultivation" | "Crop" | "CropAfterEnroll";
    certificateId?: number;
    cropId?: string;
    farmId?: number;
    farmName?: string;
    certificateName?: string;
    validityMonths?: number;
  } | undefined;
  CropEarnCertificate: {
    cropId: string;
    farmId: Number;
    cropIdcrop: string;
  };
  CropEarnCertificateAfterEnroll: {
    cropId: string;
    farmId: Number;
  };
  CropPaymentScreen: {
    certificateName: string;
    certificatePrice: string;
    certificateValidity: string;
    certificateId: number;
    cropId?: string;
    farmId: Number;
    processFee?: number;
    fullTotal?: number;
  };
  CropPaymentScreenAfterEnroll: {
    certificateName: string;
    certificatePrice: string;
    certificateValidity: string;
    certificateId: number;
    cropId?: string;
    farmId: Number;
    processFee?: number;
    fullTotal?: number;
  };
  CultivationPaymentScreen: {
    certificateName: string;
    certificatePrice: string;
    certificateValidity: string;
    certificateId: number;
    farmId?: number;
    registrationCode?: string;
    farmName?: string;
    processFee?: number;
    fullTotal?: number;
  };
  RequestInspectionForm: undefined;
  RequestHistory: undefined;
  InvestmentAndLoan: undefined;
  InvestmentRequestForm: undefined;
  RequestReview: { request: RequestItem; status: string };
  ViewInvestmentRequestLetter: { request: RequestItem };
  GoViCapitalRequests: undefined;
  RequestLetter: {
    crop: string;
    cropId: string;
    extent: { ha: string; ac: string; p: string };
    investment: string;
    expectedYield: string;
    startDate: string;
    nicFrontImage: string;
    nicBackImage: string;
    plotNumber: string;
    streetName: string;
    landCity: string;
  };
  RequestSummery: {
    request: {
      id: string;
      serviceName: string;
      status: "Request Placed" | "Request Reviewed" | "Finished";
      scheduledDate: string;
      date: string;
      serviceId: string;
      farmerId: string;
      farmId: string;
      jobId: string;
      isAllCrops: boolean;
      createdAt: string;
      englishName: string;
      sinhalaName: string;
      tamilName: string;
      srvFee: number;
      doneDate: string;
    };
  };
  FramcropCalenderwithcertificate: {
    cropId: string;
    cropName: string;
    startedAt: Date;
    requiredImages: any;
    farmId: Number;
    farmName: string;
    ongoingCropId: string;
  };
  GoviPensionInformation: undefined;
  // In your RootStackParamList, update CartScreen entry:
CartScreen: {
  shopname: string;
  branchId: number;  // ← add this line
};
  GoviPensionForm: undefined;
  GoviPensionStatus: undefined;
  MyPensionAccount: undefined;
  ProjectStatus: { jobid: string; id: string };
  FarmCalMenu: undefined;
  CropPlanningCalculatorsMenu: undefined;
  IrrigationWaterCalculatorsMenu: undefined;
  SoilFertilizerCalculatorsMenu: undefined;
  PesticidePestCalculatorsMenu: undefined;
  EconomicCostCalendarsMenu: undefined;
  WeatherClimateCalculatorsMenu: undefined;
  PostHarvestStorageCalculatorsMenu: undefined;
  SeedRateCalculator: undefined;
  ShelfLifeCalculator: undefined;
  ColdStorageCalculator: undefined;
  GrainDryingCalculator: undefined;
  YieldEstimationCalculator: undefined;
  GerminationRateCalculator: undefined;
  PlantPopulationCalculator: undefined;
  FertilizerRequirementCalculator: undefined;
  CompostMixingCalculator: undefined;
  SprinklerSystemCalculator: undefined;
  LaborCostCalculator: undefined;
  LoanRepaymentCalculator: undefined;
  BreakEvenPriceCalculator: undefined;
  FarmBudgetProfitCalculator: undefined;
  DripIrrigationCalculator: undefined;
  GoviShopLoadingScreen: undefined;
  ExploreShopsScreen: undefined;
  GoviShopCartScreen: undefined;
  GoviShopProfileScreen: {
    shopId: number;
    branchId: number;
    shopname: string;
    logo: string;
    adress: string;
    adressLoaction:string;
  };
  LocationAccess: undefined;
  OrderHistory:undefined;
  InvoiceScreen:{
    orderId:Number
  };
  CheckoutScreen: {
    cartItems: CartItem[];
    branchId: number;
    subtotal: number;
    serviceCharge: number;
    total: number;
    cartCount: number;
    shopName: string;
  };
  ViewProduct: {
    product: {
      id: string;
      name: string;
      level: string;
      unit: string;
      discountPrice?: number;
      normalPrice: number;
      image: string;
      categoryId: string;
      availableQty?: number;
      description?: string;
    };
    LoadingPage: {
      messageStyle: string;
    };
  
  };
};

export interface RequestItem {
  id: string;
  cropId: string;
  farmerId: string;
  officerId: string;
  jobId: string;
  extentha: number;
  extentac: number;
  extentp: number;
  investment: string;
  expectedYield: string;
  startDate: string;
  nicFront: string;
  nicBack: string;
  assignDate: string;
  publishDate: string;
  assignedBy: string;
  publishBy: string;
  reqStatus: string;
  publishStatus: string;
  createdAt: string;
  cropNameEnglish: string;
  cropNameSinhala: string;
  cropNameTamil: string;
}

export type ProductType =
  | "BOTTLE"
  | "ROLL"
  | "PACK"
  | "LOOSE_WEIGHT"
  | "LOOSE_VOLUME"
  | "PIECES"
  | "EQUIPMENT";

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  subProductId: string;
  subProdColorId?: string;
  equipColorId?: string;
  variantLabel: string;
  pricePerUnit: number;
  originalPrice?: number;
  quantity: number;
  image: string;
  type: ProductType;
  colorCode?: string;
  availableQty?: number;
  isOutOfStock?: boolean;
}
