// import {
//   View,
//   Text,
//   Image,
//   ScrollView,
//   SafeAreaView,
//   ActivityIndicator,
//   TouchableOpacity,
//   Alert,
// } from "react-native";
// import React, { useEffect, useState } from "react";
// import AntDesign from "react-native-vector-icons/AntDesign";
// import axios from "axios";
// import { router, useLocalSearchParams } from "expo-router";
// import { StackNavigationProp } from "@react-navigation/stack";
// import { RootStackParamList } from "./types";
// import { RouteProp } from "@react-navigation/native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { environment } from "@/environment/environment";
// import { encode } from "base64-arraybuffer";
// import { useTranslation } from "react-i18next";

// type SelectCropRouteProp = RouteProp<RootStackParamList, "SelectCrop">;
// type SelectCropNavigationCrop = StackNavigationProp<
//   RootStackParamList,
//   "SlectCrop"
// >;

// interface SelectCropProps {
//   navigation: SelectCropNavigationCrop;
//   route: SelectCropRouteProp;
// }

// interface CropItem {
//   id: number;
//   varietyNameEnglish: string;
//   varietyNameSinhala: string;
//   varietyNameTamil: string;
//   image: string;
//   descriptionEnglish: string;
//   descriptionSinhala: string;
//   descriptionTamil: string;
// }

// const SelectCrop: React.FC<SelectCropProps> = ({ navigation, route }) => {

//   const { cropId, selectedVariety } = route.params;
//   console.log("this is the selected variety", selectedVariety)
//   console.log("this is the crop id", cropId);
//   const [crop, setCrop] = useState<CropItem | null>(null);
//   const { t } = useTranslation();
//   const [language, setLanguage] = useState("en"); // Default to English
//   const [loading, setLoading] = useState<boolean>(true);
//   // Updated bufferToBase64 function
//   const bufferToBase64 = (buffer: number[]): string => {
//     const uint8Array = new Uint8Array(buffer); // Create Uint8Array from number[]
//     return encode(uint8Array.buffer); // Pass the underlying ArrayBuffer to encode
//   };

//   const formatImage = (imageBuffer: {
//     type: string;
//     data: number[];
//   }): string => {
//     const base64String = bufferToBase64(imageBuffer.data);
//     return `data:image/png;base64,${base64String}`; // Assuming the image is PNG
//   };

  // useEffect(() => {
  //   const selectedLanguage = t("SelectCrop.LNG");
  //   setLanguage(selectedLanguage); // Set the language
  //   console.log(" the is.....", language);
  //   console.log(" the crops id is.....", cropId);
  //   const fetchCrop = async () => {
  //     try {
  //       const res = await axios.get<CropItem[]>(
  //         `${environment.API_BASE_URL}api/crop/get-crop-variety-details/${cropId}`
  //       );
  //       setCrop(res.data[0]); // Accessing the first item in the array
  //       console.log("this is the crop data..", res.data);
  //     } catch (err) {
  //       console.log("Failed to fetch", err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   if (cropId) {
  //     fetchCrop();
  //   }
  // }, [cropId]);

//   const getCropName = () => {
//     switch (language) {
//       case "si":
//         return crop?.varietyNameSinhala || crop?.varietyNameEnglish;
//       case "ta":
//         return crop?.varietyNameTamil || crop?.varietyNameEnglish;
//       default:
//         return crop?.varietyNameEnglish;
//     }
//   };

