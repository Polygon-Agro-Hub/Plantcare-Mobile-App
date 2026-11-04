import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
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
  Keyboard,
} from "react-native";
import axios from "axios";
import { RootStackParamList } from "../types/types";
import { StackNavigationProp } from "@react-navigation/stack";
import { useFocusEffect } from "@react-navigation/native";
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
  const [loading, setLoading] = useState(false);
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
  const [confirmAccountNumberError, setConfirmAccountNumberError] =
    useState("");
  const [isAccLeadingSpaceError, setIsAccLeadingSpaceError] = useState(false);
  const [isConfirmAccLeadingSpaceError, setIsConfirmAccLeadingSpaceError] =
    useState(false);


  const isSignUp = route?.name === "BankDetailsSignUp";

  const isRegisteredSuccessRef = useRef(false);
  const hasNavigatedRef = useRef(false);
  const isSubmittingRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const nameErrorTimerRef = useRef<NodeJS.Timeout | null>(null);
  const accountErrorTimerRef = useRef<NodeJS.Timeout | null>(null);
  const confirmAccountErrorTimerRef = useRef<NodeJS.Timeout | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (nameErrorTimerRef.current) {
        clearTimeout(nameErrorTimerRef.current);
        nameErrorTimerRef.current = null;
      }
      if (accountErrorTimerRef.current) {
        clearTimeout(accountErrorTimerRef.current);
        accountErrorTimerRef.current = null;
      }
      if (confirmAccountErrorTimerRef.current) {
        clearTimeout(confirmAccountErrorTimerRef.current);
        confirmAccountErrorTimerRef.current = null;
      }
    };
  }, []);

  const navigateToNextScreen = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (hasNavigatedRef.current) return;
    hasNavigatedRef.current = true;

    const targetScreen = isSignUp ? "Dashboard" : "QRcode";

    const performNavigation = () => {
      try {
        navigation.reset({
          index: 0,
          routes: [{ name: "Main", params: { screen: targetScreen } }],
        });
      } catch (err) {
        console.error("Navigation reset error:", err);
        try {
          navigation.navigate("Main", { screen: targetScreen });
        } catch (fallbackErr) {
          console.error("Navigation fallback error:", fallbackErr);
        }
      }
    };

    setTimeout(performNavigation, Platform.OS === "ios" ? 250 : 50);
  }, [isSignUp, navigation]);

  const adjustFontSize = (size: number) =>
    language !== "en" ? size * 0.9 : size;

  useEffect(() => {
    const selectedLanguage = t("Main.LNG");
    setLanguage(selectedLanguage);
  }, [t]);

  const handleBackPress = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      if (isSignUp) {
        navigation.navigate("MembershipScreenSignUp" as any);
      } else {
        navigation.navigate("MembershipScreen" as any);
      }
    }
  }, [navigation, isSignUp]);

  useFocusEffect(
    useCallback(() => {
      const backAction = () => {
        handleBackPress();
        return true;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction,
      );
      return () => subscription.remove();
    }, [handleBackPress]),
  );

  useEffect(() => {
    if (bankName) {
      const selectedBank = bankNames.find((bank) => bank.name === bankName);
      if (selectedBank) {
        try {
          setLoading(true);
          const data = require("@/assets/jsons/bank-details/branches.json");
          const branchesList = Array.isArray(data[selectedBank.ID])
            ? data[selectedBank.ID]
            : [];

          const sortedBranches = [...branchesList].sort(
            (a: { name?: string }, b: { name?: string }) =>
              (a?.name || "").localeCompare(b?.name || ""),
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
        setLoading(false);
      }
    } else {
      setFilteredBranches([]);
      setLoading(false);
    }

    setBranchName("");
  }, [bankName, t]);

  const handleRegister = async () => {
    if (isSubmittingRef.current || disableSubmit) return;

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
        t("Main.Sorry"),
        t("BankDetails.AccountNumbersDoNotMatch"),
        [{ text: t("Main.OK") }],
      );
      setAccountNumbermisMatchError(t("BankDetails.AccountNumbersDoNotMatch"));
      return;
    }

    isSubmittingRef.current = true;
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
        isSubmittingRef.current = false;
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
        isRegisteredSuccessRef.current = true;
        setDisableSubmit(true);
        setIsLoading(false);

        Alert.alert(
          t("Main.Success"),
          t("BankDetails.BankDetailsRegisteredSuccessfully"),
          [
            {
              text: t("Main.OK") || "OK",
              onPress: navigateToNextScreen,
            },
          ],
        );

        timerRef.current = setTimeout(() => {
          navigateToNextScreen();
        }, 3200);
        return;
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
          isRegisteredSuccessRef.current = true;
          setDisableSubmit(true);
          setIsLoading(false);

          Alert.alert(
            t("BankDetails.Failed"),
            t("BankDetails.ExistingBankDetails"),
            [
              {
                text: t("Main.OK") || "OK",
                onPress: navigateToNextScreen,
              },
            ],
          );

          timerRef.current = setTimeout(() => {
            navigateToNextScreen();
          }, 3200);
          return;
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
      isSubmittingRef.current = false;
      if (!isRegisteredSuccessRef.current) {
        setDisableSubmit(false);
        setIsLoading(false);
      }
    }
  };

  const isFormValid = () => {
    const trimmedAcc = accountNumber.trim();
    const trimmedConfirmAcc = confirmAccountNumber.trim();
    const trimmedName = accountHolderName.trim();
    const trimmedBank = bankName.trim();
    const trimmedBranch = branchName.trim();

    return (
      trimmedAcc.length > 0 &&
      trimmedConfirmAcc.length > 0 &&
      trimmedName.length > 0 &&
      validateName(trimmedName) &&
      trimmedBank.length > 0 &&
      trimmedBranch.length > 0 &&
      trimmedAcc === trimmedConfirmAcc &&
      (!accountNumberError || isAccLeadingSpaceError) &&
      (!confirmAccountNumberError || isConfirmAccLeadingSpaceError) &&
      !accountNumbermisMatchError
    );
  };

  const validateName = (name: string) => {
    try {
      const regex = /^[a-zA-Z\u0B80-\u0BFF\u0D80-\u0DFF\s.'-]+$/;
      return regex.test(name);
    } catch {
      return true;
    }
  };

  const handleFirstNameChange = (text: string) => {
    if (nameErrorTimerRef.current) {
      clearTimeout(nameErrorTimerRef.current);
      nameErrorTimerRef.current = null;
    }

    const hasLeadingSpace = text.startsWith(" ");
    const cleaned = hasLeadingSpace ? text.trimStart() : text;
    setAccountHolderName(cleaned);

    if (hasLeadingSpace) {
      setHoldernameNameError(
        t("SignUp.UserNameMustStartWithALetterAndContainNoSpaces"),
      );
      nameErrorTimerRef.current = setTimeout(() => {
        if (cleaned === "" || validateName(cleaned)) {
          setHoldernameNameError("");
        }
      }, 2000);
    } else if (cleaned !== "" && !validateName(cleaned)) {
      setHoldernameNameError(
        t("SignUp.UserNameMustStartWithALetterAndContainNoSpaces"),
      );
    } else {
      setHoldernameNameError("");
    }
  };

  const handleAccountNumberChange = (text: string) => {
    if (accountErrorTimerRef.current) {
      clearTimeout(accountErrorTimerRef.current);
      accountErrorTimerRef.current = null;
    }

    const hasLeadingSpace = text.startsWith(" ");
    const sanitized = text.replace(/[^0-9]/g, "");
    setAccountNumber(sanitized);

    if (hasLeadingSpace) {
      setAccountNumberError(
        t(
          "BankDetails.CanNotStartWithSpace",
          t("SignUp.CanNotStartWithSpace", "Can not Start with Space"),
        ),
      );
      setIsAccLeadingSpaceError(true);
      accountErrorTimerRef.current = setTimeout(() => {
        setAccountNumberError("");
        setIsAccLeadingSpaceError(false);
        accountErrorTimerRef.current = null;
      }, 5000);
    } else if (text !== sanitized) {
      setAccountNumberError(t("BankDetails.AccountNumberMustBeANumber"));
      setIsAccLeadingSpaceError(false);
    } else {
      setAccountNumberError("");
      setIsAccLeadingSpaceError(false);
    }

    if (
      confirmAccountNumber !== "" &&
      sanitized !== "" &&
      confirmAccountNumber !== sanitized
    ) {
      setAccountNumbermisMatchError(
        t("BankDetails.AccountNumbersDoNotMatch"),
      );
    } else {
      setAccountNumbermisMatchError("");
    }
  };

  const handleConfirmAccountNumberChange = (text: string) => {
    if (confirmAccountErrorTimerRef.current) {
      clearTimeout(confirmAccountErrorTimerRef.current);
      confirmAccountErrorTimerRef.current = null;
    }

    const hasLeadingSpace = text.startsWith(" ");
    const sanitized = text.replace(/[^0-9]/g, "");
    setConfirmAccountNumber(sanitized);

    if (hasLeadingSpace) {
      setConfirmAccountNumberError(
        t(
          "BankDetails.CanNotStartWithSpace",
          t("SignUp.CanNotStartWithSpace", "Can not Start with Space"),
        ),
      );
      setIsConfirmAccLeadingSpaceError(true);
      confirmAccountErrorTimerRef.current = setTimeout(() => {
        setConfirmAccountNumberError("");
        setIsConfirmAccLeadingSpaceError(false);
        confirmAccountErrorTimerRef.current = null;
      }, 5000);
    } else if (text !== sanitized) {
      setConfirmAccountNumberError(t("BankDetails.AccountNumberMustBeANumber"));
      setIsConfirmAccLeadingSpaceError(false);
    } else {
      setConfirmAccountNumberError("");
      setIsConfirmAccLeadingSpaceError(false);
    }

    if (
      sanitized !== "" &&
      accountNumber !== "" &&
      accountNumber !== sanitized
    ) {
      setAccountNumbermisMatchError(
        t("BankDetails.AccountNumbersDoNotMatch"),
      );
    } else {
      setAccountNumbermisMatchError("");
    }
  };

  const bankItems = useMemo(() => {
    return [...bankNames]
      .sort((a, b) => (a?.name || "").localeCompare(b?.name || ""))
      .map((bank) => ({ label: bank.name, value: bank.name }));
  }, []);

  const branchItems = useMemo(() => {
    return filteredBranches.map((branch) => ({
      label: branch.name,
      value: branch.name,
    }));
  }, [filteredBranches]);

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
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
        noResultsText="No bank found"
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
        noResultsText="No branch found"
      />

      <CustomHeader
        title=""
        navigation={navigation}
        onBackPress={handleBackPress}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        style={{ flex: 1, backgroundColor: "white" }}
        enabled
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: 24,
          }}
          className="flex-1 bg-white"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
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
              autoCorrect={false}
              spellCheck={false}
              autoComplete="off"
              selectionColor="#0FC7B2"
              cursorColor="#000000"
              style={{
                backgroundColor: "#F4F4F4",
                borderRadius: 25,
                paddingVertical: 16,
                letterSpacing: 0,
                color: "#000000",
                textDecorationLine: "none",
                borderBottomWidth: 0,
                borderBottomColor: "transparent",
                borderWidth: 0,
                borderColor: "transparent",
                elevation: 0,
                shadowOpacity: 0,
              }}
              underlineColorAndroid="transparent"
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
              style={{ letterSpacing: 0, color: "#000000" }}
              keyboardType="number-pad"
              autoCorrect={false}
              spellCheck={false}
              autoComplete="off"
              selectionColor="#0FC7B2"
              value={accountNumber}
              onChangeText={handleAccountNumberChange}
            />
            {accountNumberError ? (
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
              style={{ letterSpacing: 0, color: "#000000" }}
              keyboardType="number-pad"
              autoCorrect={false}
              spellCheck={false}
              autoComplete="off"
              selectionColor="#0FC7B2"
              value={confirmAccountNumber}
              onChangeText={handleConfirmAccountNumberChange}
            />
            {confirmAccountNumberError ? (
              <Text className="text-red-500 text-xs mt-2">
                {confirmAccountNumberError}
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
                    t("Main.Sorry"),
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

        <View className="items-center justify-center w-full px-12 mt-6">
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
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text className="text-sm text-black font-bold underline">
                      Terms & Conditions
                    </Text>
                  </TouchableOpacity>
                  <Text className="text-sm text-black font-thin"> and </Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate("PrivacyPolicy")}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
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
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
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
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
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
    </View>
  );
};

export default BankDetailsScreen;
