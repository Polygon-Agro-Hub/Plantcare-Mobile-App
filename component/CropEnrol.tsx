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
  SafeAreaView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import AntDesign from "react-native-vector-icons/AntDesign";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "./types";
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
type CropEnrolRouteProp = RouteProp<RootStackParamList, "CropEnrol">;

interface CropEnrolProps {
  route: CropEnrolRouteProp;
  navigation: StackNavigationProp<RootStackParamList, "CropEnrol">;
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

const CropEnrol: React.FC<CropEnrolProps> = ({ route, navigation }) => {
  const { cropId, status, onCulscropID } = route.params;
  const [natureOfCultivation, setNatureOfCultivation] = useState<string>("");
  const [cultivationMethod, setCultivationMethod] = useState<string>("");
  const [extentha, setExtentha] = useState<string>("");
  const [extentac, setExtentac] = useState<string>("");
  const [extentp, setExtentp] = useState<string>("");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const farmer = require("../assets/images/Farmer.webp");
  // const farmer = require("../assets/jsons/cropenroll.json");

  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(false);
  const [cropCalender, setCropCalender] = useState<CropCalender | null>(null);
  const [search, setSearch] = useState<boolean>(false);
  const [formStatus, setFormStatus] = useState<string>(status);
  const [language, setLanguage] = useState("en");
  const [openNatureOfCultivation, setOpenNatureOfCultivation] = useState(false);
  const [openCultivationMethod, setOpenCultivationMethod] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);



   const validateNumericInput = (text: string): string => {
    // Remove negative signs, special characters, and allow only numbers and single decimal point
    let filteredText = text.replace(/[^0-9]/g, '');
    
    // Ensure only one decimal point
    const parts = filteredText.split('.');
    if (parts.length > 2) {
      filteredText = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Prevent starting with decimal point
    if (filteredText.startsWith('.')) {
      filteredText = '0' + filteredText;
    }
    
    // Limit decimal places to 2
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

  console.log("user id",onCulscropID)

  const onChangeDate = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || startDate;
    if (currentDate > new Date()) {
      Alert.alert("Invalid Date", "The start date cannot be in the future.", [
        { text: "OK" },
      ]);
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
        t("Cropenroll.plzselectNatureOfCultivation")
      );
      return;
    }
    if (!cultivationMethod) {
      Alert.alert(
        t("Cropenroll.sorry"),
        t("Cropenroll.plzselectCultivationMethod")
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
        Alert.alert(t("Cropenroll.sorry"), t("Cropenroll.notfound"));
      }
    } catch (err) {
      Alert.alert(t("Cropenroll.sorry"), t("Cropenroll.notfound"));
    } finally {
      setLoading(false);
    }
  };

  const HandleEnrollBtn = async () => {
    if (!extentha && !extentac && !extentp) {
      Alert.alert(
        t("Cropenroll.sorry"),
        t("Cropenroll.EnterAtLeastOneExtent"),
        [
          {
            text: "OK",
          },
        ],
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
        [
          {
            text: "OK",
          },
        ],
        { cancelable: false }
      );
      return;
    }

    setIsLoading(true);

    const formattedStartDate = startDate.toISOString().split("T")[0];

    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert(t("Main.error"), t("Main.unauthorized"));
        return;
      }