//   const getSpecialNotes = () => {
//     switch (language) {
//       case "si":
//         return crop?.descriptionSinhala || crop?.descriptionEnglish;
//       case "ta":
//         return crop?.descriptionTamil || crop?.descriptionEnglish;
//       default:
//         return crop?.descriptionEnglish;
//     }
//   };

  // const HandleEnrollBtn = async () => {
  //   try {
  //     // Get the cropId and user token
  //     console.log(cropId);
  //     const token = await AsyncStorage.getItem("userToken");

  //     // Make the API request with the token in the headers
  //     const res = await axios.get<string>(
  //       `${environment.API_BASE_URL}api/crop/enroll-crop/${cropId}`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`, // Include the token in the Authorization header
  //         },
  //       }
  //     );

  //     // Handle the response based on the status code
  //     if (res.status === 200) {
  //       // Success response
  //       Alert.alert(
  //         t("SelectCrop.success"),
  //         t("SelectCrop.enrollmentSuccessful")
  //       );
  //       navigation.navigate("MyCrop");
  //     } else {
  //       // Any other status
  //       Alert.alert(t("SelectCrop.error"), t("SelectCrop.unexpectedError"));
  //     }
  //   } catch (err) {
  //     if (axios.isAxiosError(err)) {
  //       if (err.response) {
  //         // Handle specific error statuses from the backend
  //         const status = err.response.status;
  //         const message = err.response.data.message;

  //         if (status === 400) {
  //           // Check if the error is about exceeding crop limit
  //           if (message === "You have already enrolled in 3 crops") {
  //             Alert.alert(
  //               t("SelectCrop.error"),
  //               t("SelectCrop.enrollmentLimit")
  //             );
  //           } else {
  //             Alert.alert(t("SelectCrop.unexpectedError"), t("SelectCrop.alreadyEnrolled"));
  //           }
  //         } else if (status === 401) {
  //           // Alert.alert("Unauthorized", message || "You are not authorized.");
  //           Alert.alert(t("SelectCrop.unauthorized"));
  //         } else if (status === 500) {
  //           // Alert.alert("Server Error", message || "Please try again later.");
  //           Alert.alert(t("SelectCrop.serverError"));
  //         } else {
  //           // Alert.alert("Error", message || "An unexpected error occurred.");
  //           Alert.alert(t("SelectCrop.serverError"));
  //         }
  //       } else if (err.request) {
  //         // No response was received from the server
  //         // Alert.alert(
  //         //   "Network Error",
  //         //   "Failed to connect to the server. Please check your internet connection and try again."
  //         // );
  //         Alert.alert(t("SelectCrop.networkError"));
  //       } else {
  //         // Something else went wrong in making the request
  //         // Alert.alert(
  //         //   "Error",
  //         //   "An unexpected error occurred. Please try again."
  //         // );
  //         Alert.alert(t("SelectCrop.unexpectedError"));
  //       }
  //     } else {
  //       // Any other kind of error
  //       // Alert.alert("Error", "An unexpected error occurred. Please try again.");
  //       Alert.alert(t("SelectCrop.unexpectedError"));
  //     }

  //     console.error("Error enrolling crop:", err);
  //   }
  // };

  // if (loading) {
  //   return (
  //     <View className="flex-1 justify-center items-center">
  //       <ActivityIndicator size="large" color="#00ff00" />
  //     </View>
  //   );
  // }

//   return (
//     <SafeAreaView className="flex-1 bg-white">
//       <TouchableOpacity onPress={() => router.back()}>
//         <AntDesign
//           name="left"
//           size={24}
//           color="#000502"
//           style={{ paddingLeft: 10 }}
//         />
//       </TouchableOpacity>
//       <View className="pt-10 items-center">
//         <Text className="text-2xl font-bold pb-10">{getCropName()}</Text>
//         {/* <Image source={{ uri: crop?.image }} className="pb-1 h-40 w-40" /> */}
//         {crop?.image &&
//         typeof crop?.image === "object" &&
//         "data" in crop?.image ? (
//           <Image
//             source={{ uri: formatImage(crop?.image) }} // format blob to base64
//             className="rounded-[30px] h-14 w-14 mb-4"
//             style={{ width: 200, height: 200 }}
//             resizeMode="cover"
//           />
//         ) : (
//           <Text>Loading...</Text> // Handle missing image
//         )}
//       </View>
//       <View className="flex-1 px-4 pl-7">
//         <Text className="font-bold text-lg mb-4">
//           {t("SelectCrop.description")}
//         </Text>
//         <View className="h-[260px] pt-0">
//           <ScrollView>
//             <Text className="text-base leading-relaxed">
//               {getSpecialNotes() ||
//                 "No additional notes available for this crop."}
//             </Text>
//           </ScrollView> 
//         </View>
//       </View>
//       <TouchableOpacity
//         className="bg-[#26D041] p-4 mx-4 mb-4 items-center bottom-0 left-0 right-0"
//         // onPress={HandleEnrollBtn}
//         onPress={() => navigation.navigate("CropEnrol", { cropId })} 
//       >
//         <Text className="text-white text-xl">{t("SelectCrop.enroll")}</Text>
//       </TouchableOpacity>
//     </SafeAreaView>
//   );
// };

