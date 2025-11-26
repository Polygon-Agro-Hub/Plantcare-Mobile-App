import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import AntDesign from "react-native-vector-icons/AntDesign";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types";
import { useTranslation } from "react-i18next";
import { environment } from "@/environment/environment";
import Icon from "react-native-vector-icons/MaterialIcons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import DropDownPicker from "react-native-dropdown-picker";
import { set } from "lodash";
import LottieView from "lottie-react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useDispatch, useSelector } from 'react-redux';
import { fetchFarmsFromBackend, selectFarms} from '@/store/farmSlice';
import { AppDispatch } from '@/services/reducxStore';

type FarmCropEnrollRouteProp = RouteProp<RootStackParamList, "FarmCropEnroll">;

interface FarmCropEnrollProps {
  route: FarmCropEnrollRouteProp;
  navigation: StackNavigationProp<RootStackParamList, "FarmCropEnroll">;
  Data: CropCalender;
}

interface CropCalender {
  id: number;
  cropVarietyId: number;
  method: string;
}

interface Item {
  id: number;
  ongoingCultivationId: number;
  cropCalendar: number;
  startedAt: Date;
  extentha: number;
  extentac: number;
  extentp: number;
}

const FarmCropEnroll: React.FC<FarmCropEnrollProps> = ({ route, navigation }) => {
  const { cropId, status, onCulscropID, farmId } = route.params;
  const [natureOfCultivation, setNatureOfCultivation] = useState<string>("");
  const [cultivationMethod, setCultivationMethod] = useState<string>("");
  const [extentha, setExtentha] = useState<string>("");
  const [extentac, setExtentac] = useState<string>("");
  const [extentp, setExtentp] = useState<string>("");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [ongoingCropId, setongoingCropId] = useState<number>();
    
  const farmer = require("../../assets/images/Farmer.webp");

  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(false);
  const [cropCalender, setCropCalender] = useState<CropCalender | null>(null);
  const [search, setSearch] = useState<boolean>(false);
  const [formStatus, setFormStatus] = useState<string>(status);
  const [language, setLanguage] = useState("en");
  const [openNatureOfCultivation, setOpenNatureOfCultivation] = useState(false);
  const [openCultivationMethod, setOpenCultivationMethod] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  console.log("cropId:", cropId, "natureOfCultivation:", natureOfCultivation, "cultivationMethod:", cultivationMethod);
  console.log("Current Farm ID:", farmId); 

  const validateNumericInput = (text: string): string => {
    let filteredText = text.replace(/[^0-9]/g, '');
    
    const parts = filteredText.split('.');
    if (parts.length > 2) {
      filteredText = parts[0] + '.' + parts.slice(1).join('');
    }
    
    if (filteredText.startsWith('.')) {
      filteredText = '0' + filteredText;
    }
    
    if (parts.length === 2 && parts[1].length > 2) {
      filteredText = parts[0] + '.' + parts[1].substring(0, 2);
    }
    
    return filteredText;
  };

  useEffect(() => {
    const selectedLanguage = t("Cropenroll.LNG");
    setLanguage(selectedLanguage);
  }, [t]);

  const today = new Date();
  const minDate = new Date();
  minDate.setDate(today.getDate() - 7);

  console.log("user id", onCulscropID);

  const onChangeDate = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || startDate;
    if (currentDate > new Date()) {
      Alert.alert("Invalid Date", "The start date cannot be in the future.", [{ text: t("PublicForum.OK") }]);
      setShowDatePicker(false);
      return;
    }
    setStartDate(currentDate);
    setShowDatePicker(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      setStartDate(new Date());
      setShowDatePicker(false);

      return () => {};
    }, [])
  );

  const handleSearch = async () => {
    setSearch(false);
    if (!natureOfCultivation) {
      Alert.alert(
        t("Cropenroll.sorry"),
        t("Cropenroll.plzselectNatureOfCultivation"),
        [{ text: t("PublicForum.OK") }]
      );
      return;
    }
    if (!cultivationMethod) {
      Alert.alert(
        t("Cropenroll.sorry"),
        t("Cropenroll.plzselectCultivationMethod"),
        [{ text: t("PublicForum.OK") }]
      );
      return;
    }

    setLoading(true);
    try {
      const selectedLanguage = t("NewCrop.LNG");
      setLanguage(selectedLanguage);
      const res = await axios.get<CropCalender[]>(
        `${environment.API_BASE_URL}api/crop/get-crop-calender-details/${cropId}/${natureOfCultivation}/${cultivationMethod}`
      );

      if (res.data.length > 0) {
        setCropCalender(res.data[0]);
        setSearch(true);
      } else {
        Alert.alert(t("Cropenroll.sorry"), t("Cropenroll.notfound"), [{ text: t("PublicForum.OK") }]);
      }
    } catch (err) {
      Alert.alert(t("Cropenroll.sorry"), t("Cropenroll.notfound"), [{ text: t("PublicForum.OK") }]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFarmCertificate = async (ongoingCropId: number) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      
      if (!token) {
        console.log("No authentication token found");
        return null;
      }

      const response = await axios.get(
        `${environment.API_BASE_URL}api/certificate/get-farm-certificate/${farmId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      console.log("Certificate response:", response.data);
      return response.data;

    } catch (err) {
      console.error("Error fetching farm certificate:", err);
      return null;
    }
  };

  const createFarmQuestionnaire = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      
      if (!token) {
        console.log("No authentication token found for questionnaire creation");
        return false;
      }

      console.log("Creating farm questionnaire for farmId:", farmId);

      const response = await axios.post(
        `${environment.API_BASE_URL}api/certificate/farm-certificate-questionnaire/${farmId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 10000,
        }
      );
      
      console.log("Farm questionnaire created successfully:", response.data);
      return true;

    } catch (err) {
      console.error("Error creating farm questionnaire:", err);
      
      if (axios.isAxiosError(err)) {
        if (err.code === 'ECONNABORTED') {
          console.log("Questionnaire creation timeout - will retry later");
        } else if (err.response?.status === 500) {
          console.log("Server error creating questionnaire - may be duplicate or deadlock");
        }
      }
      
      return false;
    }
  };

  const checkCertificateAndNavigate = async (ongoingCropId: number) => {
    console.log("=== Starting checkCertificateAndNavigate ===");
    console.log("ongoingCropId:", ongoingCropId, "farmId:", farmId);
    
    try {
      const certificateData = await fetchFarmCertificate(ongoingCropId);
      console.log("Certificate data received:", certificateData);
      
      // Check if farm certificate exists
      if (certificateData && certificateData.status === "haveFarmCertificate" && certificateData.data && certificateData.data.length > 0) {
        console.log("Farm certificate found, creating questionnaire and navigating to FarmDetailsScreen");
        
        // Create questionnaire in background (non-blocking)
        createFarmQuestionnaire().then(success => {
          console.log("Background questionnaire creation:", success ? "succeeded" : "failed");
        }).catch(err => {
          console.log("Background questionnaire creation error (non-blocking):", err.message);
        });
        
        // Navigate to FarmDetailsScreen
        Alert.alert(
          t("Cropenroll.success"), 
          t("Cropenroll.EnrollSucess"),
          [
            {
              text: t("PublicForum.OK"),
              onPress: () => {
                console.log("Navigating to FarmDetailsScreen");
                navigation.navigate("Main", { 
                  screen: "FarmDetailsScreen",
                  params: {
                    farmId: farmId,
                  }
                });
              }
            },
          ],
          { cancelable: false }
        );
      } else {
        // No farm certificate exists, navigate to CropEarnCertificate
        console.log("No farm certificate found, navigating to CropEarnCertificate");
        
        // Validate farmId before navigation
        if (!farmId || farmId === 0) {
          console.error("Invalid farmId:", farmId);
          Alert.alert(
            t("Main.error"), 
            "Farm information is missing. Returning to previous screen.",
            [
              {
                text: t("PublicForum.OK"),
                onPress: () => navigation.navigate("Main", { 
                  screen: "FarmDetailsScreen",
                  params: {
                    farmId: farmId,
                  }
                })
              }
            ]
          );
          return;
        }
        
        Alert.alert(
          t("Cropenroll.success"), 
          t("Cropenroll.EnrollSucess"),
          [
            {
              text: t("PublicForum.OK"),
              onPress: () => {
                console.log("Navigating to CropEarnCertificate with:", {
                  cropId: String(ongoingCropId),
                  farmId: Number(farmId)
                });
                try {
                  navigation.navigate("CropEarnCertificate", {
                    cropId: String(ongoingCropId),
                    farmId: Number(farmId)
                  });
                } catch (navError) {
                  console.error("Navigation failed:", navError);
                  Alert.alert(
                    t("Main.error"),
                    "Navigation failed. Returning to previous screen.",
                    [
                      {
                        text: t("PublicForum.OK"),
                        onPress: () => navigation.navigate("Main", { 
                          screen: "FarmDetailsScreen",
                          params: {
                            farmId: farmId,
                          }
                        })
                      }
                    ]
                  );
                }
              }
            },
          ],
          { cancelable: false }
        );
      }
    } catch (error) {
      console.error("Error in checkCertificateAndNavigate:", error);
      
      // On any error, navigate back safely
      Alert.alert(
        t("Cropenroll.success"), 
        t("Cropenroll.EnrollSucess"),
        [
          {
            text: t("PublicForum.OK"),
            onPress: () => {
              console.log("Error occurred, navigating back to FarmDetailsScreen");
              navigation.navigate("Main", { 
                screen: "FarmDetailsScreen",
                params: {
                  farmId: farmId,
                }
              });
            }
          },
        ],
        { cancelable: false }
      );
    } finally {
      console.log("=== Ending checkCertificateAndNavigate ===");
      setIsLoading(false);
    }
  };

  const HandleEnrollBtn = async () => {
    if (!extentha && !extentac && !extentp) {
      Alert.alert(
        t("Cropenroll.sorry"),
        t("Cropenroll.EnterAtLeastOneExtent"),
        [{ text: t("PublicForum.OK") }],
        { cancelable: false }
      );
      return;
    }

    const extenthaValue = extentha || "0";
    const extentacValue = extentac || "0";
    const extentpValue = extentp || "0";

    if (!startDate) {
      Alert.alert(
        t("Cropenroll.sorry"),
        t("Cropenroll.EnterStartDate"),
        [{ text: t("PublicForum.OK") }],
        { cancelable: false }
      );
      return;
    }

    setIsLoading(true);

    const formattedStartDate = startDate.toISOString().split("T")[0];

    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert(t("Main.error"), t("Farms.No authentication token found"), [{ text: t("PublicForum.OK") }]);
        setIsLoading(false);
        return;
      }

      const res = await axios.post(
        `${environment.API_BASE_URL}api/farm/enroll-crop/${farmId}`,
        {
          cropId: cropCalender?.id,
          extentha: extenthaValue,
          extentac: extentacValue,
          extentp: extentpValue,
          startDate: formattedStartDate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const ongoingCropId = res.data.ongoingCultivationCropId;
      setongoingCropId(ongoingCropId);

      if (res.status === 200) {
        // Check certificate and navigate accordingly
        await checkCertificateAndNavigate(ongoingCropId);
      } else {
        Alert.alert(t("Main.error"), t("Main.somethingWentWrong"), [{ text: t("PublicForum.OK") }]);
        setIsLoading(false);
      }
    } catch (err) {
      setIsLoading(false);
      if (axios.isAxiosError(err)) {
        if (err.response) {
          const status = err.response.status;
          const message = err.response.data.message;

          if (status === 400) {
            if (message === "You have already enrolled in 3 crops") {
              Alert.alert(
                t("Main.error"),
                t("Cropenroll.enrollmentLimitReached"),
                [{ text: t("PublicForum.OK") }]
              );
            } else {
              Alert.alert(
                t("Cropenroll.sorry"),
                t("Cropenroll.alreadyEnrolled"),
                [{ text: t("PublicForum.OK") }],
                { cancelable: false }
              );
            }
          } else if (status === 401) {
            Alert.alert(t("Main.error"), t("Main.unauthorized"), [{ text: t("PublicForum.OK") }]);
          } else {
            Alert.alert(t("Main.error"), t("Main.somethingWentWrong"), [{ text: t("PublicForum.OK") }]);
          }
        } else if (err.request) {
          Alert.alert(t("Main.error"), t("Main.noResponseFromServer"), [{ text: t("PublicForum.OK") }]);
        } else {
          Alert.alert(t("Main.error"), t("Main.somethingWentWrong"), [{ text: t("PublicForum.OK") }]);
        }
      } else {
        Alert.alert(t("Main.error"), t("Main.somethingWentWrong"), [{ text: t("PublicForum.OK") }]);
      }
    }
  };

  const NatureOfCultivationCategories = [
    {
      key: "1",
      lebel: t("Cropenroll.ConventionalFarming"),
      value: "Conventional Farming",
      translationKey: t("FixedAssets.conventionalFarming"),
    },
    {
      key: "2",
      lebel: t("Cropenroll.GAPFarming"),
      value: "GAP Farming",
      translationKey: t("FixedAssets.gapFarming"),
    },
    {
      key: "3",
      lebel: t("Cropenroll.OrganicFarming"),
      value: "Organic Farming",
      translationKey: t("FixedAssets.organicFarming"),
    },
  ];

  const CultivationMethodCategories = [
    {
      key: "1",
      lebel: t("Cropenroll.OppenField"),
      value: "Open Field",
      translationKey: t("FixedAssets.openField"),
    },
    {
      key: "2",
      lebel: t("Cropenroll.ProtectedField"),
      value: "Protected Field",
      translationKey: t("FixedAssets.protectedField"),
    },
  ];

  useEffect(() => {
    const fetchOngoingCultivations = async () => {
      try {
        if (formStatus === "edit") {
          setLanguage(t("MyCrop.LNG"));
          const token = await AsyncStorage.getItem("userToken");
          const res = await axios.get<Item[]>(
            `${environment.API_BASE_URL}api/crop/get-user-ongoingculscrops/${onCulscropID}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          
          const ongoingCultivation = res.data[0];
          const formattedCrops = res.data.map((crop: Item) => ({
            ...crop,
            sstartedAt: moment(crop.startedAt).format("YYYY-MM-DD"),
          }));
          setExtentha(ongoingCultivation.extentha.toString());
          setExtentac(ongoingCultivation.extentac.toString());
          setExtentp(ongoingCultivation.extentp.toString());
          setStartDate(new Date(formattedCrops[0].sstartedAt));
        }
      } catch (err) {
        console.error("Error fetching ongoing cultivations:", err);
      }
    };
    fetchOngoingCultivations();
  }, [formStatus, onCulscropID]);

  const updateOngoingCultivation = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        console.error("User token not found");
        return;
      }
      const formattedDate = startDate.toISOString().split("T")[0];
      setIsLoading(true);

      const response = await axios.post(
        `${environment.API_BASE_URL}api/crop/update-ongoingcultivation`,
        {
          onCulscropID: onCulscropID,
          extentha: extentha,
          extentac: extentac,
          extentp: extentp,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        // Check certificate and navigate accordingly
        await checkCertificateAndNavigate(onCulscropID);
      } else {
        Alert.alert(
          t("Cropenroll.Failed"),
          t("Cropenroll.FialedOngoinCultivationUpdate"),
          [{ text: t("Farms.okButton") }]
        );
        setIsLoading(false);
      }
    } catch (error) {
      Alert.alert(
        t("Cropenroll.Failed"),
        t("Cropenroll.FialedOngoinCultivationUpdate"),
        [{ text: t("PublicForum.OK") }]
      );
      setIsLoading(false);
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <LottieView
            source={require('../../assets/jsons/loader.json')}
            autoPlay
            loop
            style={{ width: 300, height: 300 }}
          />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        className="flex-1 bg-[#FFFFFF]"
        style={{ paddingHorizontal: wp(4), paddingVertical: hp(2) }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-row justify-between mb-8 ">
          <TouchableOpacity onPress={() => navigation.goBack()} className="">
            <AntDesign name="left" size={24} color="#000502" />
          </TouchableOpacity>
          <View className="flex-1 items-center">
            <Text className="text-lg font-bold">
              {formStatus === "newAdd"
                ? t("Cropenroll.StartCultivaiton")
                : t("Cropenroll.UpdateCultivation")}
            </Text>
          </View>
        </View>

        <View className="items-center mb-5">
          <Image className="w-40 h-40" source={farmer} resizeMode="contain" />
        </View>

        {formStatus === "newAdd" ? (
          <View className="p-4">
            <View className=" mb-8 -z-10">
              <Text className="mb-2">{t("Farms.Nature of Cultivation")}</Text>
              <DropDownPicker
                open={openNatureOfCultivation}
                value={natureOfCultivation}
                setOpen={(open) => {
                  setOpenNatureOfCultivation(open);
                  setOpenCultivationMethod(false);
                }}
                setValue={setNatureOfCultivation}
                items={[
                  ...NatureOfCultivationCategories.map((item) => ({
                    label: item.lebel,
                    value: item.value,
                  })),
                ]}
                placeholder={t("Cropenroll.selectNaofCultivation")}
                placeholderStyle={{ color: "#6B7280" }}
                listMode="SCROLLVIEW"
                zIndex={10000}
                zIndexInverse={1000}
                dropDownContainerStyle={{
                  borderColor: "#ccc",
                  borderWidth: 1,
                  backgroundColor: "#FFFFFF",
                  maxHeight: 300,
                }}
                style={{
                  borderWidth: 1,
                  borderColor: "#ccc",
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  borderRadius: 30,
                }}
                textStyle={{
                  fontSize: 14,
                  color: "black",
                }}
                onOpen={dismissKeyboard}
              />
            </View>

            <View className=" mb-8   -z-20">
              <Text className="mb-2">{t("Farms.Cultivation Method")} </Text>
              <DropDownPicker
                open={openCultivationMethod}
                value={cultivationMethod}
                setOpen={(open) => setOpenCultivationMethod(open)}
                setValue={setCultivationMethod}
                items={[
                  ...CultivationMethodCategories.map((item) => ({
                    label: item.lebel,
                    value: item.value,
                  })),
                ]}
                placeholder={t("Cropenroll.selectCultivationMethod")}
                placeholderStyle={{ color: "#6B7280" }}
                listMode="SCROLLVIEW"
                zIndex={5000}
                zIndexInverse={1000}
                dropDownContainerStyle={{
                  borderWidth: 1,
                  borderColor: "#ccc",
                  backgroundColor: "#FFFFFF",
                }}
                style={{
                  borderWidth: 1,
                  borderColor: "#ccc",
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  borderRadius: 30,
                }}
                textStyle={{
                  fontSize: 14,
                }}
                onOpen={dismissKeyboard}
              />
            </View>

            <TouchableOpacity
              onPress={handleSearch}
              className={`p-3 mx-5 items-center rounded-full -z-30 ${
                isLoading ? "bg-gray-400" : "bg-gray-800"
              }`}
              disabled={isLoading}
            >
              <Text className="text-white text-base font-bold">
                {t("Cropenroll.search")}
              </Text>
            </TouchableOpacity>

            {search && (
              <>
                <Text className="mt-8">{t("Cropenroll.selectExtent")}</Text>
                <View className="flex-row items-center justify-between w-full mt-4  max-w-xl">
                  <View className="flex-row items-center space-x-1">
                    <Text className="text-right">{t("FixedAssets.ha")}</Text>
                    <TextInput                       
                      className="border border-gray-300 p-2 px-4 w-20 rounded-2xl bg-gray-100 text-left"                       
                      value={extentha}                       
                      onChangeText={(text) => {
                        const filteredText = text.replace(/[-*#.]/g, '');
                        setExtentha(filteredText);
                      }}                      
                      keyboardType="numeric"
                    />
                  </View>

                  <View className="flex-row items-center space-x-1 z-10">
                    <Text className="pl-1">{t("FixedAssets.ac")}</Text>
                    <TextInput
                      className="border border-gray-300 p-2 px-4 w-20 rounded-2xl bg-gray-100 text-left"
                      value={extentac}
                      onChangeText={(text) => {
                        const filteredText = text.replace(/[-*#.]/g, '');
                        setExtentac(filteredText);
                      }}   
                      keyboardType="numeric"
                    />
                  </View>

                  <View className="flex-row items-center space-x-1">
                    <Text className="text-right pl-1">
                      {t("FixedAssets.p")}
                    </Text>
                    <TextInput
                      className="border border-gray-300 p-2 w-20 px-4 rounded-2xl bg-gray-100 text-left"
                      value={extentp}
                      onChangeText={(text) => {
                        const filteredText = text.replace(/[-*#.]/g, '');
                        setExtentp(filteredText);
                      }}   
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <Text className="mt-4">{t("Cropenroll.selectStartDate")}</Text>
                <TouchableOpacity
                  onPress={() => setShowDatePicker((prev) => !prev)}
                  className="border-b border-gray-400 my-3 flex-row justify-between items-center p-3"
                >
                  <Text>{startDate.toDateString()}</Text>
                  <Icon name="arrow-drop-down" size={24} color="gray" />
                </TouchableOpacity>
                {showDatePicker &&
                  (Platform.OS === "ios" ? (
                    <View className=" justify-center items-center z-50 absolute ml-2 mt-[2%] bg-gray-100  rounded-lg">
                      <DateTimePicker
                        value={startDate}
                        mode="date"
                        display="inline"
                        style={{ width: 320, height: 260 }}
                        maximumDate={new Date()}
                        minimumDate={minDate}
                        onChange={onChangeDate}
                      />
                    </View>
                  ) : (
                    <DateTimePicker
                      value={startDate}
                      mode="date"
                      display="default"
                      maximumDate={new Date()}
                      minimumDate={minDate}
                      onChange={onChangeDate}
                    />
                  ))}

                <TouchableOpacity
                  onPress={HandleEnrollBtn}
                  className={`rounded-lg bg-[#26D041] mb-4 p-3 mt-8 items-center bottom-0 left-0 right-0  ${
                    isLoading ? "bg-gray-500" : "bg-gray-900"
                  }`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#fff" /> 
                  ) : (
                    <Text className="text-white text-base font-bold">
                      {t("Cropenroll.enroll")}
                    </Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        ) : (
          <>
            <View className="p-4">
              <Text className="mt-8">{t("Cropenroll.selectExtent")}</Text>
              <View className="flex-row items-center justify-between w-full mt-4 ">
                <View className="flex-row items-center space-x-1">
                  <Text className="text-right">{t("FixedAssets.ha")}</Text>
                  <TextInput
                    className="border border-gray-300 p-2 px-4 w-20 rounded-2xl bg-gray-100 text-left"
                    value={extentha}
                    onChangeText={(text) => {
                      const validatedText = validateNumericInput(text);
                      setExtentha(validatedText);
                    }}
                    keyboardType="numeric"
                    placeholder="0"
                  />
                </View>

                <View className="flex-row items-center space-x-1">
                  <Text className="text-right pl-1">{t("FixedAssets.ac")}</Text>
                  <TextInput
                    className="border border-gray-300 p-2 px-4 w-20 rounded-2xl bg-gray-100 text-left"
                    value={extentac}
                    onChangeText={(text) => {
                      const validatedText = validateNumericInput(text);
                      setExtentac(validatedText);
                    }}
                    keyboardType="numeric"
                    placeholder="0"
                  />
                </View>

                <View className="flex-row items-center space-x-1">
                  <Text className="text-right pl-1">{t("FixedAssets.p")}</Text>
                  <TextInput
                    className="border border-gray-300 p-2 w-20 px-4 rounded-2xl bg-gray-100 text-left"
                    value={extentp}
                    onChangeText={(text) => {
                      const validatedText = validateNumericInput(text);
                      setExtentp(validatedText);
                    }}
                    keyboardType="numeric"
                    placeholder="0"
                  />
                </View>
              </View>

              {showDatePicker &&
                (Platform.OS === "ios" ? (
                  <View className=" justify-center items-center z-50 absolute ml-2 mt-[2%] bg-gray-100  rounded-lg">
                    <DateTimePicker
                      value={startDate}
                      mode="date"
                      display="inline"
                      style={{ width: 320, height: 260 }}
                      maximumDate={new Date()}
                      minimumDate={minDate}
                      onChange={onChangeDate}
                    />
                  </View>
                ) : (
                  <DateTimePicker
                    value={startDate}
                    mode="date"
                    display="default"
                    maximumDate={new Date()}
                    minimumDate={minDate}
                    onChange={onChangeDate}
                  />
                ))}

              <TouchableOpacity
                onPress={updateOngoingCultivation}
                className={`rounded-lg bg-[#26D041] mb-4 p-3 mt-8 items-center bottom-0 left-0 right-0  ${
                  isLoading ? "bg-gray-500" : "bg-gray-900"
                }`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" /> 
                ) : (
                  <Text className="text-white text-base font-bold">
                    {t("Cropenroll.Update")}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default FarmCropEnroll;