      const res = await axios.post(
        `${environment.API_BASE_URL}api/crop/enroll-crop`,
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

      if (res.status === 200) {
        Alert.alert(t("Cropenroll.success"), t("Cropenroll.EnrollSucess"));
        setIsLoading(false);
        navigation.navigate("Main", { screen: "MyCrop" });
      } else {
        Alert.alert(t("Main.error"), t("Main.somethingWentWrong"));
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response) {
          const status = err.response.status;
          const message = err.response.data.message;

          if (status === 400) {
            if (message === "You have already enrolled in 3 crops") {
              Alert.alert(
                t("Main.error"),
                t("Cropenroll.enrollmentLimitReached")
              );
              setIsLoading(false);
            } else {
              Alert.alert(
                t("Cropenroll.sorry"),
                t("Cropenroll.alreadyEnrolled"),
                [
                  {
                    text: "OK",
                  },
                ],
                { cancelable: false }
              );
            }
            setIsLoading(false);
          } else if (status === 401) {
            Alert.alert(t("Main.error"), t("Main.unauthorized"));
            setIsLoading(false);
          } else {
            Alert.alert(t("Main.error"), t("Main.somethingWentWrong"));
            setIsLoading(false);
          }
        } else if (err.request) {
          Alert.alert(t("Main.error"), t("Main.noResponseFromServer"));
          setIsLoading(false);
        } else {
          Alert.alert(t("Main.error"), t("Main.somethingWentWrong"));
          setIsLoading(false);
        }
      } else {
        Alert.alert(t("Main.error"), t("Main.somethingWentWrong"));
        setIsLoading(false);
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
          console.log("hbjsvdI",res.data)
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
      } catch (err) {}
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
          // startedAt: formattedDate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        Alert.alert(
          t("Cropenroll.success"),
          t("Cropenroll.OngoinCultivationUpdate"),
          [
            {
              text: "OK",
              onPress: () => navigation.goBack(),
            },
          ],
          { cancelable: false }
        );
        setIsLoading(false);
      } else {
        Alert.alert(
          t("Cropenroll.Failed"),
          t("Cropenroll.FialedOngoinCultivationUpdate")
        );
        setIsLoading(false);
      }
    } catch (error) {
      Alert.alert(
        t("Cropenroll.Failed"),
        t("Cropenroll.FialedOngoinCultivationUpdate")
      );
      setIsLoading(false);
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  if (loading) {
    return (
      // <View className="flex-1 justify-center items-center">
      //   <ActivityIndicator size="large" color="#00ff00" />
      // </View>
       <SafeAreaView className="flex-1 bg-white">
              <View className="flex-1 justify-center items-center">
                <LottieView
                  source={require('../assets/jsons/loader.json')}
                  autoPlay
                  loop
                  style={{ width: 300, height: 300 }}
                />
              </View>
            </SafeAreaView>
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
          {/* <LottieView
          source={farmer}
          autoPlay
          loop
          style={{ width: 130, height: 130, marginLeft: -10 }}
        /> */}
        </View>

        {formStatus === "newAdd" ? (
          <View className="p-4">
            <View className=" mb-8  justify-center items-center -z-10">
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
                }}
                textStyle={{
                  fontSize: 14,
                }}
                onOpen={dismissKeyboard}
              />
            </View>

            <View className=" mb-8  justify-center items-center -z-20">
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
                }}
                textStyle={{
                  fontSize: 14,
                }}
                onOpen={dismissKeyboard}
              />
            </View>

            <TouchableOpacity
              onPress={handleSearch}
              className="bg-gray-800 p-3 items-center rounded-lg -z-30"
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
                    {/* <TextInput
                      className="border border-gray-300 p-2 px-4 w-20 rounded-2xl bg-gray-100 text-left"
                      value={extentha}
                      onChangeText={setExtentha}
                      keyboardType="numeric"
                    /> */}
                  <TextInput                       
  className="border border-gray-300 p-2 px-4 w-20 rounded-2xl bg-gray-100 text-left"                       
  value={extentha}                       
  onChangeText={(text) => {
    // Only allow numbers and dots, remove - and special characters
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
                     // onChangeText={setExtentac}
                       onChangeText={(text) => {
    // Only allow numbers and dots, remove - and special characters
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
                   //   onChangeText={setExtentp}
                    onChangeText={(text) => {
    // Only allow numbers and dots, remove - and special characters
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
                  // className=" rounded-lg bg-[#26D041] p-3 mb-4 mt-4 items-center bottom-0 left-0 right-0 "
                  className={`rounded-lg bg-[#26D041] mb-4 p-3 mt-8 items-center bottom-0 left-0 right-0  ${
                    isLoading ? "bg-gray-500" : "bg-gray-900"
                  }`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#fff" /> // Show loader when isLoading is true
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

              {/* <Text className="mt-4">{t("Cropenroll.selectStartDate")} </Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker((prev) => !prev)}
                className="border-b border-gray-400 my-3 flex-row justify-between items-center p-3"
              >
                <Text>{startDate.toDateString()}</Text>
                <Icon name="arrow-drop-down" size={24} color="gray" />
              </TouchableOpacity> */}

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
                // className=" rounded-lg bg-[#26D041] mb-4 p-3 mt-8 items-center bottom-0 left-0 right-0 "
                className={`rounded-lg bg-[#26D041] mb-4 p-3 mt-8 items-center bottom-0 left-0 right-0  ${
                  isLoading ? "bg-gray-500" : "bg-gray-900"
                }`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" /> // Show loader when isLoading is true
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

export default CropEnrol;
