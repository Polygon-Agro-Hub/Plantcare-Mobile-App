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
import DateTimePicker from "@react-native-community/datetimepicker";
import CustomDatePicker from "../common/CustomDatePicker";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types/types";
import { useTranslation } from "react-i18next";
import { environment } from "@/environment/environment";
import Icon from "@expo/vector-icons/MaterialIcons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import { useFocusEffect } from "@react-navigation/native";
import GlobalSearchModal from "../../component/common/GlobalSearchModal";
import CustomHeader from "../common/CustomHeader";
import LoadingPage from "../common/LoadingPage";

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

// NEW: same shape as FarmCropEnroll
interface FarmExtent {
  id: number;
  farmName: string;
  totalExtent: {
    hectares: number;
    acres: number;
    perches: number;
    totalPerches: number;
  };
  cultivatedExtent: {
    hectares: number;
    acres: number;
    perches: number;
    totalPerches: number;
  };
  availableExtent: {
    hectares: number;
    acres: number;
    perches: number;
    totalPerches: number;
  };
}

const farmer = require("../../assets/images/crop-cultivation/farmer.webp");

const CropEnrol: React.FC<CropEnrolProps> = ({ route, navigation }) => {
  const { cropId, status, onCulscropID, farmId } = route.params;
  const [natureOfCultivation, setNatureOfCultivation] = useState<string>("");
  const [cultivationMethod, setCultivationMethod] = useState<string>("");
  const [extentha, setExtentha] = useState<string>("");
  const [extentac, setExtentac] = useState<string>("");
  const [extentp, setExtentp] = useState<string>("");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState<boolean>(false);

  const formatDisplayDate = (date: Date) => {
    if (!date) return "";
    const rawDays = t("Calendar.Days", { returnObjects: true });
    const rawMonths = t("Calendar.Months", { returnObjects: true });

    const days = Array.isArray(rawDays)
      ? rawDays
      : [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];
    const months = Array.isArray(rawMonths)
      ? rawMonths
      : [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ];

    const dayName = days[date.getDay()] || "";
    const monthName = months[date.getMonth()] || "";
    const dayNum = date.getDate();
    const year = date.getFullYear();

    if (i18n.language === "en") {
      return `${dayName ? `${dayName}, ` : ""}${dayNum} ${monthName} ${year}`;
    }
    return `${dayName ? `${dayName}, ` : ""}${year} ${monthName} ${dayNum}`;
  };
  const [cropCalender, setCropCalender] = useState<CropCalender | null>(null);
  const [search, setSearch] = useState<boolean>(false);
  const [formStatus, setFormStatus] = useState<string>(status);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showNatureModal, setShowNatureModal] = useState<boolean>(false);
  const [showMethodModal, setShowMethodModal] = useState<boolean>(false);

  const [farmExtent, setFarmExtent] = useState<FarmExtent | null>(null);
  const [originalExtent, setOriginalExtent] = useState<{
    ha: string;
    ac: string;
    p: string;
  }>({ ha: "0", ac: "0", p: "0" });

  const validateNumericInput = (text: string): string => {
    let filteredText = text.replace(/[^0-9]/g, "");

    const parts = filteredText.split(".");
    if (parts.length > 2) {
      filteredText = parts[0] + "." + parts.slice(1).join("");
    }

    if (filteredText.startsWith(".")) {
      filteredText = "0" + filteredText;
    }

    if (parts.length === 2 && parts[1].length > 2) {
      filteredText = parts[0] + "." + parts[1].substring(0, 2);
    }

    return filteredText;
  };

  const today = new Date();
  const minDate = new Date();
  minDate.setDate(today.getDate() - 7);

  const onChangeDate = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || startDate;
    if (currentDate > new Date()) {
      Alert.alert("Invalid Date", "The start date cannot be in the future.", [
        { text: t("Main.OK") },
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
      return () => { };
    }, []),
  );

  // Correct unit conversion (1 acre = 160 perches, 1 hectare ≈ 395.36875 perches)
  const convertToPerches = (ha: string, ac: string, p: string): number =>
    parseFloat(ha || "0") * 395.36875 +
    parseFloat(ac || "0") * 160 +
    parseFloat(p || "0");

  // Re-fetch farm extent fresh right before validating, instead of trusting
  // a value grabbed once at mount — this avoids the stale/not-yet-updated
  // availableExtent problem on a just-created record.
  const validateExtent = async (): Promise<boolean> => {
    const token = await AsyncStorage.getItem("userToken");
    if (!token) return false;

    let currentFarmExtent: FarmExtent | null = null;
    try {
      const response = await axios.get(
        `${environment.API_BASE_URL}api/farm/get-farm-extend/${farmId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (response.data?.status === "success") {
        currentFarmExtent = response.data.data;
        setFarmExtent(currentFarmExtent);
      }
    } catch (error) {
      console.error("Error re-fetching farm extent:", error);
    }

    if (!currentFarmExtent) {
      Alert.alert(
        t("Main.Error"),
        "Unable to verify farm extent. Please try again.",
        [{ text: t("Main.OK") }],
      );
      return false;
    }

    const newExtentPerches = convertToPerches(extentha, extentac, extentp);

    const originalExtentPerches =
      formStatus === "edit"
        ? convertToPerches(originalExtent.ha, originalExtent.ac, originalExtent.p)
        : 0;

    const effectiveAvailablePerches =
      currentFarmExtent.availableExtent.totalPerches + originalExtentPerches;

    if (newExtentPerches > effectiveAvailablePerches) {
      const { hectares: aHa, acres: aAc, perches: aP } = currentFarmExtent.availableExtent;
      const { hectares: cHa, acres: cAc, perches: cP } = currentFarmExtent.cultivatedExtent;

      Alert.alert(
        t("Main.Sorry"),
        `${t("Cropenroll.CultivationExtentExceedsAvailableFarmExtent")}\n\n` +
          `${t("Cropenroll.AvailableExtent")}: ${aHa} ${t("FixedAssets.ha")}, ${aAc} ${t("FixedAssets.ac")}, ${aP} ${t("FixedAssets.p")}\n` +
          `${t("Cropenroll.AlreadyCultivated")}: ${cHa} ${t("FixedAssets.ha")}, ${cAc} ${t("FixedAssets.ac")}, ${cP} ${t("FixedAssets.p")}`,
        [{ text: t("Main.OK") }],
      );
      return false;
    }
    return true;
  };

  const handleSearch = async () => {
    setSearch(false);
    if (!natureOfCultivation) {
      Alert.alert(
        t("Cropenroll.sorry"),
        t("Cropenroll.PleaseSelectNatureOfCultivation"),
        [{ text: t("Main.OK") }],
      );
      return;
    }
    if (!cultivationMethod) {
      Alert.alert(
        t("Cropenroll.sorry"),
        t("Cropenroll.PleaseSelectCultivationMethod"),
        [{ text: t("Main.OK") }],
      );
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get<CropCalender[]>(
        `${environment.API_BASE_URL}api/crop/get-crop-calender-details/${cropId}/${natureOfCultivation}/${cultivationMethod}`,
      );

      if (res.data.length > 0) {
        setCropCalender(res.data[0]);
        setSearch(true);
      } else {
        Alert.alert(t("Cropenroll.sorry"), t("Cropenroll.NoCropsFoundForTheSelectedMethodPleaseTryAgain"), [
          { text: t("Main.OK") },
        ]);
      }
    } catch (err) {
      Alert.alert(t("Cropenroll.sorry"), t("Cropenroll.NoCropsFoundForTheSelectedMethodPleaseTryAgain"), [
        { text: t("Main.OK") },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const HandleEnrollBtn = async () => {
    if (!extentha && !extentac && !extentp) {
      Alert.alert(
        t("Cropenroll.sorry"),
        t("Cropenroll.PleaseEnterAtLeastOneExtent"),
        [{ text: t("Main.OK") }],
        { cancelable: false },
      );
      return;
    }

    // FIX: validateExtent is async — must be awaited, otherwise the Promise
    // object is always truthy and this check never blocks.
    const isValid = await validateExtent();
    if (!isValid) return;

    const extenthaValue = extentha || "0";
    const extentacValue = extentac || "0";
    const extentpValue = extentp || "0";

    if (!startDate) {
      Alert.alert(
        t("Cropenroll.sorry"),
        t("Cropenroll.EnterTheStartDateOfCultivation"),
        [{ text: t("Main.OK") }],
        { cancelable: false },
      );
      return;
    }

    setIsLoading(true);

    const formattedStartDate = startDate.toISOString().split("T")[0];

    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert(t("Main.Error"), t("Main.unauthorized"), [
          { text: t("Main.OK") },
        ]);
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
        },
      );

      if (res.status === 200) {
        Alert.alert(t("Main.Success"), t("Cropenroll.SuccessfullyEnrolledTheCrop"), [
          { text: t("Main.OK") },
        ]);
        setIsLoading(false);
        navigation.navigate("Main", { screen: "MyCrop" });
      } else {
        Alert.alert(t("Main.Error"), t("Main.SomethingWentWrongPleaseTryAgainlater"), [
          { text: t("Main.OK") },
        ]);
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response) {
          const status = err.response.status;
          const message = err.response.data.message;

          if (status === 400) {
            if (message === "You have already enrolled in 3 crops") {
              Alert.alert(
                t("Main.Error"),
                t("Cropenroll.YouHaveReachedTheLimitOf3CropEnrollments"),
                [{ text: t("Main.OK") }],
              );
              setIsLoading(false);
            } else {
              Alert.alert(
                t("Cropenroll.sorry"),
                t("Cropenroll.ThisCropIsAlreadyEnrolled"),
                [{ text: t("Main.OK") }],
                { cancelable: false },
              );
            }
            setIsLoading(false);
          } else if (status === 401) {
            Alert.alert(t("Main.Error"), t("Main.unauthorized"), [
              { text: t("Main.OK") },
            ]);
            setIsLoading(false);
          } else {
            Alert.alert(t("Main.Error"), t("Main.SomethingWentWrongPleaseTryAgainlater"), [
              { text: t("Main.OK") },
            ]);
            setIsLoading(false);
          }
        } else if (err.request) {
          Alert.alert(t("Main.Error"), t("Main.noResponseFromServer"), [
            { text: t("Main.OK") },
          ]);
          setIsLoading(false);
        } else {
          Alert.alert(t("Main.Error"), t("Main.SomethingWentWrongPleaseTryAgainlater"), [
            { text: t("Main.OK") },
          ]);
          setIsLoading(false);
        }
      } else {
        Alert.alert(t("Main.Error"), t("Main.SomethingWentWrongPleaseTryAgainlater"), [
          { text: t("Main.OK") },
        ]);
        setIsLoading(false);
      }
    }
  };

  const NatureOfCultivationCategories = [
    {
      label: t("Cropenroll.ConventionalFarming"),
      value: "Conventional Farming",
    },
    {
      label: t("Cropenroll.GAPFarming"),
      value: "GAP Farming",
    },
    {
      label: t("Cropenroll.OrganicFarming"),
      value: "Organic Farming",
    },
  ];

  const CultivationMethodCategories = [
    {
      label: t("Cropenroll.OppenField"),
      value: "Open Field",
    },
    {
      label: t("Cropenroll.ProtectedField"),
      value: "Protected Field",
    },
  ];

  useEffect(() => {
    const fetchOngoingCultivations = async () => {
      try {
        if (formStatus === "edit") {
          const token = await AsyncStorage.getItem("userToken");
          const res = await axios.get<Item[]>(
            `${environment.API_BASE_URL}api/crop/get-user-ongoingculscrops/${onCulscropID}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          const ongoingCultivation = res.data[0];
          const formattedCrops = res.data.map((crop: Item) => ({
            ...crop,
            sstartedAt: moment(crop.startedAt).format("YYYY-MM-DD"),
          }));
          setExtentha(ongoingCultivation.extentha.toString());
          setExtentac(ongoingCultivation.extentac.toString());
          setExtentp(ongoingCultivation.extentp.toString());
          setOriginalExtent({
            ha: ongoingCultivation.extentha.toString(),
            ac: ongoingCultivation.extentac.toString(),
            p: ongoingCultivation.extentp.toString(),
          });
          setStartDate(new Date(formattedCrops[0].sstartedAt));
        }
      } catch (err) { }
    };
    fetchOngoingCultivations();
  }, [formStatus, onCulscropID]);

  const updateOngoingCultivation = async () => {
    // FIX: same as above — await the async validation before proceeding.
    const isValid = await validateExtent();
    if (!isValid) return;

    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        console.error("User token not found");
        return;
      }

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
        },
      );

      if (response.status === 200) {
        Alert.alert(
          t("Main.Success"),
          t("Cropenroll.CultivationDetailsUpdatedSuccessfully"),
          [
            {
              text: t("Main.OK"),
              onPress: () => navigation.goBack(),
            },
          ],
          { cancelable: false },
        );
        setIsLoading(false);
      } else {
        Alert.alert(
          t("Cropenroll.Failed"),
          t("Cropenroll.UnableToUpdateCultivationDetailsPleaseTryAgain"),
          [{ text: t("Main.OK") }],
        );
        setIsLoading(false);
      }
    } catch (error) {
      Alert.alert(
        t("Cropenroll.Failed"),
        t("Cropenroll.UnableToUpdateCultivationDetailsPleaseTryAgain"),
        [{ text: t("Main.OK") }],
      );
      setIsLoading(false);
    }
  };

  const getLabelByValue = (
    items: { label: string; value: string }[],
    value: string,
  ) => items.find((i) => i.value === value)?.label ?? "";

  if (loading) {
    return <LoadingPage fullScreen />;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        className="flex-1 bg-[#FFFFFF]"
        keyboardShouldPersistTaps="handled"
      >
        <CustomHeader
          title={
            formStatus === "newAdd"
              ? t("Cropenroll.StartYourCultivaiton")
              : t("Cropenroll.UpdateYourCultivation")
          }
          navigation={navigation}
          onBackPress={() => navigation.goBack()}
        />

        <View className="items-center mb-5">
          <Image className="w-40 h-40" source={farmer} resizeMode="contain" />
        </View>

        {formStatus === "newAdd" ? (
          <View className="px-6">
            <TouchableOpacity
              className="border border-gray-300 rounded-lg px-4 py-3 mb-8 flex-row justify-between items-center bg-white"
              onPress={() => {
                Keyboard.dismiss();
                setShowNatureModal(true);
              }}
            >
              <Text
                className={
                  natureOfCultivation
                    ? "text-gray-900 text-sm"
                    : "text-gray-400 text-sm"
                }
              >
                {natureOfCultivation
                  ? getLabelByValue(
                    NatureOfCultivationCategories,
                    natureOfCultivation,
                  )
                  : t("Cropenroll.SelectNatureOfCultivation")}
              </Text>
              <Icon name="arrow-drop-down" size={24} color="gray" />
            </TouchableOpacity>

            <TouchableOpacity
              className="border border-gray-300 rounded-lg px-4 py-3 mb-8 flex-row justify-between items-center bg-white"
              onPress={() => {
                Keyboard.dismiss();
                setShowMethodModal(true);
              }}
            >
              <Text
                className={
                  cultivationMethod
                    ? "text-gray-900 text-sm"
                    : "text-gray-400 text-sm"
                }
              >
                {cultivationMethod
                  ? getLabelByValue(
                    CultivationMethodCategories,
                    cultivationMethod,
                  )
                  : t("Cropenroll.SelectCultivationMethod")}
              </Text>
              <Icon name="arrow-drop-down" size={24} color="gray" />
            </TouchableOpacity>

            <View className="justify-center items-center px-6">
              <TouchableOpacity
                onPress={handleSearch}
                className={`w-full rounded-3xl h-[50px] justify-center items-center shadow-lg elevation-6 mt-8 mb-6 ${
                  isLoading ? "bg-gray-400" : "bg-gray-800"
                }`}
                disabled={isLoading}
              >
                <Text className="text-white text-lg font-bold">
                  {t("Main.Search...")}
                </Text>
              </TouchableOpacity>
            </View>

            {search && (
              <>
                <Text className="mt-8">{t("Farms.Extent")}</Text>
                <View className="flex-row items-center justify-between w-full mt-4 max-w-xl">
                  <View className="flex-row items-center gap-1">
                    <Text className="text-right">{t("FixedAssets.ha")}</Text>
                    <TextInput
                      className="border border-gray-300 p-2 px-4 w-20 rounded-2xl bg-gray-100 text-left"
                      value={extentha}
                      onChangeText={(text) => {
                        const filteredText = text.replace(/[-*#.]/g, "");
                        setExtentha(filteredText);
                      }}
                      keyboardType="numeric"
                    />
                  </View>

                  <View className="flex-row items-center gap-1 z-10">
                    <Text className="pl-1">{t("FixedAssets.ac")}</Text>
                    <TextInput
                      className="border border-gray-300 p-2 px-4 w-20 rounded-2xl bg-gray-100 text-left"
                      value={extentac}
                      onChangeText={(text) => {
                        const filteredText = text.replace(/[-*#.]/g, "");
                        setExtentac(filteredText);
                      }}
                      keyboardType="numeric"
                    />
                  </View>

                  <View className="flex-row items-center gap-1">
                    <Text className="text-right pl-1">
                      {t("FixedAssets.p")}
                    </Text>
                    <TextInput
                      className="border border-gray-300 p-2 w-20 px-4 rounded-2xl bg-gray-100 text-left"
                      value={extentp}
                      onChangeText={(text) => {
                        const filteredText = text.replace(/[-*#.]/g, "");
                        setExtentp(filteredText);
                      }}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <Text className="mt-4">{t("Main.SelectStartDate")}</Text>
                <TouchableOpacity
                  onPress={() => setShowDatePicker((prev) => !prev)}
                  className="border-b border-gray-400 my-3 flex-row justify-between items-center p-3"
                >
                  <Text>{formatDisplayDate(startDate)}</Text>
                  <Icon name="arrow-drop-down" size={24} color="gray" />
                </TouchableOpacity>
                <CustomDatePicker
                  visible={showDatePicker}
                  onClose={() => setShowDatePicker(false)}
                  value={startDate}
                  onConfirm={(date) => onChangeDate(null, date)}
                  minimumDate={minDate}
                  maximumDate={new Date()}
                  title={t("Cropenroll.SelectStartDate", "Select Start Date")}
                  cancelText={t("Main.Cancel", "Cancel")}
                  confirmText={t("Main.OK", "OK")}
                />

                <View className="justify-center items-center px-6">
                  <TouchableOpacity
                    onPress={HandleEnrollBtn}
                    className={`w-full rounded-3xl h-[50px] justify-center items-center shadow-lg elevation-6 mt-8 mb-6 ${
                      isLoading ? "bg-gray-400" : "bg-gray-800"
                    }`}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text className="text-white text-lg font-bold">
                        {t("Main.Enroll")}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        ) : (
          <View className="px-6">
            <Text className="mt-8">{t("Farms.Extent")}</Text>
            <View className="flex-row items-center justify-between w-full mt-4">
              <View className="flex-row items-center gap-1">
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

              <View className="flex-row items-center gap-1">
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

              <View className="flex-row items-center gap-1">
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

            <CustomDatePicker
              visible={showDatePicker}
              onClose={() => setShowDatePicker(false)}
              value={startDate}
              onConfirm={(date) => onChangeDate(null, date)}
              minimumDate={minDate}
              maximumDate={new Date()}
              title={t("Cropenroll.SelectStartDate", "Select Start Date")}
              cancelText={t("Main.Cancel", "Cancel")}
              confirmText={t("Main.OK", "OK")}
            />

            <View className="justify-center items-center px-6">
              <TouchableOpacity
                onPress={updateOngoingCultivation}
                className={`w-full rounded-3xl h-[50px] justify-center items-center shadow-lg elevation-6 mt-8 mb-6 ${
                  isLoading ? "bg-gray-500" : "bg-gray-900"
                }`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="text-white text-lg font-bold">
                    {t("Main.Update")}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Nature of Cultivation Modal */}
      <GlobalSearchModal
        visible={showNatureModal}
        onClose={() => setShowNatureModal(false)}
        title={t("Cropenroll.SelectNatureOfCultivation")}
        data={NatureOfCultivationCategories}
        selectedItems={natureOfCultivation ? [natureOfCultivation] : []}
        onSelect={(items) => {
          if (items.length > 0) setNatureOfCultivation(items[0]);
        }}
        multiSelect={false}
        showSearch={false}
      />

      {/* Cultivation Method Modal */}
      <GlobalSearchModal
        visible={showMethodModal}
        onClose={() => setShowMethodModal(false)}
        title={t("Cropenroll.SelectCultivationMethod")}
        data={CultivationMethodCategories}
        selectedItems={cultivationMethod ? [cultivationMethod] : []}
        onSelect={(items) => {
          if (items.length > 0) setCultivationMethod(items[0]);
        }}
        multiSelect={false}
        showSearch={false}
      />
    </KeyboardAvoidingView>
  );
};

export default CropEnrol;