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
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../types/types";
import { useTranslation } from "react-i18next";
import { environment } from "@/environment/environment";
import { MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";
import { useFocusEffect } from "@react-navigation/native";
import CustomHeader from "../../common/CustomHeader";
import GlobalSearchModal from "@/component/common/GlobalSearchModal";
import LoadingPage from "@/component/common/LoadingPage";

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

const farmer = require("../../../assets/images/crop-cultivation/farmer.webp");

const DropdownButton = ({
  value,
  placeholder,
  onPress,
}: {
  value: string;
  placeholder: string;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      borderWidth: 1,
      borderColor: "#ccc",
      backgroundColor: "#FFFFFF",

      paddingHorizontal: 12,
      paddingVertical: 14,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    }}
    className="h-[50px] rounded-3xl"
  >
    <Text style={{ color: value ? "#000000" : "#6B7280", fontSize: 14 }}>
      {value || placeholder}
    </Text>
    <MaterialIcons name="arrow-drop-down" size={24} color="#666" />
  </TouchableOpacity>
);

const FarmCropEnroll: React.FC<FarmCropEnrollProps> = ({
  route,
  navigation,
}) => {
  const { cropId, status, onCulscropID, farmId } = route.params;

  const [natureOfCultivation, setNatureOfCultivation] = useState<string>("");

  const [farmExtent, setFarmExtent] = useState<FarmExtent | null>(null);
  const [cultivationMethod, setCultivationMethod] = useState<string>("");

  const [extentha, setExtentha] = useState<string>("");
  const [extentac, setExtentac] = useState<string>("");
  const [extentp, setExtentp] = useState<string>("");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(false);
  const [cropCalender, setCropCalender] = useState<CropCalender | null>(null);
  const [search, setSearch] = useState<boolean>(false);
  const [formStatus, setFormStatus] = useState<string>(status);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [activeModal, setActiveModal] = useState<string | null>(null);
  const openModal = (name: string) => {
    Keyboard.dismiss();
    setActiveModal(name);
  };
  const closeModal = () => setActiveModal(null);

  const NatureOfCultivationOptions = [
    {
      label: t("Cropenroll.ConventionalFarming"),
      value: "Conventional Farming",
    },
    { label: t("Cropenroll.GAPFarming"), value: "GAP Farming" },
    { label: t("Cropenroll.OrganicFarming"), value: "Organic Farming" },
  ];

  const CultivationMethodOptions = [
    { label: t("Cropenroll.OppenField"), value: "Open Field" },
    { label: t("Cropenroll.ProtectedField"), value: "Protected Field" },
  ];

  const getLabelFromOptions = (
    options: { label: string; value: string }[],
    value: string,
  ) => options.find((o) => o.value === value)?.label || "";

  const today = new Date();
  const minDate = new Date();
  minDate.setDate(today.getDate() - 7);

  const onChangeDate = (_event: any, selectedDate?: Date) => {
    const current = selectedDate || startDate;
    if (current > new Date()) {
      Alert.alert("Invalid Date", "The start date cannot be in the future.", [
        { text: t("Main.OK") },
      ]);
      setShowDatePicker(false);
      return;
    }
    setStartDate(current);
    setShowDatePicker(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      setStartDate(new Date());
      setShowDatePicker(false);
      return () => {};
    }, []),
  );

  const handleSearch = async () => {
    setSearch(false);
    if (!natureOfCultivation) {
      Alert.alert(
        t("Main.Sorry"),
        t("Cropenroll.PleaseSelectNatureOfCultivation"),
        [{ text: t("Main.OK") }],
      );
      return;
    }
    if (!cultivationMethod) {
      Alert.alert(
        t("Main.Sorry"),
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
        Alert.alert(
          t("Main.Sorry"),
          t("Cropenroll.NoCropsFoundForTheSelectedMethodPleaseTryAgain"),
          [{ text: t("Main.OK") }],
        );
      }
    } catch {
      Alert.alert(
        t("Main.Sorry"),
        t("Cropenroll.NoCropsFoundForTheSelectedMethodPleaseTryAgain"),
        [{ text: t("Main.OK") }],
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchFarmExtent = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (!token) return;
        const response = await axios.get(
          `${environment.API_BASE_URL}api/farm/get-farm-extend/${farmId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (response.data?.status === "success")
          setFarmExtent(response.data.data);
      } catch (error) {
        console.error("Error fetching farm extent:", error);
      }
    };
    if (farmId) fetchFarmExtent();
  }, [farmId]);

  const convertToPerches = (ha: string, ac: string, p: string): number =>
    parseFloat(ha || "0") * 160 +
    parseFloat(ac || "0") * 4 +
    parseFloat(p || "0");

  const validateExtent = (): boolean => {
    if (!farmExtent) {
      Alert.alert(
        t("Main.Error"),
        "Unable to verify farm extent. Please try again.",
        [{ text: t("Main.OK") }],
      );
      return false;
    }
    const cultivationPerches = convertToPerches(extentha, extentac, extentp);
    if (cultivationPerches > farmExtent.availableExtent.totalPerches) {
      const {
        hectares: aHa,
        acres: aAc,
        perches: aP,
      } = farmExtent.availableExtent;
      const {
        hectares: cHa,
        acres: cAc,
        perches: cP,
      } = farmExtent.cultivatedExtent;
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

  const createFarmQuestionnaire = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) return false;
      await axios.post(
        `${environment.API_BASE_URL}api/certificate/farm-certificate-questionnaire/${farmId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 },
      );
      return true;
    } catch (err) {
      console.error("Error creating farm questionnaire:", err);
      return false;
    }
  };

  const fetchFarmCertificate = async (ongoingCropId: number) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) return null;
      const response = await axios.get(
        `${environment.API_BASE_URL}api/certificate/get-farm-certificate/${farmId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data;
    } catch {
      return null;
    }
  };

  const checkCertificateAndNavigate = async (ongoingCropId: number) => {
    try {
      const certificateData = await fetchFarmCertificate(ongoingCropId);
      const goToDashboard = () =>
        navigation.navigate("Main", {
          screen: "FarmDetailsScreen",
          params: { farmId },
        });

      if (certificateData?.status === "haveFarmCertificate") {
        createFarmQuestionnaire();
        Alert.alert(
          t("Main.Success"),
          t("Cropenroll.SuccessfullyEnrolledTheCrop"),
          [{ text: t("Main.OK"), onPress: goToDashboard }],
          { cancelable: false },
        );
      } else if (certificateData?.status === "noFarmCertificate") {
        if (!farmId || farmId === 0) {
          Alert.alert(t("Main.Error"), "Farm information is missing.", [
            { text: t("Main.OK"), onPress: goToDashboard },
          ]);
          return;
        }
        Alert.alert(
          t("Main.Success"),
          t("Cropenroll.SuccessfullyEnrolledTheCrop"),
          [
            {
              text: t("Main.OK"),
              onPress: () =>
                navigation.navigate("CropEarnCertificate", {
                  cropId: String(ongoingCropId),
                  cropIdcrop: cropId,
                  farmId: Number(farmId),
                }),
            },
          ],
          { cancelable: false },
        );
      } else {
        Alert.alert(
          t("Main.Success"),
          t("Cropenroll.SuccessfullyEnrolledTheCrop"),
          [{ text: t("Main.OK"), onPress: goToDashboard }],
          { cancelable: false },
        );
      }
    } catch {
      Alert.alert(
        t("Main.Success"),
        t("Cropenroll.SuccessfullyEnrolledTheCrop"),
        [
          {
            text: t("Main.OK"),
            onPress: () =>
              navigation.navigate("Main", {
                screen: "FarmDetailsScreen",
                params: { farmId },
              }),
          },
        ],
        { cancelable: false },
      );
    } finally {
      setIsLoading(false);
    }
  };

  const HandleEnrollBtn = async () => {
    if (!extentha && !extentac && !extentp) {
      Alert.alert(
        t("Main.Sorry"),
        t("Cropenroll.PleaseEnterAtLeastOneExtent"),
        [{ text: t("Main.OK") }],
        { cancelable: false },
      );
      return;
    }
    if (!validateExtent()) return;

    setIsLoading(true);
    const formattedStartDate = startDate.toISOString().split("T")[0];

    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert(t("Main.Error"), t("Farms.NoAuthenticationTokenFound"), [
          { text: t("Main.OK") },
        ]);
        setIsLoading(false);
        return;
      }

      const res = await axios.post(
        `${environment.API_BASE_URL}api/farm/enroll-crop/${farmId}`,
        {
          cropId: cropCalender?.id,
          extentha: extentha || "0",
          extentac: extentac || "0",
          extentp: extentp || "0",
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
        await checkCertificateAndNavigate(res.data.ongoingCultivationCropId);
      } else {
        Alert.alert(
          t("Main.Error"),
          t("Main.SomethingWentWrongPleaseTryAgainlater"),
          [{ text: t("Main.OK") }],
        );
        setIsLoading(false);
      }
    } catch (err) {
      setIsLoading(false);
      if (axios.isAxiosError(err) && err.response) {
        const { status, data } = err.response;
        if (status === 400) {
          Alert.alert(
            t("Main.Error"),
            data.message === "You have already enrolled in 3 crops"
              ? t("Cropenroll.YouHaveReachedTheLimitOf3CropEnrollments")
              : t("Cropenroll.ThisCropIsAlreadyEnrolled"),
            [{ text: t("Main.OK") }],
            { cancelable: false },
          );
        } else if (status === 401) {
          Alert.alert(t("Main.Error"), t("Main.unauthorized"), [
            { text: t("Main.OK") },
          ]);
        } else {
          Alert.alert(
            t("Main.Error"),
            t("Main.SomethingWentWrongPleaseTryAgainlater"),
            [{ text: t("Main.OK") }],
          );
        }
      } else {
        Alert.alert(
          t("Main.Error"),
          t("Main.SomethingWentWrongPleaseTryAgainlater"),
          [{ text: t("Main.OK") }],
        );
      }
    }
  };

  useEffect(() => {
    const fetchOngoingCultivations = async () => {
      if (formStatus !== "edit") return;
      try {
        const token = await AsyncStorage.getItem("userToken");
        const res = await axios.get<Item[]>(
          `${environment.API_BASE_URL}api/crop/get-user-ongoingculscrops/${onCulscropID}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const crop = res.data[0];
        const formatted = moment(crop.startedAt).format("YYYY-MM-DD");
        setExtentha(crop.extentha.toString());
        setExtentac(crop.extentac.toString());
        setExtentp(crop.extentp.toString());
        setStartDate(new Date(formatted));
      } catch (err) {
        console.error("Error fetching ongoing cultivations:", err);
      }
    };
    fetchOngoingCultivations();
  }, [formStatus, onCulscropID]);

  const updateOngoingCultivation = async () => {
    if (!validateExtent()) return;
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) return;
      setIsLoading(true);
      const response = await axios.post(
        `${environment.API_BASE_URL}api/crop/update-ongoingcultivation`,
        { onCulscropID, extentha, extentac, extentp },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (response.status === 200) {
        await checkCertificateAndNavigate(onCulscropID);
      } else {
        Alert.alert(
          t("Cropenroll.Failed"),
          t("Cropenroll.UnableToUpdateCultivationDetailsPleaseTryAgain"),
          [{ text: t("Main.OK") }],
        );
        setIsLoading(false);
      }
    } catch {
      Alert.alert(
        t("Cropenroll.Failed"),
        t("Cropenroll.UnableToUpdateCultivationDetailsPleaseTryAgain"),
        [{ text: t("Main.OK") }],
      );
      setIsLoading(false);
    }
  };

  if (loading) {
    return <LoadingPage fullScreen />;
  }

  const renderExtentInputs = () => (
    <View className="flex-row items-center justify-between w-full mt-4 max-w-xl">
      {[
        { label: t("FixedAssets.ha"), value: extentha, setter: setExtentha },
        { label: t("FixedAssets.ac"), value: extentac, setter: setExtentac },
        { label: t("FixedAssets.p"), value: extentp, setter: setExtentp },
      ].map(({ label, value, setter }) => (
        <View key={label} className="flex-row items-center gap-1">
          <Text className="text-right">{label}</Text>
          <TextInput
            className="border border-gray-300 p-2 px-4 w-20 rounded-3xl h-[50px] bg-gray-100 text-left"
            value={value}
            style={{ color: "#000000" }}
            placeholderTextColor="#000000"
            onChangeText={(text) => setter(text.replace(/[-*#.]/g, ""))}
            keyboardType="numeric"
            placeholder="0"
          />
        </View>
      ))}
    </View>
  );

  const renderDatePicker = () =>
    showDatePicker &&
    (Platform.OS === "ios" ? (
      <View className="justify-center items-center z-50 absolute ml-2 mt-[2%] bg-gray-100 rounded-lg">
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
    ));

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
            {/* Nature of Cultivation */}
            <Text className="mb-2">{t("Farms.NatureOfCultivation")}</Text>
            <DropdownButton
              value={getLabelFromOptions(
                NatureOfCultivationOptions,
                natureOfCultivation,
              )}
              placeholder={t("Cropenroll.SelectNatureOfCultivation")}
              onPress={() => openModal("natureOfCultivation")}
            />

            {/* Cultivation Method */}
            <Text className="mt-6 mb-2">{t("Farms.CultivationMethod")}</Text>
            <DropdownButton
              value={getLabelFromOptions(
                CultivationMethodOptions,
                cultivationMethod,
              )}
              placeholder={t("Cropenroll.SelectCultivationMethod")}
              onPress={() => openModal("cultivationMethod")}
            />

            {/* Search button */}
            <View className="justify-center items-center px-6">
              <TouchableOpacity
                onPress={handleSearch}
                className={`w-full rounded-3xl h-[50px] justify-center items-center shadow-lg elevation-6 mt-8 mb-6  ${
                  isLoading ? "bg-gray-400" : "bg-gray-800"
                }`}
                disabled={isLoading}
              >
                <Text className="text-white text-lg font-bold">
                  {t("Main.Search...")}
                </Text>
              </TouchableOpacity>
            </View>
            {/* Results */}
            {search && (
              <>
                <Text className="mt-8">{t("Farms.Extent")}</Text>
                {renderExtentInputs()}

                <Text className="mt-4">{t("Cropenroll.SelectStartDate")}</Text>
                <TouchableOpacity
                  onPress={() => setShowDatePicker((p) => !p)}
                  className="border-b border-gray-400 my-3 flex-row justify-between items-center p-3"
                >
                  <Text>{startDate.toDateString()}</Text>
                  <MaterialIcons
                    name="arrow-drop-down"
                    size={24}
                    color="#666"
                  />
                </TouchableOpacity>
                {renderDatePicker()}

                <View className="justify-center items-center px-6">
                  <TouchableOpacity
                    onPress={HandleEnrollBtn}
                     className={`w-full rounded-3xl h-[50px] justify-center items-center shadow-lg elevation-6 mt-8 mb-6  ${
                  isLoading ? "bg-gray-400" : "bg-gray-800"
                }`}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text className="text-white text-lg font-bold">
                        {t("Cropenroll.Enroll")}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        ) : (
          <View className="px-6">
            <Text className="mt-8">{t("Main.Extent")}</Text>
            {renderExtentInputs()}
            {renderDatePicker()}

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

      <GlobalSearchModal
        visible={activeModal === "natureOfCultivation"}
        onClose={closeModal}
        title={t("Farms.NatureOfCultivation")}
        data={NatureOfCultivationOptions}
        selectedItems={natureOfCultivation ? [natureOfCultivation] : []}
        onSelect={(items) => {
          setNatureOfCultivation(items[0] || "");
          setSearch(false);
        }}
        showSearch={false}
      />

      <GlobalSearchModal
        visible={activeModal === "cultivationMethod"}
        onClose={closeModal}
        title={t("Farms.CultivationMethod")}
        data={CultivationMethodOptions}
        selectedItems={cultivationMethod ? [cultivationMethod] : []}
        onSelect={(items) => {
          setCultivationMethod(items[0] || "");
          setSearch(false);
        }}
        showSearch={false}
      />
    </KeyboardAvoidingView>
  );
};

export default FarmCropEnroll;
