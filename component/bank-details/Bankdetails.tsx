import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  BackHandler,
  StatusBar,
} from "react-native";
import axios from "axios";
import { RootStackParamList } from "../types/types";
import { StackNavigationProp } from "@react-navigation/stack";
import CustomHeader from "../../component/common/CustomHeader";
import { environment } from "@/environment/environment";
import AsyncStorage from "@react-native-async-storage/async-storage";
import bankNames from "../../assets/jsons/banks.json";
import { useTranslation } from "react-i18next";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";
import AntDesign from "react-native-vector-icons/AntDesign";
import GlobalSearchModal from "../../component/common/GlobalSearchModal";

type BankDetailsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "BankDetailsScreen"
>;

interface BankDetailsScreenProps {
  navigation: BankDetailsScreenNavigationProp;
}

interface allBranches {
  bankID: number;
  ID: number;
  name: string;
}

const BankDetailsScreen: React.FC<any> = ({ navigation, route }) => {
  const [accountNumber, setAccountNumber] = useState("");
  const [confirmAccountNumber, setConfirmAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [branchName, setBranchName] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [filteredBranches, setFilteredBranches] = useState<allBranches[]>([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState("en");
  const { t } = useTranslation();
  const [bankModalVisible, setBankModalVisible] = useState(false);
  const [branchModalVisible, setBranchModalVisible] = useState(false);
  const [holdernameNameError, setHoldernameNameError] = useState("");
  const [disableSubmit, setDisableSubmit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [accountNumbermisMatchError, setAccountNumbermisMatchError] =
    useState("");
  const [accountNumberError, setAccountNumberError] = useState("");

  const adjustFontSize = (size: number) =>
    language !== "en" ? size * 0.9 : size;

  useEffect(() => {
    const selectedLanguage = t("BankDetails.LNG");
    setLanguage(selectedLanguage);
  }, [t]);

  useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction,
    );
    return () => subscription.remove();
  }, [navigation]);

  useEffect(() => {
    if (bankName) {
      const selectedBank = bankNames.find((bank) => bank.name === bankName);
      if (selectedBank) {
        try {
          const data = require("../../assets/jsons/branches.json");
          const filteredBranches = data[selectedBank.ID] || [];

          const sortedBranches = filteredBranches.sort(
            (a: { name: string }, b: { name: any }) =>
              a.name.localeCompare(b.name),
          );

          setFilteredBranches(sortedBranches);
        } catch (error) {
          console.error("Error loading branches", error);
          Alert.alert(t("Main.error"), t("Main.somethingWentWrong"), [
            { text: t("PublicForum.OK") },
          ]);
        } finally {
          setLoading(false);
        }
      } else {
        setFilteredBranches([]);
      }
    } else {
      setFilteredBranches([]);
    }
  }, [bankName]);

  const handleRegister = async () => {
    if (loading) {
      Alert.alert(t("BankDetails.Loading"), t("BankDetails.LoadingText"), [
        { text: t("PublicForum.OK") },
      ]);
      return;
    }

    const trimmedAccountNumber = accountNumber.trim();
    const trimmedConfirmAccountNumber = confirmAccountNumber.trim();
    const trimmedAccountHolderName = accountHolderName.trim();
    const trimmedBankName = bankName.trim();
    const trimmedBranchName = branchName.trim();

    if (
      !trimmedAccountNumber ||
      !trimmedConfirmAccountNumber ||
      !trimmedAccountHolderName ||
      !trimmedBankName ||
      !trimmedBranchName
    ) {
      Alert.alert(t("BankDetails.sorry"), t("BankDetails.PlzFillAllFields"), [
        { text: t("PublicForum.OK") },
      ]);
      return;
    }

    if (trimmedAccountNumber !== trimmedConfirmAccountNumber) {
      Alert.alert(
        t("BankDetails.sorry"),
        t("BankDetails.AccountNumberMismatch"),
        [{ text: t("PublicForum.OK") }],
      );
      setAccountNumbermisMatchError(t("BankDetails.AccountNumberMismatch"));
      return;
    }

    setDisableSubmit(true);
    setIsLoading(true);

    try {
      const bankDetails = {
        accountHolderName: trimmedAccountHolderName,
        accountNumber: trimmedAccountNumber,
        bankName: trimmedBankName,
        branchName: trimmedBranchName,
      };

      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert(t("Main.error"), t("Main.somethingWentWrong"), [
          { text: t("PublicForum.OK") },
        ]);
        setDisableSubmit(false);
        setIsLoading(false);
        return;
      }

      const response = await axios.post(
        `${environment.API_BASE_URL}api/auth/registerBankDetails`,
        bankDetails,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status === 200) {
        Alert.alert(
          t("BankDetails.success"),
          t("BankDetails.SuccessfullyRegistered"),
          [{ text: t("PublicForum.OK") }],
        );
        navigation.navigate("Main", { screen: "EngQRcode" });
        setDisableSubmit(false);
        setIsLoading(false);
      } else {
        Alert.alert(
          t("BankDetails.failed"),
          t("BankDetails.failedToRegister"),
          [{ text: t("PublicForum.OK") }],
        );
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          Alert.alert(
            t("BankDetails.failed"),
            t("BankDetails.ExistingBankDetails"),
            [{ text: t("PublicForum.OK") }],
          );
          navigation.navigate("EngProfile");
        } else {
          Alert.alert(t("Main.error"), t("Main.somethingWentWrong"), [
            { text: t("PublicForum.OK") },
          ]);
        }
      } else {
        Alert.alert(t("Main.error"), t("Main.somethingWentWrong"), [
          { text: t("PublicForum.OK") },
        ]);
      }
    } finally {
      setDisableSubmit(false);
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    return (
      accountNumber &&
      confirmAccountNumber &&
      accountHolderName &&
      bankName &&
      branchName
    );
  };

  const validateName = (name: string) => {
    const regex = /^[\p{L}\s\u0B80-\u0BFF\u0D80-\u0DFF]+$/u;
    return regex.test(name);
  };

  const handleFirstNameChange = (text: string) => {
    const trimmedText = text.replace(/^\s+/, "");

    if (validateName(trimmedText) || trimmedText === "") {
      setAccountHolderName(trimmedText);
      setHoldernameNameError("");
    } else {
      setHoldernameNameError(t("Signup.Startwithletter"));
    }
  };

  const validateAccountNumber = (text: string) => {
    const regex = /^\d*$/;
    return regex.test(text);
  };

  const handleAccountNumberChange = (text: string) => {
    if (validateAccountNumber(text) || text === "") {
      setAccountNumber(text);
      setAccountNumberError("");

      if (confirmAccountNumber !== "" && confirmAccountNumber !== text) {
        setAccountNumbermisMatchError(t("BankDetails.AccountNumberMismatch"));
      } else if (confirmAccountNumber === text) {
        setAccountNumbermisMatchError("");
      }
    } else {
      setAccountNumberError(t("BankDetails.OnlyNumbers"));
    }
  };

  const handleConfirmAccountNumberChange = (text: string) => {
    if (validateAccountNumber(text) || text === "") {
      setConfirmAccountNumber(text);
      setAccountNumberError("");

      if (text !== "" && accountNumber !== text) {
        setAccountNumbermisMatchError(t("BankDetails.AccountNumberMismatch"));
      } else {
        setAccountNumbermisMatchError("");
      }
    } else {
      setAccountNumberError(t("BankDetails.OnlyNumbers"));
    }
  };

  const bankItems = bankNames
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((bank) => ({ label: bank.name, value: bank.name }));

  const branchItems = filteredBranches.map((branch) => ({
    label: branch.name,
    value: branch.name,
  }));

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      enabled
      style={{ flex: 1, backgroundColor: "white" }}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={false}
      />

      <GlobalSearchModal
        visible={bankModalVisible}
        onClose={() => setBankModalVisible(false)}
        title={t("BankDetails.BankName")}
        data={bankItems}
        selectedItems={bankName ? [bankName] : []}
        onSelect={(items) => {
          const selected = items[0] ?? "";
          if (selected !== bankName) {
            setBankName(selected);
            setBranchName("");
          }
        }}
        searchPlaceholder={t("Signup.TypeSomething")}
        multiSelect={false}
      />

      <GlobalSearchModal
        visible={branchModalVisible}
        onClose={() => setBranchModalVisible(false)}
        title={t("BankDetails.BranchName")}
        data={branchItems}
        selectedItems={branchName ? [branchName] : []}
        onSelect={(items) => {
          setBranchName(items[0] ?? "");
        }}
        searchPlaceholder={t("Signup.TypeSomething")}
        multiSelect={false}
        isLoading={loading && !!bankName}
      />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 24 }}
        className="flex-1 bg-white"
        keyboardShouldPersistTaps="handled"
      >
        <CustomHeader
          title=""
          navigation={navigation}
          onBackPress={() => navigation.goBack()}
        />

        <View className="items-center mb-6 mt-[-15%]">
          <Image
            source={require("../../assets/images/bank-details/qr-screen.webp")}
            style={{ width: 200, height: 200 }}
            resizeMode="contain"
          />
        </View>

        <Text className="text-lg font-bold text-center text-gray-900 mb-2 ml-[7%]">
          {t("BankDetails.FillBankDetails")}
        </Text>

        <View className="space-y-4 p-4 ">
          <Text
            className="text-[#070707] -mb-2"
            style={{ fontSize: adjustFontSize(14) }}
          >
            {t("BankDetails.AccountHolderName")}
          </Text>
          <TextInput
            placeholder={t("BankDetails.EnterAccountHolderName")}
            className="pb-2 bg-[#F4F4F4] rounded-full p-4"
            placeholderTextColor="#5e5d5d"
            value={accountHolderName}
            onChangeText={handleFirstNameChange}
            style={{
              backgroundColor: "#F4F4F4",
              borderRadius: 25,
              paddingHorizontal: 16,
              paddingVertical: 16,
              textDecorationLine: "none",
              borderBottomWidth: 0,
              borderBottomColor: "transparent",
              borderWidth: 0,
              borderColor: "transparent",
              elevation: 0,
              shadowOpacity: 0,
            }}
            underlineColorAndroid="transparent"
            cursorColor="#000000"
          />
          {holdernameNameError ? (
            <Text
              className="text-red-500"
              style={{ fontSize: wp(3), marginTop: wp(-4) }}
            >
              {holdernameNameError}
            </Text>
          ) : null}

          <Text
            className="text-[#070707] -mb-2"
            style={{ fontSize: adjustFontSize(14) }}
          >
            {t("BankDetails.AccountNumber")}
          </Text>
          <TextInput
            placeholder={t("BankDetails.Enter Account Number")}
            placeholderTextColor="#5e5d5d"
            className="pb-2 bg-[#F4F4F4] rounded-full p-4"
            keyboardType="number-pad"
            value={accountNumber}
            onChangeText={handleAccountNumberChange}
          />
          {accountNumberError && !validateAccountNumber(accountNumber) ? (
            <Text
              className="text-red-500"
              style={{ fontSize: wp(3), marginTop: wp(-4) }}
            >
              {accountNumberError}
            </Text>
          ) : null}

          <Text
            className="text-[#070707] -mb-2"
            style={{ fontSize: adjustFontSize(14) }}
          >
            {t("BankDetails.ConfirmAccountNumber")}
          </Text>
          <TextInput
            placeholder={t("BankDetails.Re-enter Account Number")}
            placeholderTextColor="#5e5d5d"
            className="pb-2 bg-[#F4F4F4] rounded-full p-4"
            keyboardType="number-pad"
            value={confirmAccountNumber}
            onChangeText={handleConfirmAccountNumberChange}
          />
          {accountNumberError &&
          !validateAccountNumber(confirmAccountNumber) ? (
            <Text
              className="text-red-500"
              style={{ fontSize: wp(3), marginTop: wp(-4) }}
            >
              {accountNumberError}
            </Text>
          ) : null}

          {accountNumbermisMatchError ? (
            <Text
              className="text-red-500"
              style={{ fontSize: wp(3), marginTop: wp(-4) }}
            >
              {accountNumbermisMatchError}
            </Text>
          ) : null}

          <Text
            className="text-[#070707] -mb-2"
            style={{ fontSize: adjustFontSize(14) }}
          >
            {t("BankDetails.BankName")}
          </Text>
          <TouchableOpacity
            onPress={() => setBankModalVisible(true)}
            style={{
              backgroundColor: "#F4F4F4",
              borderRadius: 25,
              paddingHorizontal: 16,
              paddingVertical: 16,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: bankName ? "#070707" : "#5e5d5d",
                fontSize: adjustFontSize(14),
              }}
            >
              {bankName || t("BankDetails.Select Bank Name")}
            </Text>
            <AntDesign name="caret-down" size={14} color="#555" />
          </TouchableOpacity>

          <Text
            className="text-[#070707] -mb-2"
            style={{ fontSize: adjustFontSize(14) }}
          >
            {t("BankDetails.BranchName")}
          </Text>
          <TouchableOpacity
            onPress={() => {
              if (bankName) {
                setBranchModalVisible(true);
              } else {
                Alert.alert(
                  t("BankDetails.sorry"),
                  t("BankDetails.SelectBankFirst") ||
                    "Please select a bank first.",
                  [{ text: t("PublicForum.OK") }],
                );
              }
            }}
            style={{
              backgroundColor: "#F4F4F4",
              borderRadius: 25,
              paddingHorizontal: 16,
              paddingVertical: 16,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              opacity: bankName ? 1 : 0.5,
            }}
          >
            <Text
              style={{
                color: branchName ? "#070707" : "#5e5d5d",
                fontSize: adjustFontSize(14),
              }}
            >
              {branchName || t("BankDetails.Select Branch Name")}
            </Text>
            <AntDesign name="caret-down" size={14} color="#555" />
          </TouchableOpacity>
        </View>

        <View className="flex items-center justify-center pb-4">
          <TouchableOpacity
            onPress={handleRegister}
            disabled={disableSubmit || !isFormValid()}
            className={`${
              disableSubmit || !isFormValid()
                ? "bg-gray-400 rounded-full p-4 mt-2 w-60 "
                : "bg-[#353535] rounded-full p-4 mt-2 w-60"
            }`}
            style={{
              shadowColor: "#000000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 4,
            }}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-white font-bold text-center">
                {t("BankDetails.Register")}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View className="flex items-center justify-center mt-4 pb-4">
          {language === "en" ? (
            <View className="flex-row justify-center flex-wrap">
              <Text className="text-sm text-black font-thin">View </Text>

              <TouchableOpacity
                onPress={() => navigation.navigate("TermsConditions")}
              >
                <Text className="text-sm text-black font-bold underline">
                  Terms & Conditions
                </Text>
              </TouchableOpacity>

              <Text className="text-sm text-black font-thin"> and </Text>

              <TouchableOpacity
                onPress={() => navigation.navigate("PrivacyPolicy")}
              >
                <Text className="text-sm text-black font-bold underline">
                  Privacy Policy
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="flex-row justify-center flex-wrap">
              <TouchableOpacity
                onPress={() => navigation.navigate("TermsConditions")}
              >
                <Text
                  className="text-black font-bold underline"
                  style={{ fontSize: adjustFontSize(12) }}
                >
                  නියමයන් සහ කොන්දේසි
                </Text>
              </TouchableOpacity>

              <Text
                className="text-black font-thin"
                style={{ fontSize: adjustFontSize(12), marginHorizontal: 2 }}
              >
                {""} සහ
              </Text>

              <TouchableOpacity
                onPress={() => navigation.navigate("PrivacyPolicy")}
              >
                <Text
                  className="text-black font-bold underline"
                  style={{ fontSize: adjustFontSize(12) }}
                >
                  {""} රහස්‍යතා ප්‍රතිපත්තිය
                </Text>
              </TouchableOpacity>

              <Text
                className="text-black font-thin"
                style={{ fontSize: adjustFontSize(12), marginLeft: 2 }}
              >
                {""} බලන්න
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default BankDetailsScreen;
