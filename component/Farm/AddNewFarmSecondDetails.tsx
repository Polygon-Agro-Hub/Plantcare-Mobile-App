import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from "@/component/types";
import { useNavigation } from "@react-navigation/native";
import { useRoute, RouteProp } from "@react-navigation/native";

import { StackNavigationProp } from "@react-navigation/stack";
import { useDispatch, useSelector } from 'react-redux';
import { 
  setFarmSecondDetails, 
  selectFarmSecondDetails, 
  selectFarmBasicDetails,
  saveFarmToBackend,
  clearSubmitState,
  selectIsSubmitting,
  selectSubmitError,
  selectSubmitSuccess,
} from "../../store/farmSlice";
import type { RootState, AppDispatch } from "../../services/reducxStore";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useTranslation } from 'react-i18next';
interface RouteParams {
  membership?: string;
  currentFarmCount?: number;
}

type AddNewFarmSecondDetailsNavigationProp = StackNavigationProp<
  RootStackParamList,
  "AddNewFarmSecondDetails"
>;

type AddNewFarmBasicDetailsRouteProp = RouteProp<RootStackParamList, 'AddNewFarmSecondDetails'>;

type AddNewFarmSecondDetailsProps = {
  navigation: AddNewFarmSecondDetailsNavigationProp;
};

