import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
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
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
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
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [filteredBranches, setFilteredBranches] = useState<allBranches[]>([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState("en");
  const { t } = useTranslation();
  const [holdernameNameError, setHoldernameNameError] = useState("");
  const [accountNumbermisMatchError, setAccountNumbermisMatchError] =
    useState("");

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
          
          const sortedBranches = filteredBranches.sort((a: { name: string; }, b: { name: any; }) =>
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
        const storedSelectedDistrict = await AsyncStorage.getItem("district");
        if (storedFirstName) setFirstName(storedFirstName);
        if (storedLastName) setLastName(storedLastName);
        if (storedNic) setNic(storedNic);
        if (storedMobileNumber) setMobileNumber(storedMobileNumber);
        if (storedSelectedDistrict) setSelectedDistrict(storedSelectedDistrict);
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
      !trimmedBranchName ||
      !selectedDistrict
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
  
    try {
      const bankDetails = {
        selectedDistrict,
        accountHolderName: trimmedAccountHolderName,
        accountNumber: trimmedAccountNumber,
        bankName: trimmedBankName,
        branchName: trimmedBranchName,
      };
    
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert(t("Main.error"), t("Main.somethingWentWrong"));
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
    }
  };
  
  const isFormValid = () => {
    return (
      accountNumber &&
      confirmAccountNumber &&
      accountHolderName &&
      bankName &&
      branchName &&
      selectedDistrict
    );
  };

  const validateName = (
    name: string,
    setError: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const regex = /^[\p{L}\u0B80-\u0BFF\u0D80-\u0DFF]+$/u;
    if (!regex.test(name)) {
      setError(t("SignupForum.Startwithletter"));
    } else {
      setError("");
    }
  };

  const handleFirstNameChange = (text: string) => {
    setAccountHolderName(text);
  };

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 24 }}
      className="flex-1 p-6 bg-white"
    >
      <View className="flex-row items-center justify-between mb-6">
        <Ionicons
          name="arrow-back"
          size={24}
          color="black"
          onPress={() => navigation.goBack()}
        />
      </View>

      <View className="items-center mb-6">
        <Image
          source={require("../assets/images/QRScreen.png")}
          style={{ width: 200, height: 200 }}
        />
      </View>

      <Text className="text-lg font-bold text-center text-gray-900 mb-6">
        {t("BankDetails.FillBankDetails")}
      </Text>

      <View className="space-y-4 p-4">
        <TextInput
          placeholder={t("BankDetails.AccountHolderName")}
          className="border-b border-gray-300 pb-2"
          value={accountHolderName}
          onChangeText={handleFirstNameChange}
        />
        {holdernameNameError ? (
          <Text
            className="text-red-500"
            style={{ fontSize: wp(3), marginTop: wp(-4) }}
          >
            {holdernameNameError}
          </Text>
        ) : null}
        <TextInput
          placeholder={t("BankDetails.AccountNumber")}
          className="border-b border-gray-300 pb-2"
          keyboardType="number-pad"
          value={accountNumber}
          contextMenuHidden={true}
          onChangeText={setAccountNumber}
        />
        <TextInput
          placeholder={t("BankDetails.ConfirmAccountNumber")}
          className="border-b border-gray-300 pb-2"
          keyboardType="number-pad"
          value={confirmAccountNumber}
          contextMenuHidden={true}
          onChangeText={setConfirmAccountNumber}
        />
        {accountNumbermisMatchError &&
        accountNumber !== confirmAccountNumber ? (
          <Text
            className="text-red-500"
            style={{ fontSize: wp(3), marginTop: wp(-4) }}
          >
            {accountNumbermisMatchError}
          </Text>
        ) : null}

        <View className="border-b border-gray-300 pl-1 justify-center items-center">
          <Picker
            selectedValue={bankName}
            onValueChange={(value) => setBankName(value)}
            style={{
              fontSize: 12,
              width: wp(90),
            }}
          >
            <Picker.Item label={t("BankDetails.BankName")} value="" />
            {bankNames
              .sort((a, b) => a.name.localeCompare(b.name)) 
              .map((bank) => (
                <Picker.Item
                  key={bank.ID}
                  label={bank.name}
                  value={bank.name}
                />
              ))}
          </Picker>
        </View>

        <View className="border-b border-gray-300 pl-1 justify-center items-center ">
          <Picker
            selectedValue={branchName}
            onValueChange={(value) => setBranchName(value)}
            style={{
              fontSize: 12,
              width: wp(90),
            }}
          >
            <Picker.Item label={t("BankDetails.BranchName")} value="" />
            {filteredBranches.map((branch) => (
              <Picker.Item
                key={branch.ID}
                label={branch.name}
                value={branch.name}
              />
            ))}
          </Picker>
        </View>
      </View>

      <>
        <TouchableOpacity
          onPress={handleRegister}
          disabled={!isFormValid()}
          className={`${
            !isFormValid()
              ? "bg-gray-400 rounded-full py-3 mt-4"
              : "bg-[#353535] rounded-full py-3 mt-4"
          }`}
        >
          <Text className="text-white font-bold text-center">
            {t("BankDetails.Register")}
          </Text>
        </TouchableOpacity>
      </>

      <View className="flex items-center justify-center mt-4 pb-4">
        {language === "en" ? (
          <Text className="text-center text-sm">
            <TouchableOpacity
              onPress={() => navigation.navigate("TermsConditions")}
            >
              <Text className="text-black font-bold">
                <Text className="text-black font-thin">View </Text>Terms &
                Conditions
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate("PrivacyPolicy")}
            >
              <Text className="text-black font-bold">
                <Text className="text-black font-thin"> and </Text>Privacy
                Policy
              </Text>
            </TouchableOpacity>
          </Text>
        ) : (
          <Text className="text-center  text-sm">
            <TouchableOpacity
              onPress={() => navigation.navigate("TermsConditions")}
            >
              <Text
                className="text-black font-bold "
                style={{ fontSize: adjustFontSize(12) }}
              >
                නියමයන් සහ කොන්දේසි{" "}
                <Text
                  className="text-black font-thin"
                  style={{ fontSize: adjustFontSize(12) }}
                >
                  {" "}
                  සහ{" "}
                </Text>
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate("PrivacyPolicy")}
            >
              <Text
                className="text-black font-bold "
                style={{ fontSize: adjustFontSize(12) }}
              >
                පුද්කලිකත්ව ප්‍රතිපත්තිය
                <Text
                  className="text-black font-thin"
                  style={{ fontSize: adjustFontSize(12) }}
                >
                  {" "}
                  බලන්න
                </Text>
              </Text>
            </TouchableOpacity>
          </Text>
        )}
      </View>
    </ScrollView>
  );
};

export default BankDetailsScreen;
