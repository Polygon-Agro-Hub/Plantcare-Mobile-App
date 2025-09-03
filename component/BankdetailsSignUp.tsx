import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  BackHandler
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import { RootStackParamList } from "./types";
import { StackNavigationProp } from "@react-navigation/stack";
import { environment } from "@/environment/environment";
import AsyncStorage from "@react-native-async-storage/async-storage";
import bankNames from "../assets/jsons/banks.json";
import { useTranslation } from "react-i18next";
import AntDesign from "react-native-vector-icons/AntDesign";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import DropDownPicker from "react-native-dropdown-picker";
import { set } from "lodash";
import { useFocusEffect } from "@react-navigation/native";

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
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nic, setNic] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [filteredBranches, setFilteredBranches] = useState<allBranches[]>([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState("en");
  const { t } = useTranslation();
  const [bankDropdownOpen, setBankDropdownOpen] = useState(false);
  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);
  const [disableSubmit, setDisableSubmit] = useState(false);
  const [holdernameNameError, setHoldernameNameError] = useState("");
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
    if (bankName) {
      const selectedBank = bankNames.find((bank) => bank.name === bankName);
      if (selectedBank) {
        try {
          const data = require("../assets/jsons/branches.json");
          const filteredBranches = data[selectedBank.ID] || [];

          const sortedBranches = filteredBranches.sort(
            (a: { name: string }, b: { name: any }) =>
              a.name.localeCompare(b.name)
          );

          setFilteredBranches(sortedBranches);
        } catch (error) {
          console.error("Error loading branches", error);
          Alert.alert(t("Main.error"), t("Main.somethingWentWrong"));
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

  useEffect(() => {
    const loadData = async () => {
      try {
        const storedFirstName = await AsyncStorage.getItem("firstName");
        const storedLastName = await AsyncStorage.getItem("lastName");
        const storedNic = await AsyncStorage.getItem("nic");
        const storedMobileNumber = await AsyncStorage.getItem("mobileNumber");
        if (storedFirstName) setFirstName(storedFirstName);
        if (storedLastName) setLastName(storedLastName);
        if (storedNic) setNic(storedNic);
        if (storedMobileNumber) setMobileNumber(storedMobileNumber);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleRegister = async () => {
    if (loading) {
      Alert.alert(t("BankDetails.Loading"), t("BankDetails.LoadingText"));
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
      Alert.alert(t("BankDetails.sorry"), t("BankDetails.PlzFillAllFields"));
      return;
    }

    if (trimmedAccountNumber !== trimmedConfirmAccountNumber) {
      Alert.alert(
        t("BankDetails.sorry"),
        t("BankDetails.AccountNumberMismatch")
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
        Alert.alert(t("Main.error"), t("Main.somethingWentWrong"));
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
        }
      );

      if (response.status === 200) {
        Alert.alert(
          t("BankDetails.success"),
          t("BankDetails.SuccessfullyRegistered")
        );
        navigation.navigate("Main");
        setDisableSubmit(false);
        setIsLoading(false);
      } else {
        Alert.alert(t("BankDetails.failed"), t("BankDetails.failedToRegister"));
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          Alert.alert(
            t("BankDetails.failed"),
            t("BankDetails.ExistingBankDetails")
          );
          navigation.navigate("Main");
        } else {
          Alert.alert(t("Main.error"), t("Main.somethingWentWrong"));
        }
      } else {
        Alert.alert(t("Main.error"), t("Main.somethingWentWrong"));
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
    // Regex to allow only letters (including Unicode/Sinhala/Tamil) and spaces
    const regex = /^[\p{L}\s\u0B80-\u0BFF\u0D80-\u0DFF]+$/u;
    return regex.test(name);
  };
  
const handleFirstNameChange = (text: string) => {
  // Automatically remove leading spaces
  const trimmedText = text.replace(/^\s+/, "");

  if (validateName(trimmedText) || trimmedText === "") {
    setAccountHolderName(trimmedText);
    setHoldernameNameError("");
  } else {
    setHoldernameNameError(t("SignupForum.Startwithletter"));
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
      
      // Check if confirm account number already has a value and update mismatch error
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
      
      // Check if account numbers match when typing in confirm field
      if (text !== "" && accountNumber !== text) {
        setAccountNumbermisMatchError(t("BankDetails.AccountNumberMismatch"));
      } else {
        setAccountNumbermisMatchError("");
      }
    } else {
      setAccountNumberError(t("BankDetails.OnlyNumbers"));
    }
  };

     useFocusEffect(
        React.useCallback(() => {
          const onBackPress = () => {
            navigation.goBack(); 
            return true; // Prevent default back action
          };
      
          BackHandler.addEventListener("hardwareBackPress", onBackPress);
      
          return () => BackHandler.removeEventListener("hardwareBackPress", onBackPress);
        }, [navigation])
      );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      enabled
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 24 }}
        className="flex-1  bg-white"
        style={{ paddingHorizontal: wp(4), paddingVertical: hp(2) }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-row items-center justify-between ">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <AntDesign name="left" size={24} color="#000502" />
          </TouchableOpacity>
        </View>

        <View className="items-center mb-6 mt-[-15%]">
          <Image
            source={require("../assets/images/QRScreen.webp")}
            style={{ width: 200, height: 200 }}
            resizeMode="contain"
          />
        </View>

        <Text className="text-lg font-bold text-center text-gray-900 mb-2">
          {t("BankDetails.FillBankDetails")}
        </Text>

        <View className="space-y-4 p-4">
          <Text
            className="text-[#070707] -mb-2"
            style={{ fontSize: adjustFontSize(14) }}
          >
            {t("BankDetails.AccountHolderName")}
          </Text>
        <TextInput
  placeholder={t("Enter Account Holder’s Name")}
  className=" pb-2 bg-[#F4F4F4] rounded-full  p-4"
  placeholderTextColor="#5e5d5d"
  value={accountHolderName}
  onChangeText={handleFirstNameChange}
/>
{holdernameNameError ? (
  <Text className="text-red-500" style={{ fontSize: wp(3), marginTop: wp(-4) }}>
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
            placeholder={t("Enter Account Number")}
             placeholderTextColor="#5e5d5d"
            className=" pb-2 bg-[#F4F4F4] rounded-full  p-4"
            keyboardType="number-pad"
            value={accountNumber}
            onChangeText={handleAccountNumberChange}
          />
          {accountNumberError && !validateAccountNumber(accountNumber) ? (
            <Text className="text-red-500" style={{ fontSize: wp(3), marginTop: wp(-4) }}>
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
            placeholder={t("Re-enter Account Number")}
             placeholderTextColor="#5e5d5d"
            className=" pb-2 bg-[#F4F4F4] rounded-full  p-4"
            keyboardType="number-pad"
            value={confirmAccountNumber}
            onChangeText={handleConfirmAccountNumberChange}
          />
          {accountNumberError && !validateAccountNumber(confirmAccountNumber) ? (
            <Text className="text-red-500" style={{ fontSize: wp(3), marginTop: wp(-4) }}>
              {accountNumberError}
            </Text>
          ) : null}
          
          {accountNumbermisMatchError ? (
            <Text className="text-red-500" style={{ fontSize: wp(3), marginTop: wp(-4) }}>
              {accountNumbermisMatchError}
            </Text>
          ) : null}


            <Text
            className="text-[#070707] -mb-2"
            style={{ fontSize: adjustFontSize(14) }}
          >
           {t("BankDetails.BankName")}
          </Text>
          <View className="  justify-center items-center ">
            <DropDownPicker
              open={bankDropdownOpen}
              setOpen={(open) => {
                setBankDropdownOpen(open);
                setBranchDropdownOpen(false);
              }}
              searchable={true}
              value={bankName}
              setValue={setBankName}
              items={bankNames.map((bank) => ({
                label: bank.name,
                value: bank.name,
              }))}
              placeholder={t("Select Bank Name")}
              placeholderStyle={{ color: "#5e5d5d" }}
              listMode="MODAL"
              dropDownDirection="BOTTOM"
              zIndex={3000}
              zIndexInverse={1000}
              dropDownContainerStyle={{
              }}
              style={{
                borderWidth: 0,
                width: wp(85),
                paddingHorizontal: 4,
                paddingVertical: 8,
                backgroundColor: "#F4F4F4",
                borderRadius: 30,
              }}
              textStyle={{
                marginLeft: 10,
              }}
              searchPlaceholder={t("BankDetails.SearchHere")}
            />
          </View>
   <Text
            className="text-[#070707] -mb-2 "
            style={{ fontSize: adjustFontSize(14) }}
          >
           {t("BankDetails.BranchName")}
          </Text>
          <View className="  justify-center items-center ">
            <DropDownPicker
              open={branchDropdownOpen}
              setOpen={(open) => {
                setBranchDropdownOpen(open);
                setBankDropdownOpen(false);
              }}
              value={branchName}
              setValue={setBranchName}
              items={filteredBranches.map((branch) => ({
                label: branch.name,
                value: branch.name,
              }))}
              placeholder={t("Select Branch Name")}
              placeholderStyle={{ color: "#5e5d5d" }}
              listMode="MODAL"
              searchable={true}
              dropDownDirection="BOTTOM"
              zIndex={3000}
              zIndexInverse={1000}
              dropDownContainerStyle={{
              }}
              style={{
                borderWidth: 0,
                width: wp(85),
                paddingHorizontal: 4,
                paddingVertical: 8,
                backgroundColor: "#F4F4F4",
                borderRadius: 30,
              }}
              textStyle={{
                marginLeft: 10,
              }}
            />
          </View>
        </View>

        <>
  
<View className="flex items-center justify-center  pb-4">
<TouchableOpacity
            className={`rounded-full p-4 mt-4 mb-3 w-60 bg-[#ECECEC] `}
            onPress={() => navigation.navigate("Main")}
          >
            <Text className="text-[#686868] font-bold text-center">
              {t("Membership.Skip")}
            </Text>
          </TouchableOpacity>

                  <TouchableOpacity
            onPress={handleRegister}
            disabled={disableSubmit || !isFormValid()}
            className={`${
              disableSubmit || !isFormValid()
                ? "bg-gray-400 rounded-full p-4 mt-2 w-60 "
                : "bg-[#353535] rounded-full p-4 mt-2 w-60"
            }`}
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
          
        </>

        {/* <View className="flex items-center justify-center mt-4 pb-4">
          {language === "en" ? (
            <View className="flex-row justify-center flex-wrap">
             <Text className="text-sm text-black font-thin">View </Text>
           
             <TouchableOpacity onPress={() => navigation.navigate("TermsConditions")}>
               <Text className="text-sm text-black font-bold underline">
                 Terms & Conditions
               </Text>
             </TouchableOpacity>
           
             <Text className="text-sm text-black font-thin"> and </Text>
           
             <TouchableOpacity onPress={() => navigation.navigate("PrivacyPolicy")}>
               <Text className="text-sm text-black font-bold underline">
                 Privacy Policy
               </Text>
             </TouchableOpacity>
           </View>
          ) : (
            <View className="flex-row justify-center flex-wrap">
             <TouchableOpacity onPress={() => navigation.navigate("TermsConditions")}>
               <Text
                 className="text-black font-bold"
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
           
             <TouchableOpacity onPress={() => navigation.navigate("PrivacyPolicy")}>
               <Text
                 className="text-black font-bold"
                 style={{ fontSize: adjustFontSize(12) }}
               >
                 {""} පුද්කලිකත්ව ප්‍රතිපත්තිය
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
        </View> */}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default BankDetailsScreen;
