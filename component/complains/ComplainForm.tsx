import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  BackHandler,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types/types";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { environment } from "@/environment/environment";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { MaterialIcons } from "@expo/vector-icons";
import { ScrollView } from "react-native-gesture-handler";
import { useFocusEffect } from "@react-navigation/native";
import GlobalSearchModal from "../common/GlobalSearchModal";
import CustomHeader from "../common/CustomHeader";
import LoadingPage from "../common/LoadingPage";

type ComplainFormNavigationProp = StackNavigationProp<
  RootStackParamList,
  "ComplainForm"
>;

interface ComplainFormProps {
  navigation: ComplainFormNavigationProp;
}

const ComplainForm: React.FC<ComplainFormProps> = ({ navigation }) => {
  const [complain, setComplain] = useState<string>("");
  const [authToken, setAuthToken] = useState<string | null>(null);
  const { t } = useTranslation();
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [Category, setCategory] = useState<{ value: string; label: string }[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const selectedCategoryLabel =
    Category.find((c) => c.value === selectedCategory)?.label ?? null;

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.navigate("EngProfile");
        return true;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );

      return () => subscription.remove();
    }, [navigation]),
  );

  useEffect(() => {
    const selectedLanguage = t("Main.LNG");

    const fetchComplainCategory = async () => {
      try {
        const response = await axios.get(
          `${environment.API_BASE_URL}api/complain/get-complain-category`,
        );
        if (response.data.status === "success") {
          const categoryField =
            selectedLanguage === "en"
              ? "categoryEnglish"
              : selectedLanguage === "si"
                ? "categorySinhala"
                : selectedLanguage === "ta"
                  ? "categoryTamil"
                  : "categoryEnglish";

          const mappedCategories = response.data.data
            .map((item: any) => {
              const categoryValue =
                item[categoryField] || item["categoryEnglish"];
              return {
                value: item.id,
                label: categoryValue,
              };
            })
            .filter((item: { value: any }) => item.value);

          setCategory(mappedCategories);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchComplainCategory();
  }, [t]);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (token) {
          setAuthToken(token);
        }
      } catch (error) {
        console.error(t("PublicForum.SomethingWentWrongPleaseTryAgainlater"), error);
      }
    };

    fetchToken();
  }, []);

  const handleSubmit = async () => {
    if (!selectedCategory || !complain) {
      Alert.alert(
        t("Main.Sorry"),
        t("Main.PleaseFillAllRequiredFields"),
        [{ text: t("Main.OK") }],
      );
      return;
    }

    const storedLanguage = await AsyncStorage.getItem("@user_language");

    setIsLoading(true);

    let farmerLanguage;
    if (storedLanguage === "en") {
      farmerLanguage = "English";
    } else if (storedLanguage === "si") {
      farmerLanguage = "Sinhala";
    } else if (storedLanguage === "ta") {
      farmerLanguage = "Tamil";
    } else {
      farmerLanguage = "English";
    }

    try {
      const response = await axios.post(
        `${environment.API_BASE_URL}api/complain/add-complain`,
        {
          language: farmerLanguage,
          category: selectedCategory,
          complain: complain,
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
      );
      if (response.data.status === "success") {
        Alert.alert(
          t("Main.Success"),
          t("ReportComplaint.ComplaintAddedSuccessfully"),
          [{ text: t("Main.OK") }],
        );
        setIsLoading(false);
        navigation.navigate("Main", { screen: "ComplainHistory" });
      } else {
        Alert.alert(
          t("Main.Sorry"),
          t("ReportComplaint.FailedToAddAComplaintPleaseTryAgain"),
          [{ text: t("Main.OK") }],
        );
        setIsLoading(false);
      }
    } catch (error) {
      Alert.alert(t("Main.Error"), t("Main.SomethingWentWrongPleaseTryAgainlater"), [
        { text: t("Main.OK") },
      ]);
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      enabled
      style={{ flex: 1, backgroundColor: "#F9F9FA" }}
    >
      {/* Header - not transparent during loading */}
      <View
        className="flex-row items-center justify-between"
        style={{ 
          paddingHorizontal: wp(2),
          backgroundColor: loading ? "#F9F9FA" : "transparent",
        }}
      >
        <CustomHeader
          title=""
          navigation={navigation}
          onBackPress={() => navigation.navigate("EngProfile")}
          transparent={!loading}
        />
        <View style={{ width: 22 }} />
      </View>

      {loading ? (
        <View style={{ flex: 1 }}>
          <LoadingPage fullScreen message={t("Custom.LoadingMessage")} />
        </View>
      ) : (
        <ScrollView 
          className="flex-1" 
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View 
            className="items-center justify-center p-2 pb-20"
            style={{ minHeight: hp(80) }}
          >
            <Image
              source={require("../../assets/images/complain/complain1.webp")}
              className="w-36 h-36"
              resizeMode="contain"
            />

            <View
              className="w-[90%] items-center p-6 shadow-2xl bg-[#FFFFFF] rounded-xl mb-5"
              style={{
                shadowColor: "#000000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
                elevation: 4,
              }}
            >
              <View className="flex-row">
                <Text className="text-2xl font-semibold text-center mb-4 color-[#424242]">
                  {t("ReportComplaint.TellUsThe")}
                </Text>
                <Text className="text-2xl font-semibold text-center mb-4 pl-2 color-[#D72C62]">
                  {t("ReportComplaint.Problem")}
                </Text>
              </View>

              {/* Category Selector - Rounded */}
              <View className="w-full mb-4">
                <TouchableOpacity
                  onPress={() => setCategoryModalVisible(true)}
                  className="rounded-full h-[50px]"
                  style={{
                    borderWidth: 1,
                    borderColor: "#F4F4F4",
                    borderRadius: 25,
                    paddingHorizontal: 12,
                    paddingVertical: 14,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    backgroundColor: "#F4F4F4",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      color: selectedCategoryLabel ? "#434343" : "#434343",
                      flex: 1,
                    }}
                  >
                    {selectedCategoryLabel
                      ? t(selectedCategoryLabel)
                      : t("ReportComplaint.SelectComplaintCategory")}
                  </Text>
                  <MaterialIcons
                    name="arrow-drop-down"
                    size={24}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>

              <Text className="text-sm text-gray-600 text-center mb-4">
                {t("ReportComplaint.WeWillRespondToYouWithinTwoDaysAfterReceivingYourMessage")}
              </Text>

              <TextInput
                className="w-full h-52 border border-[#F4F4F4] rounded-lg p-3 bg-[#F4F4F4] mb-8 text-gray-800"
                placeholder={t("ReportComplaint.KindlySubmitYourComplaintHere")}
                style={{ color: '#000000', textAlignVertical: "top" }} 
                placeholderTextColor="#9CA3AF" 
                multiline
                value={complain}
                onChangeText={(text) => setComplain(text)}
              />

              <TouchableOpacity
                className="w-full bg-gray-800 rounded-3xl h-[50px] items-center justify-center"
                onPress={handleSubmit}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="text-white font-bold text-lg">
                    {t("ReportComplaint.Submit")}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}

      {/* Category Selection Modal */}
      <GlobalSearchModal
        visible={categoryModalVisible}
        onClose={() => setCategoryModalVisible(false)}
        title={t("ReportComplaint.SelectComplaintCategory")}
        data={Category.map((item) => ({
          label: t(item.label),
          value: item.value,
        }))}
        selectedItems={selectedCategory ? [selectedCategory] : []}
        onSelect={(items) => {
          if (items.length > 0) setSelectedCategory(items[0]);
        }}
        searchPlaceholder={t("Main.Search...")}
        multiSelect={false}
        noResultsText="No category found"
        placeholderTextColor="#000000"
      />
    </KeyboardAvoidingView>
  );
};

export default ComplainForm;