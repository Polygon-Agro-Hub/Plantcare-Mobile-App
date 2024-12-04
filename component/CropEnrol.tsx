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

  console.log("cropcalender params", cropId, status, onCulscropID);
  const [natureOfCultivation, setNatureOfCultivation] = useState<string>("");
  const [cultivationMethod, setCultivationMethod] = useState<string>("");
  const [extent, setExtent] = useState<string>("");
  const [extentha, setExtentha] = useState<string>("");
  const [extentac, setExtentac] = useState<string>("");
  const [extentp, setExtentp] = useState<string>("");
  const [unit, setUnit] = useState<string>("ha");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const farmer = require("../assets/images/Farmer.png");
  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(false);
  const [cropCalender, setCropCalender] = useState<CropCalender | null>(null);
  const [search, setSearch] = useState<boolean>(false);
  const [formStatus, setFormStatus] = useState<string>(status);
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    const selectedLanguage = t("Cropenroll.LNG");
    setLanguage(selectedLanguage);
  }, [t]);

  const today = new Date();
  const minDate = new Date();
  minDate.setDate(today.getDate() - 7);

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
        Alert.alert(t("Cropenroll.success"), t("Cropenroll.found"));
        setSearch(true);
      } else {
        Alert.alert(t("Cropenroll.sorry"), t("Cropenroll.notfound"));
      }
    } catch (err) {
      Alert.alert(t("Main.error"), t("Main.somethingWentWrong"));
    } finally {
      setLoading(false);
    }
  };

  const HandleEnrollBtn = async () => {
    if (!extentha && !extentac && !extentp) {
      Alert.alert(t("Cropenroll.sorry"), t("Cropenroll.EnterExtent"));
      return;
    }
    if (!startDate) {
      Alert.alert(t("Cropenroll.sorry"), t("Cropenroll.EnterStartDate"));
      return;
    }
  
    const formattedStartDate = startDate.toISOString().split("T")[0];
  
    console.log("Enroll clicked with:", {
      cropId,
      extent,
      formattedStartDate,
    });
  
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
          extentha: extentha,
          extentac: extentac,
          extentp: extentp,
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
        navigation.navigate("MyCrop");
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
            } else {
              Alert.alert(
                t("Cropenroll.sorry"),
                t("Cropenroll.alreadyEnrolled"),
                [
                  {
                    text: "OK",
                    onPress: () => navigation.goBack(),
                  },
                ],
                { cancelable: false }
              );
            }
          } else if (status === 401) {
            Alert.alert(t("Main.error"), t("Main.unauthorized"));
          } else {
            Alert.alert(t("Main.error"), t("Main.somethingWentWrong"));
          }
        } else if (err.request) {
          Alert.alert(t("Main.error"), t("Main.noResponseFromServer"));
        } else {
          Alert.alert(t("Main.error"), t("Main.somethingWentWrong"));
        }
      } else {
        Alert.alert(t("Main.error"), t("Main.somethingWentWrong"));
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
          console.log("formattedCrops", formattedCrops);
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
      console.log(extentha, extentac, extentp, onCulscropID);
      const formattedDate = startDate.toISOString().split("T")[0];

      const response = await axios.post(
        `${environment.API_BASE_URL}api/crop/update-ongoingcultivation`,
        {
          onCulscropID: onCulscropID,
          extentha: extentha,
          extentac: extentac,
          extentp: extentp,
          startedAt: formattedDate,
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
      } else {
        Alert.alert(
          t("Cropenroll.Failed"),
          t("Cropenroll.FialedOngoinCultivationUpdate")
        );
      }
    } catch (error) {
      Alert.alert(
        t("Cropenroll.Failed"),
        t("Cropenroll.FialedOngoinCultivationUpdate")
      );
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#00ff00" />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1"
      style={{ paddingHorizontal: wp(4), paddingVertical: hp(2) }}
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
        <Image className="w-32 h-32" source={farmer} />
      </View>

      {formStatus === "newAdd" ? (
        <View className="p-4">
          {/* <Text>{t("Cropenroll.selectNaofCultivation")}</Text> */}
          <View className="border-b border-gray-400 mb-8 pl-1 justify-center items-center">
            <Picker
              selectedValue={natureOfCultivation}
              onValueChange={(itemValue) => setNatureOfCultivation(itemValue)}
              style={{
                width: wp(90),
              }}
            >
              <Picker.Item
                label={t("Cropenroll.selectNaofCultivation")}
                value=""
              />
              {NatureOfCultivationCategories.map((item) => (
                <Picker.Item
                  key={item.key}
                  label={item.lebel}
                  value={item.value}
                />
              ))}
            </Picker>
          </View>

          {/* <Text>{t("Cropenroll.selectCultivationMethod")}</Text> */}
          <View className="border-b border-gray-400 mb-8 pl-1 justify-center items-center">
            <Picker
              selectedValue={cultivationMethod}
              onValueChange={(itemValue) => setCultivationMethod(itemValue)}
              style={{
                width: wp(90),
              }}
            >
              <Picker.Item
                label={t("Cropenroll.selectCultivationMethod")}
                value=""
              />
              {CultivationMethodCategories.map((item) => (
                <Picker.Item
                  key={item.key}
                  label={item.lebel}
                  value={item.value}
                />
              ))}
            </Picker>
          </View>

          <TouchableOpacity
            onPress={handleSearch}
            className="bg-gray-800 p-3 items-center rounded-lg"
          >
            <Text className="text-white text-base font-bold">
              {t("Cropenroll.search")}
            </Text>
          </TouchableOpacity>

          {search && (
            <>
              <Text className="mt-8">{t("Cropenroll.selectExtent")}</Text>
              <View className="flex-row items-center justify-between w-full mt-4  max-w-xl"  >
              {/* HA Input */}
              <View className="flex-row items-center space-x-2">
                <Text className="text-right">{t("FixedAssets.ha")}</Text>
                <TextInput
                  className="border border-gray-300 p-2 px-4 w-20 rounded-2xl bg-gray-100 text-left"
                  value={extentha}
                  onChangeText={setExtentha}
                  keyboardType="numeric"
                />
              </View>

              {/* AC Input */}
              <View className="flex-row items-center space-x-2">
                <Text className="text-right">{t("FixedAssets.ac")}</Text>
                <TextInput
                  className="border border-gray-300 p-2 px-4 w-20 rounded-2xl bg-gray-100 text-left"
                  value={extentac}
                  onChangeText={setExtentac}
                  keyboardType="numeric"
                />
              </View>

              {/* P Input */}
              <View className="flex-row items-center space-x-2">
                <Text className="text-right">{t("FixedAssets.p")}</Text>
                <TextInput
                  className="border border-gray-300 p-2 w-20 px-4 rounded-2xl bg-gray-100 text-left"
                  value={extentp}
                  onChangeText={setExtentp}
                  keyboardType="numeric"
                />
              </View>
            </View>

              <Text className="mt-4">{t("Cropenroll.selectStartDate")}</Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                className="border-b border-gray-400 my-3 flex-row justify-between items-center p-3"
              >
                <Text>{startDate.toDateString()}</Text>
                <Icon name="arrow-drop-down" size={24} color="gray" />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  display="default"
                  maximumDate={new Date()}
                  minimumDate={minDate}
                  onChange={onChangeDate}
                />
              )}

              <TouchableOpacity
                onPress={HandleEnrollBtn}
                className=" rounded-lg bg-[#26D041] p-3 mt-4 items-center bottom-0 left-0 right-0 "
              >
                <Text className="text-white text-base font-bold">
                  {t("Cropenroll.enroll")}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      ) : (
        <>
          <View className="p-4">
            <Text className="mt-8">{t("Cropenroll.selectExtent")}</Text>
            <View className="flex-row items-center justify-between w-full mt-4 "  >
              {/* HA Input */}
              <View className="flex-row items-center space-x-2">
                <Text className="text-right">{t("FixedAssets.ha")}</Text>
                <TextInput
                  className="border border-gray-300 p-2 px-4 w-20 rounded-2xl bg-gray-100 text-left"
                  value={extentha}
                  onChangeText={setExtentha}
                  keyboardType="numeric"
                />
              </View>

              {/* AC Input */}
              <View className="flex-row items-center space-x-2">
                <Text className="text-right">{t("FixedAssets.ac")}</Text>
                <TextInput
                  className="border border-gray-300 p-2 px-4 w-20 rounded-2xl bg-gray-100 text-left"
                  value={extentac}
                  onChangeText={setExtentac}
                  keyboardType="numeric"
                />
              </View>

              {/* P Input */}
              <View className="flex-row items-center space-x-2">
                <Text className="text-right">{t("FixedAssets.p")}</Text>
                <TextInput
                  className="border border-gray-300 p-2 w-20 px-4 rounded-2xl bg-gray-100 text-left"
                  value={extentp}
                  onChangeText={setExtentp}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Text className="mt-4">{t("Cropenroll.selectStartDate")} </Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className="border-b border-gray-400 my-3 flex-row justify-between items-center p-3"
            >
              <Text>{startDate.toDateString()}</Text>
              <Icon name="arrow-drop-down" size={24} color="gray" />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display="default"
                maximumDate={new Date()}
                minimumDate={minDate}
                onChange={onChangeDate}
                
              />
            )}

            <TouchableOpacity
              onPress={updateOngoingCultivation}
              className=" rounded-lg bg-[#26D041] p-3 mt-8 items-center bottom-0 left-0 right-0 "
            >
              <Text className="text-white text-base font-bold">
                {t("Cropenroll.Update")}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );
};

export default CropEnrol;