// export default SelectCrop;

import {
  View,
  Text,
  Image,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import AntDesign from "react-native-vector-icons/AntDesign";
import axios from "axios";
import { router, useLocalSearchParams } from "expo-router";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "./types";
import { RouteProp } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { environment } from "@/environment/environment";
import { encode } from "base64-arraybuffer";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useTranslation } from "react-i18next";

type SelectCropRouteProp = RouteProp<RootStackParamList, "SelectCrop">;
type SelectCropNavigationCrop = StackNavigationProp<
  RootStackParamList,
  "SlectCrop"
>;

interface SelectCropProps {
  navigation: SelectCropNavigationCrop;
  route: SelectCropRouteProp;
}

interface CropItem {
  id: number;
  varietyNameEnglish: string;
  varietyNameSinhala: string;
  varietyNameTamil: string;
  image: string;
  descriptionEnglish: string;
  descriptionSinhala: string;
  descriptionTamil: string;
}

const SelectCrop: React.FC<SelectCropProps> = ({ navigation, route }) => {
  const { cropId, selectedVariety } = route.params;
  const [crop, setCrop] = useState<CropItem | null>(null);
  const { t } = useTranslation();
  const [language, setLanguage] = useState("en"); // Default to English
  const [loading, setLoading] = useState<boolean>(true);

  const bufferToBase64 = (buffer: number[]): string => {
    const uint8Array = new Uint8Array(buffer);
    return encode(uint8Array.buffer);
  };

  const formatImage = (imageBuffer: { type: string; data: number[] } | null): string | null => {
    if (imageBuffer && imageBuffer.data) {
      const base64String = bufferToBase64(imageBuffer.data);
      return `data:image/png;base64,${base64String}`;
    }
    return null;
  };

  useEffect(() => {
    if (selectedVariety) {
      setCrop(selectedVariety);
      setLoading(false);
    } else {
      setLoading(true); // Show loader if no variety is selected
    }
  }, [selectedVariety]);

  const getCropName = () => {
    switch (language) {
      case "si":
        return crop?.varietyNameSinhala || crop?.varietyNameEnglish;
      case "ta":
        return crop?.varietyNameTamil || crop?.varietyNameEnglish;
      default:
        return crop?.varietyNameEnglish;
    }
  };

  const getSpecialNotes = () => {
    switch (language) {
      case "si":
        return crop?.descriptionSinhala || crop?.descriptionEnglish;
      case "ta":
        return crop?.descriptionTamil || crop?.descriptionEnglish;
      default:
        return crop?.descriptionEnglish;
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
    <SafeAreaView className="flex-1 bg-white" >
      <TouchableOpacity onPress={() => router.back()}>
        <AntDesign name="left" size={24} color="#000502" style={{ paddingHorizontal: wp(4), paddingVertical: hp(2) }}  />
      </TouchableOpacity>
      <View className="pt-10 items-center">
        <Text className="text-2xl font-bold pb-10">{getCropName()}</Text>
        {selectedVariety?.image && typeof selectedVariety.image === "object" ? (
          <Image
            source={{ uri: formatImage(selectedVariety.image) || "" }}
            className="rounded-[30px] h-14 w-14 mb-4"
            style={{ width: 200, height: 200 }}
            resizeMode="cover"
          />
        ) : (
          <Text>No image available</Text> // Fallback if no image data
        )}
      </View>
      <View className="flex-1 px-4 pl-7">
        <Text className="font-bold text-lg mb-4">{t("SelectCrop.description")}</Text>
        <View className="h-[260px] pt-0">
          <ScrollView>
            <Text className="text-base leading-relaxed">
              {getSpecialNotes() || "No additional notes available for this crop."}
            </Text>
          </ScrollView>
        </View>
      </View>
      <TouchableOpacity
        className="bg-[#26D041] p-4 mx-4 mb-4 items-center bottom-0 left-0 right-0 "
        onPress={() => navigation.navigate("CropEnrol", { cropId ,status: "newAdd", onCulscropID: 0})}
      >
        <Text className="text-white text-xl">{t("Verify.Continue")}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default SelectCrop;