const AddNewFarmSecondDetails = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute<AddNewFarmBasicDetailsRouteProp>();
  const dispatch = useDispatch<AppDispatch>();

   const { membership = 'basic' } = route.params || {};
  
  // Get existing data from Redux
  const existingSecondDetails = useSelector((state: RootState) => selectFarmSecondDetails(state));
  const farmBasicDetails = useSelector((state: RootState) => selectFarmBasicDetails(state));
  
  // Get submission state from Redux
  const isSubmitting = useSelector((state: RootState) => selectIsSubmitting(state));
  const submitError = useSelector((state: RootState) => selectSubmitError(state));
  const submitSuccess = useSelector((state: RootState) => selectSubmitSuccess(state));
  
  // Initialize state with existing Redux data or empty values
  const [numberOfStaff, setNumberOfStaff] = useState(existingSecondDetails?.numberOfStaff || "");
  const [loginCredentialsNeeded, setLoginCredentialsNeeded] = useState(existingSecondDetails?.loginCredentialsNeeded || "");
  const {t} = useTranslation();
  // Handle submission success/error
  React.useEffect(() => {
    if (submitSuccess) {
      Alert.alert(t("Farms.Success"), t("Farms.Farm saved successfully!"), [
        {
          text: "OK",
          onPress: () => {
            dispatch(clearSubmitState());
            navigation.navigate("Main", { screen: "AddFarmList" })
          },
        },
      ]);
    }
    
    if (submitError) {
      Alert.alert("Error", submitError, [
        {
          text: "OK",
          onPress: () => dispatch(clearSubmitState()),
        },
      ]);
    }
  }, [submitSuccess, submitError, dispatch, navigation]);

  // Function to save farm directly (when no staff members need login credentials)
  const saveFarmDirectly = async () => {
    // Clear any previous submission state
    dispatch(clearSubmitState());

    // Validate that we have all required data
    if (!farmBasicDetails) {
      Alert.alert(t("Farms.Sorry"), t("Farms.Missing farm details. Please go back and complete all steps."));
      return;
    }

    const farmSecondDetails = {
      numberOfStaff,
      loginCredentialsNeeded
    };

    // Prepare complete farm data without staff details
    const completeFarmData = {
      basicDetails: farmBasicDetails,
      secondDetails: farmSecondDetails,
      staffDetails: [], // Empty array since no staff need login credentials
    };

    // Dispatch the async thunk to save farm to backend
    dispatch(saveFarmToBackend(completeFarmData));
  };

  const handleAddStaff = () => {
    if (!numberOfStaff) {
      Alert.alert(t("Farms.Sorry"), t('Farms.Please enter the number of staff'));
      return;
    }
    if (!loginCredentialsNeeded) {
      Alert.alert(t("Farms.Sorry"), t('Farms.Please enter the number of login credentials needed'));
      return;
    }

    // Validate that loginCredentialsNeeded is not greater than numberOfStaff
    const staffCount = parseInt(numberOfStaff, 10);
    const credentialsCount = parseInt(loginCredentialsNeeded, 10);
    
    if (credentialsCount > staffCount) {
      Alert.alert(t("Farms.Sorry"), t('Farms.Login credentials cannot exceed the total number of staff'));
      return;
    }

    // Validate that both values are not negative
    if (staffCount < 0 || credentialsCount < 0) {
      Alert.alert(t("Farms.Sorry"), t('Farms.Staff numbers cannot be negative'));
      return;
    }

    // Prepare data to dispatch to Redux
    const farmSecondDetails = {
      numberOfStaff,
      loginCredentialsNeeded
    };

    console.log('Second details data:', farmSecondDetails);
    console.log('Basic details from Redux:', farmBasicDetails);

    // Dispatch data to Redux store
    dispatch(setFarmSecondDetails(farmSecondDetails));

    // Check if both staff count and credentials needed are 0
    if (staffCount === 0 && credentialsCount === 0) {
      // Show confirmation dialog
      Alert.alert(
        t("Farms.No Staff Login Required"),
        t("Farms.You have indicated that no staff members need login credentials. The farm will be saved directly."),
        [
          {
            text: t("Farms.Cancel"),
            style: "cancel"
          },
          {
            text: t("Farms.Save Farm"),
            onPress: saveFarmDirectly
          }
        ]
      );
      return;
    }

    // Check if credentials needed is 0 (but staff count is not 0)
    if (credentialsCount === 0) {
      // Show confirmation dialog
      Alert.alert(
        t("Farms.No Login Credentials Required"),
        t("Farms.You have indicated that no staff members need login credentials. The farm will be saved directly."),
        [
          {
            text: t("Farms.Cancel"),
            style: "cancel"
          },
          {
            text: t("Farms.Save Farm"),
            onPress: saveFarmDirectly
          }
        ]
      );
      return;
    }

    try {
      // Navigate to next screen - Redux data will be available there
      // Only navigate if credentials are needed
    //  navigation.navigate('Addmemberdetails' as any);
     navigation.navigate('Addmemberdetails' as any, {
      membership: membership
     
    });
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const handleGoBack = () => {
    // Save current data to Redux before going back
    if (numberOfStaff || loginCredentialsNeeded) {
      const farmSecondDetails = {
        numberOfStaff,
        loginCredentialsNeeded
      };
      dispatch(setFarmSecondDetails(farmSecondDetails));
    }
    
    navigation.goBack();
  };

  const getMembershipDisplay = () => {
    const membershipType = membership.toLowerCase();
    
    switch (membershipType) {
      case 'pro':
        return {
          text: 'PRO',
          bgColor: 'bg-[#FFF5BD]',
          textColor: 'text-[#E2BE00]'
        };
      case 'basic':
      default:
        return {
          text: 'BASIC',
          bgColor: 'bg-[#CDEEFF]',
          textColor: 'text-[#223FFF]'
        };
    }
  };

  const membershipDisplay = getMembershipDisplay();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        className="px-6"
      >
        {/* Header */}
        <View className=""
          style={{ paddingHorizontal: wp(4), paddingVertical: hp(2) }}
        >
          <View className="flex-row items-center justify-between mb-6">
            <Text className="font-semibold text-lg ml-[30%]">{t("Farms.Add New Farm")}</Text>
               <View className={`${membershipDisplay.bgColor} px-3 py-1 rounded-lg`}>
                          <Text className={`${membershipDisplay.textColor} text-xs font-medium`}>
                            {membershipDisplay.text}
                          </Text>
                        </View>
          </View>

          {/* Progress Steps */}
          <View className="flex-row items-center justify-center mb-8">
            <View className="w-[29px] h-[29px] border border-[#2AAD7A] bg-[#2AAD7A] rounded-full flex items-center justify-center">
              <Image
                className="w-[10px] h-[13px]"
                source={require("../../assets/images/Farm/locationWhite.webp")}
              />
            </View>
            <View className="w-24 h-0.5 bg-[#2AAD7A] mx-2" />
            <View className="w-[29px] h-[29px] border border-[#2AAD7A] bg-[#2AAD7A] rounded-full flex items-center justify-center">
              <Image
                className="w-[11px] h-[12px]"
                source={require("../../assets/images/Farm/userwhite.webp")}
              />
            </View>
            <View className="w-24 h-0.5 bg-[#C6C6C6] mx-2" />
            <View className="w-[29px] h-[29px] border border-[#C6C6C6] rounded-full flex items-center justify-center">
              <Image
                className="w-[13.125px] h-[15px]"
                source={require("../../assets/images/Farm/check.png")}
              />
            </View>
          </View>

          {/* Show farm name from Redux if available */}
          {/* {farmBasicDetails?.farmName && (
            <View className="mb-4">
              <Text className="text-center text-gray-600">
                Setting up staff for: {farmBasicDetails.farmName}
              </Text>
            </View>
          )} */}

          {/* Illustration and Number of Staff Section */}
          <View className="flex-1 items-center justify-center mt-2">
            <Image
              className="w-[259px] h-[161px]"
              source={require("../../assets/images/Farm/groupFarmers.webp")}
            />
            <View className="mt-5 w-full">
              <View className="flex-1 items-center justify-center mt-2">
                <Text className="font-semibold text-base">{t("Farms.Number of Staff")}</Text>
              </View>
              <TextInput
                value={numberOfStaff}
                onChangeText={setNumberOfStaff}
                placeholder={t("Farms.Total number of staff working")}
                placeholderTextColor="#585858"
                className="bg-[#F4F4F4] p-3 rounded-full text-gray-800 mt-2"
                keyboardType="numeric"
                style={{ textAlign: "center" }}
                editable={!isSubmitting}
              />

              <View className="flex-1 items-center justify-center mt-2">
                <Text className="font-semibold text-base mt-2">
                  {t("Farms.How many staff will be")}
                </Text>
                <View className="flex-1 items-center justify-center">
                  <Text className="font-semibold text-base">
                    {t("Farms.using the app")}
                  </Text>
                </View>
              </View>
              <TextInput
                value={loginCredentialsNeeded}
                onChangeText={setLoginCredentialsNeeded}
                placeholder={t("Farms.Number of login credentials needed")}
                placeholderTextColor="#585858"
                className="bg-[#F4F4F4] p-3 rounded-full text-gray-800 mt-2"
                keyboardType="numeric"
                style={{ textAlign: "center" }}
                editable={!isSubmitting}
              />
            </View>
          </View>
        </View>

        {/* Buttons */}
        <View className="mt-8 mb-2">
          <TouchableOpacity 
            className="bg-[#F3F3F5] py-3 mx-6 rounded-full"
            onPress={handleGoBack}
            disabled={isSubmitting}
          >
            <Text className="text-[#84868B] text-center font-semibold text-lg">
              {t("Farms.Go Back")}
            </Text>
          </TouchableOpacity>
        </View>
        <View className="mt-2 mb-[40%]">
          <TouchableOpacity
            className={`py-3 mx-6 rounded-full ${isSubmitting ? 'bg-gray-400' : 'bg-black'}`}
            onPress={handleAddStaff}
            disabled={isSubmitting}
          >
            <View className="flex-row items-center justify-center">
              {isSubmitting && (
                <ActivityIndicator
                  size="small"
                  color="white"
                  style={{ marginRight: 8 }}
                />
              )}
              <Text className="text-white text-center font-semibold text-lg">
                {isSubmitting ? t("Farms.Saving...") : t("Farms.Add Staff")}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddNewFarmSecondDetails;