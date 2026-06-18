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
} from "react-native";
import axios from "axios";
import { RootStackParamList } from "../types/types";
import { StackNavigationProp } from "@react-navigation/stack";
import CustomHeader from "../../component/common/CustomHeader";
import { environment } from "@/environment/environment";
import AsyncStorage from "@react-native-async-storage/async-storage";
import bankNames from "@/assets/jsons/bank-details/banks.json";
import { useTranslation } from "react-i18next";
import { MaterialIcons } from "@expo/vector-icons";
import GlobalSearchModal from "../../component/common/GlobalSearchModal";

type BankDetailsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "BankDetailsScreen"
>;

interface BankDetailsScreenProps {
  navigation: BankDetailsScreenNavigationProp;
  route: any;
}

interface allBranches {
  bankID: number;
  ID: number;
  name: string;
}

const BankDetailsScreen: React.FC<BankDetailsScreenProps> = ({
  navigation,
  route,
}) => {
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

  const isSignUp = route.name === "BankDetailsSignUp";

  const adjustFontSize = (size: number) =>
    language !== "en" ? size * 0.9 : size;

  useEffect(() => {
    const selectedLanguage = t("Main.LNG");
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
          const data = require("@/assets/jsons/bank-details/branches.json");
          const branchesList = data[selectedBank.ID] || [];

          const sortedBranches = branchesList.sort(
            (a: { name: string }, b: { name: any }) =>
              a.name.localeCompare(b.name),
          );

          setFilteredBranches(sortedBranches);
        } catch (error) {
          console.error("Error loading branches", error);
          Alert.alert(
            t("Main.Error"),
            t("Main.SomethingWentWrongPleaseTryAgainlater"),
            [{ text: t("Main.OK") }],
          );
        } finally {
          setLoading(false);
        }
      } else {
        setFilteredBranches([]);
      }
    } else {
      setFilteredBranches([]);
    }

    setBranchName("");
  }, [bankName]);

  const handleRegister = async () => {
    if (loading && bankName) {
      Alert.alert(
        t("Main.Loading..."),
        t("BankDetails.PleaseWaitDataIsBeingLoaded"),
        [{ text: t("Main.OK") }],
      );
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
      Alert.alert(
        t("BankDetails.sorry"),
        t("Main.PleaseFillAllRequiredFields"),
        [{ text: t("Main.OK") }],
      );
      return;
    }

    if (trimmedAccountNumber !== trimmedConfirmAccountNumber) {
      Alert.alert(
        t("BankDetails.sorry"),
        t("BankDetails.AccountNumbersDoNotMatch"),
        [{ text: t("Main.OK") }],
      );
      setAccountNumbermisMatchError(t("BankDetails.AccountNumbersDoNotMatch"));
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
        Alert.alert(
          t("Main.Error"),
          t("Main.SomethingWentWrongPleaseTryAgainlater"),
          [{ text: t("Main.OK") }],
        );
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
          t("Main.Success"),
          t("BankDetails.BankDetailsRegisteredSuccessfully"),
          [
            {
              text: t("Main.OK"),
              onPress: () => {
                if (isSignUp) {
                  navigation.navigate("Main", { screen: "Dashboard" });
                } else {
                  navigation.navigate("Main", { screen: "QRcode" });
                }
              },
            },
          ],
        );
        setDisableSubmit(false);
        setIsLoading(false);
      } else {
        Alert.alert(
          t("BankDetails.Failed"),
          t("BankDetails.FailedToRegisterBankDetailsPleaseTryAgain"),
          [{ text: t("Main.OK") }],
        );
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          Alert.alert(
            t("BankDetails.Failed"),
            t("BankDetails.ExistingBankDetails"),
            [{ text: t("Main.OK") }],
          );
          if (isSignUp) {
            navigation.navigate("Main", { screen: "Dashboard" });
          } else {
            navigation.navigate("EngProfile");
          }
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
      setHoldernameNameError(
        t("SignUp.UserNameMustStartWithALetterAndContainNoSpaces"),
      );
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
        setAccountNumbermisMatchError(
          t("BankDetails.AccountNumbersDoNotMatch"),
        );
      } else if (confirmAccountNumber === text) {
        setAccountNumbermisMatchError("");
      }
    } else {
      setAccountNumberError(t("BankDetails.AccountNumberMustBeANumber"));
    }
  };

  const handleConfirmAccountNumberChange = (text: string) => {
    if (validateAccountNumber(text) || text === "") {
      setConfirmAccountNumber(text);
      setAccountNumberError("");

      if (text !== "" && accountNumber !== text) {
        setAccountNumbermisMatchError(
          t("BankDetails.AccountNumbersDoNotMatch"),
        );
      } else {
        setAccountNumbermisMatchError("");
      }
    } else {
      setAccountNumberError(t("BankDetails.AccountNumberMustBeANumber"));
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
      className="flex-1 bg-white"
    >
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
        searchPlaceholder={t("Main.Search...")}
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
        searchPlaceholder={t("Main.Search...")}
        multiSelect={false}
        isLoading={loading && !!bankName}
      />

      <CustomHeader
        title=""
        navigation={navigation}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerClassName="pb-6"
        className="flex-1 bg-white"
        keyboardShouldPersistTaps="handled"
      >
        <View className="items-center mb-4">
          <Image
            source={require("../../assets/images/bank-details/qr-screen.webp")}
            style={{ width: 280, height: 280 }}
            resizeMode="contain"
          />
        </View>

        <Text className="text-lg font-bold text-center text-gray-900 mb-4">
          {t("BankDetails.FillBankDetails")}
        </Text>

        <View className="gap-4 px-6">
          <View>
            <Text
              className="text-[#070707] mb-2"
              style={{ fontSize: adjustFontSize(14) }}
            >
              {t("BankDetails.AccountHoldersName")}
            </Text>
            <TextInput
              placeholder={t("BankDetails.EnterAccountHoldersName")}
              className="rounded-3xl h-[50px] px-4"
              placeholderTextColor="#5e5d5d"
              value={accountHolderName}
              onChangeText={handleFirstNameChange}
              style={{
                backgroundColor: "#F4F4F4",
                borderRadius: 25,
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
              <Text className="text-red-500 text-xs mb-2">
                {holdernameNameError}
              </Text>
            ) : null}
          </View>

          <View>
            <Text
              className="text-[#070707] mb-2"
              style={{ fontSize: adjustFontSize(14) }}
            >
              {t("BankDetails.AccountNumber")}
            </Text>
            <TextInput
              placeholder={t("BankDetails.EnterAccountNumber")}
              placeholderTextColor="#5e5d5d"
              className="bg-[#F4F4F4] rounded-3xl h-[50px] px-4"
              keyboardType="number-pad"
              value={accountNumber}
              onChangeText={handleAccountNumberChange}
            />
            {accountNumberError && !validateAccountNumber(accountNumber) ? (
              <Text className="text-red-500 text-xs mt-2">
                {accountNumberError}
              </Text>
            ) : null}
          </View>

          <View>
            <Text
              className="text-[#070707] mb-2"
              style={{ fontSize: adjustFontSize(14) }}
            >
              {t("BankDetails.ConfirmYourAccountNumber")}
            </Text>
            <TextInput
              placeholder={t("BankDetails.ReEnterAccountNumber")}
              placeholderTextColor="#5e5d5d"
              className="bg-[#F4F4F4] rounded-3xl h-[50px] px-4"
              keyboardType="number-pad"
              value={confirmAccountNumber}
              onChangeText={handleConfirmAccountNumberChange}
            />
            {accountNumberError &&
            !validateAccountNumber(confirmAccountNumber) ? (
              <Text className="text-red-500 text-xs mt-2">
                {accountNumberError}
              </Text>
            ) : null}
            {accountNumbermisMatchError ? (
              <Text className="text-red-500 text-xs mt-2">
                {accountNumbermisMatchError}
              </Text>
            ) : null}
          </View>

          <View>
            <Text
              className="text-[#070707] mb-2"
              style={{ fontSize: adjustFontSize(14) }}
            >
              {t("BankDetails.BankName")}
            </Text>
            <TouchableOpacity
              onPress={() => setBankModalVisible(true)}
              className="rounded-3xl h-[50px] px-4 flex-row justify-between items-center"
              style={{ backgroundColor: "#F4F4F4", borderRadius: 25 }}
            >
              <Text
                style={{
                  color: bankName ? "#070707" : "#5e5d5d",
                  fontSize: adjustFontSize(14),
                }}
              >
                {bankName || t("BankDetails.SelectBankName")}
              </Text>
              <MaterialIcons
                name="arrow-drop-down"
                size={24}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          <View>
            <Text
              className="text-[#070707] mb-2"
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
                    [{ text: t("Main.OK") }],
                  );
                }
              }}
              style={{
                backgroundColor: "#F4F4F4",
                borderRadius: 25,
                opacity: bankName ? 1 : 0.5,
              }}
              className="rounded-3xl h-[50px] px-4 flex-row justify-between items-center"
            >
              <Text
                style={{
                  color: branchName ? "#070707" : "#5e5d5d",
                  fontSize: adjustFontSize(14),
                }}
              >
                {branchName || t("BankDetails.SelectBranchName")}
              </Text>
              <MaterialIcons
                name="arrow-drop-down"
                size={24}
                color="#666"
              />
            </TouchableOpacity>
          </View>
        </View>

        <View className="items-center justify-center pb-4 w-full px-12 mt-6">
          {isSignUp && (
            <TouchableOpacity
              className="w-full rounded-3xl  mb-2 bg-[#ECECEC] h-[50px] justify-center items-center shadow-lg elevation-6"
              onPress={() =>
                navigation.navigate("Main", { screen: "Dashboard" })
              }
            >
              <Text className="text-[#686868] font-bold text-center text-lg">
                {t("Membership.Skip")}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={handleRegister}
            disabled={disableSubmit || !isFormValid()}
            className={`w-full rounded-3xl mt-2 h-[50px] justify-center items-center shadow-lg elevation-6 ${
              disableSubmit || !isFormValid() ? "bg-[#9CA3AF]" : "bg-[#353535]"
            }`}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-white font-bold text-center text-lg">
                {t("BankDetails.Register")}
              </Text>
            )}
          </TouchableOpacity>

          {!isSignUp && (
            <View className="items-center justify-center mt-6 w-full">
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
                    className="text-black font-thin mx-0.5"
                    style={{ fontSize: adjustFontSize(12) }}
                  >
                    සහ
                  </Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate("PrivacyPolicy")}
                  >
                    <Text
                      className="text-black font-bold underline"
                      style={{ fontSize: adjustFontSize(12) }}
                    >
                      රහස්‍යතා ප්‍රතිපත්තිය
                    </Text>
                  </TouchableOpacity>
                  <Text
                    className="text-black font-thin ml-0.5"
                    style={{ fontSize: adjustFontSize(12) }}
                  >
                    බලන්න
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default BankDetailsScreen;
