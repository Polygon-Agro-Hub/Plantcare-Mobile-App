// import {
//   SafeAreaView,
//   ScrollView,
//   Text,
//   TouchableOpacity,
//   ActivityIndicator,
//   View,
//   Alert,
//   Linking,
//   RefreshControl
// } from "react-native";
// import React, { useEffect, useState } from "react";
// import { StatusBar } from "expo-status-bar";
// import Ionicons from "react-native-vector-icons/Ionicons";
// import axios from "axios";
// import AntDesign from "react-native-vector-icons/AntDesign";
// import { StackNavigationProp } from "@react-navigation/stack";
// import { RootStackParamList } from "./types";
// import { RouteProp } from "@react-navigation/native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import moment from "moment";
// import { environment } from "@/environment/environment";
// import NavigationBar from "@/Items/NavigationBar";
// import { Dimensions } from "react-native";
// import i18n from "@/i18n/i18n";
// import { useTranslation } from "react-i18next";
// import CultivatedLandModal from "./CultivatedLandModal"; // Replace with the correct path
// import {
//   widthPercentageToDP as wp,
//   heightPercentageToDP as hp,
// } from "react-native-responsive-screen";
// import * as Location from 'expo-location';

// interface CropItem {
//   id: string;
//   task: string;
//   taskIndex: number;
//   days: number;
//   CropDuration: string;
//   taskDescriptionEnglish: string;
//   taskCategoryEnglish: string;
//   taskDescriptionSinhala: string;
//   taskDescriptionTamil: string;
//   status: string;
//   startingDate: string;
//   createdAt: string;
//   onCulscropID: number;
//   imageLink: string;
//   videoLink: string;
//   reqImages: number;
//   reqGeo: number;
// }

// type CropCalanderProp = RouteProp<RootStackParamList, "CropCalander">;

// type CropCalendarNavigationProp = StackNavigationProp<
//   RootStackParamList,
//   "CropCalander"
// >;

// interface CropCalendarProps {
//   navigation: CropCalendarNavigationProp;
//   route: CropCalanderProp;
// }

// const screenWidth = Dimensions.get("window").width;

// const CropCalander: React.FC<CropCalendarProps> = ({ navigation, route }) => {
//   const [crops, setCrops] = useState<CropItem[]>([]);
//   const [checked, setChecked] = useState<boolean[]>([]);
//   const [timestamps, setTimestamps] = useState<string[]>([]);
//   const [language, setLanguage] = useState("en");
//   const { cropId, cropName } = route.params;
//   const { t } = useTranslation();
//   const [updateerror, setUpdateError] = useState<string>("");
//   const [lastCompletedIndex, setLastCompletedIndex] = useState<number | null>(
//     null
//   );
//   const [loading, setLoading] = useState<boolean>(true);
//   const [isCultivatedLandModalVisible, setCultivatedLandModalVisible] =
//     useState(false);
//   const [isImageUpload, setImageUpload] = useState(false);
//   const [isCompleted, setCompleted] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);
//   const [refloading, setRefLoading] = useState(false);
//   const [hasMore, setHasMore] = useState(true);
//   const [page, setPage] = useState(1);

//   useEffect(() => {
//     const loadLanguage = async () => {
//         const storedLanguage = await AsyncStorage.getItem("@user_language");
//         if (storedLanguage) {
//             setLanguage(storedLanguage);
//             i18n.changeLanguage(storedLanguage);
//         }
//     };

//     const fetchCrops = async () => {
//         try {
//             setLanguage(t("CropCalender.LNG"));
//             const token = await AsyncStorage.getItem("userToken");

//             const response = await axios.get(
//                 `${environment.API_BASE_URL}api/crop/slave-crop-calendar/${cropId}`,
//                 {
//                     params: { limit: 10 },
//                     headers: {
//                         Authorization: `Bearer ${token}`,
//                     },
//                 }
//             );

//             const formattedCrops = response.data.map((crop: CropItem) => ({
//                 ...crop,
//                 startingDate: moment(crop.startingDate).format("YYYY-MM-DD"),
//                 createdAt: moment(crop.createdAt).format("YYYY-MM-DD"),
//             }));

//             setCrops(formattedCrops); // Overwrite crops instead of appending
//             setHasMore(formattedCrops.length === 10); // Check if more crops are available

//             const newCheckedStates = formattedCrops.map(
//                 (crop: CropItem) => crop.status === "completed"
//             );
//             setChecked(newCheckedStates);

//             // Set last completed index
//             const lastCompletedTaskIndex = newCheckedStates.lastIndexOf(true);
//             setLastCompletedIndex(lastCompletedTaskIndex);

//             setTimestamps(new Array(response.data.length).fill(""));
//         } catch (error) {
//             // Handle error
//             // Alert.alert(t("Main.error"), t("Main.somethingWentWrong"));
//         } finally {
//             setLoading(false);
//         }
//     };

//     fetchCrops();
//     loadLanguage();
// }, []); // Removed dependency on page and mount

//   // useEffect(() => {
//   //   let isMounted = true;
//   //   const loadLanguage = async () => {
//   //     const storedLanguage = await AsyncStorage.getItem("@user_language");
//   //     if (storedLanguage) {
//   //       setLanguage(storedLanguage);
//   //       i18n.changeLanguage(storedLanguage);
//   //     }
//   //   };

//   //   const fetchCrops = async () => {
//   //     try {
//   //       setLanguage(t("CropCalender.LNG"));
//   //       const token = await AsyncStorage.getItem("userToken");

//   //       const response = await axios.get(
//   //         `${environment.API_BASE_URL}api/crop/slave-crop-calendar/${cropId}`,
//   //         {
//   //           params: { page, limit: 10 },
//   //           headers: {
//   //             Authorization: `Bearer ${token}`,
//   //           },
//   //         }
//   //       );

//   //       const formattedCrops = response.data.map((crop: CropItem) => ({
//   //         ...crop,
//   //         startingDate: moment(crop.startingDate).format("YYYY-MM-DD"),
//   //         createdAt: moment(crop.createdAt).format("YYYY-MM-DD"),
//   //       }));

//   //       if (isMounted) {
//   //         setCrops((prevPosts) => [...prevPosts, ...formattedCrops]);
//   //         setHasMore(formattedCrops.length === 10);
//   //       }

//   //       // setCrops(formattedCrops);
//   //       // const checkedStates = response.data.map(
//   //       //   (crop: CropItem) => crop.status === "completed"
//   //       // );
//   //       // setChecked(checkedStates);
//   //       // // console.log(formattedCrops);

//   //       // const lastCompletedTaskIndex = checkedStates.lastIndexOf(true);
//   //       // setLastCompletedIndex(lastCompletedTaskIndex);

//   //       const newCheckedStates = [
//   //         ...checked,
//   //         ...response.data.map((crop: CropItem) => crop.status === "completed"),
//   //       ];
//   //       setChecked(newCheckedStates);

//   //       // Set last completed index
//   //       const lastCompletedTaskIndex = newCheckedStates.lastIndexOf(true);
//   //       setLastCompletedIndex(lastCompletedTaskIndex);

//   //       setTimestamps(new Array(response.data.length).fill(""));
//   //     } catch (error) {
//   //       if (isMounted) {
//   //       }
//   //       // Alert.alert(t("Main.error"), t("Main.somethingWentWrong"));
//   //     } finally {
//   //       setLoading(false);
//   //     }
//   //   };

//   //   fetchCrops();
//   //   loadLanguage();
//   // }, [page]);

//   const loadMorePosts = () => {
//     if (!loading && hasMore) {
//       setPage((prevPage) => prevPage + 1);
//     }
//   };

//   const handleCheck = async (i: number) => {
//     await AsyncStorage.removeItem(`uploadProgress-${cropId}`);

//     const now = moment();
//     const currentCrop = crops[i];
//     const PreviousCrop = crops[i - 1];
//     const NextCrop = crops[i + 1];

//     if (i > 0 && !checked[i - 1]) {
//       return; // Ensure previous task is completed
//     }

//     // Initialize updateMessage with a default message
//     let updateMessage = '';

//     if (PreviousCrop && currentCrop) {
//       const PreviousCropDate = new Date(PreviousCrop.createdAt);
//       const TaskDays = currentCrop.days;
//       const CurrentDate = new Date();
//       const nextCropUpdate = new Date(
//         PreviousCropDate.getTime() + TaskDays * 24 * 60 * 60 * 1000
//       );
//       const remainingTime = nextCropUpdate.getTime() - CurrentDate.getTime();
//       const remainingDays = Math.ceil(remainingTime / (24 * 60 * 60 * 1000));

//       if (remainingDays > 0 && language=='si' ) {
//         updateMessage = `${t("CropCalender.YouHave")}  ${t(
//           "CropCalender.daysRemaining", {
//         date: remainingDays
//       }
//         )}`;
//       }
//        else {
//         updateMessage = t("CropCalender.overDue");
//       }

//       // Fallback message if no update message
//       if (!updateMessage) {
//         updateMessage = `${t("CropCalender.YouHave")} ${remainingDays} ${t(
//           "CropCalender.daysRemaining"
//         )}`;
//       }

//       setUpdateError(updateMessage);  // Set the error message here
//     } else {
//       // If the previous crop or current crop is not available, set a default error message
//       updateMessage = t("CropCalender.noCropData");
//       setUpdateError(updateMessage);
//     }

//     const newStatus = checked[i] ? "pending" : "completed";

//     try {
//       const token = await AsyncStorage.getItem("userToken");

//       await axios.post(
//         `${environment.API_BASE_URL}api/crop/update-slave`,
//         {
//           id: currentCrop.id,
//           status: newStatus,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       const updatedChecked = [...checked];
//       updatedChecked[i] = !updatedChecked[i];
//       setChecked(updatedChecked);

//       if (updatedChecked[i]) {
//         const updatedTimestamps = [...timestamps];
//         updatedTimestamps[i] = now.toISOString();
//         setTimestamps(updatedTimestamps);

//         await AsyncStorage.setItem(`taskTimestamp_${i}`, now.toISOString());
//         setLastCompletedIndex(i);
//       } else {
//         const updatedTimestamps = [...timestamps];
//         updatedTimestamps[i] = "";
//         setTimestamps(updatedTimestamps);
//         await AsyncStorage.removeItem(`taskTimestamp_${i}`);

//         const newLastCompletedIndex = updatedChecked.lastIndexOf(true);
//         setLastCompletedIndex(newLastCompletedIndex);
//       }

//       const reqGeo = currentCrop.reqGeo;
//       if (reqGeo == 1 && newStatus === "completed") {
//         await handleLocationIconPress(currentCrop);
//       }

//       Alert.alert(
//         t("CropCalender.success"),
//         t("CropCalender.taskUpdated", {
//           task: i + 1,
//           status: t(`CropCalender.status.${newStatus}`),
//         })
//       );

//       if (updatedChecked[i] && crops[i].reqImages !== 0) {
//         setCultivatedLandModalVisible(true);
//       }
//     } catch (error: any) {
//       if (
//         error.response &&
//         error.response.data.message.includes(
//           "You cannot change the status back to pending after 1 hour"
//         )
//       ) {
//         Alert.alert(
//           t("CropCalender.sorry"),
//           t("CropCalender.cannotChangeStatus")
//         );
//       } else if (
//         error.response &&
//         error.response.data.message.includes("You need to wait 6 hours")
//       ) {
//         Alert.alert(t("CropCalender.sorry"), updateMessage);  // Show the updateMessage here
//       } else {
//         Alert.alert(t("CropCalender.sorry"), updateMessage);  // Show the updateMessage here
//       }
//     }
//   };

//   useEffect(() => {
//     const loadTimestamps = async () => {
//       const loadedTimestamps = [];
//       for (let i = 0; i < crops.length; i++) {
//         const timestamp = await AsyncStorage.getItem(`taskTimestamp_${i}`);
//         loadedTimestamps.push(timestamp || "");
//       }
//       setTimestamps(loadedTimestamps);
//     };

//     if (crops.length > 0) {
//       loadTimestamps();
//     }
//   }, [crops]);

//     const handleLocationIconPress = async (currentCrop: CropItem) => {
//           setLoading(true);
//           console.log(currentCrop.id)
//       try {
//         const { status } = await Location.requestForegroundPermissionsAsync();
//         if (status === 'granted') {
//           const location = await Location.getCurrentPositionAsync({});

//           // Fetch weather data directly for the current location
//           console.log(location.coords.latitude, location.coords.longitude);
//           setLoading(false);

//           const token = await AsyncStorage.getItem('userToken');
//           const response = await axios.post(
//             `${environment.API_BASE_URL}api/crop/geo-location`,
//             {
//               latitude: location.coords.latitude,
//               longitude: location.coords.longitude,
//               taskId: currentCrop.id,
//             },
//             {
//               headers: {
//                 Authorization: `Bearer ${token}`,
//               },
//             }
//           );

//           console.log(response.data);

//         } else {
//           Alert.alert(
//             'Permission Denied',
//             'Location access is required to fetch weather data for your current location. You can search for a location manually.',
//             [{ text: 'OK' }]
//           );
//         }
//       } catch (error) {
//         console.error('Error getting current location:', error);
//         Alert.alert('Error', 'Unable to fetch current location.');
//         setLoading(false);
//       }
//     };

//   if (loading) {
//     return (
//       <View className="flex-1 justify-center items-center">
//         <ActivityIndicator size="large" color="#00ff00" />
//       </View>
//     );
//   }

//   return (
//     <SafeAreaView className="flex-1">
//       <StatusBar style="light" />

//       {isCultivatedLandModalVisible && lastCompletedIndex !== null && (
//         <CultivatedLandModal
//           visible={isCultivatedLandModalVisible}
//           onClose={() => setCultivatedLandModalVisible(false)}
//           cropId={crops[lastCompletedIndex].id}
//           requiredImages={0}
//         />
//       )}

//       <View
//         className="flex-row items-center justify-between"
//         style={{ paddingHorizontal: wp(4), paddingVertical: hp(2) }}
//       >
//         <View>
//           <TouchableOpacity onPress={() => navigation.goBack()}>
//             <Ionicons name="chevron-back-outline" size={30} color="gray" />
//           </TouchableOpacity>
//         </View>
//         <View className="flex-1 items-center">
//           <Text className="text-black text-xl">{cropName}</Text>
//         </View>
//         <View>
//           <TouchableOpacity
//             onPress={() =>
//               navigation.navigate("CropEnrol", {
//                 status: "edit",
//                 onCulscropID: crops[0]?.onCulscropID,
//                 cropId,
//               })
//             }
//           >
//             {crops[0]?.status !== "completed" && (
//               <Ionicons name="pencil" size={20} color="gray" />
//             )}
//           </TouchableOpacity>
//         </View>
//       </View>
//       <ScrollView style={{ marginBottom: 60 }}
//       >
//         {crops.map((crop, index) => (
//           <View
//             key={index}
//             className="flex-1 m-6 shadow border-gray-200 border-[1px] rounded-[15px]"
//           >
//             <View className="flex-row">
//               <View>
//                 <Text className="ml-6 text-xl mt-2">
//                   {t("CropCalender.Task")} {crop.taskIndex}
//                 </Text>
//               </View>
//               <View className="flex-1 items-end justify-center">
//                 <TouchableOpacity
//                   className="p-2"
//                   onPress={() => handleCheck(index)}
//                   disabled={
//                     lastCompletedIndex !== null &&
//                     index > lastCompletedIndex + 1
//                   }
//                 >
//                   <AntDesign
//                     name="checkcircle"
//                     size={30}
//                     color={
//                       checked[index]
//                         ? "green"
//                         : lastCompletedIndex !== null &&
//                           index > lastCompletedIndex + 1
//                         ? "#CDCDCD"
//                         : "#3b3b3b"
//                     }
//                   />
//                 </TouchableOpacity>
//               </View>
//             </View>
//             <Text className="mt-3 ml-6">{crop.startingDate}</Text>
//             <Text className="m-6">
//               {language === "si"
//                 ? crop.taskDescriptionSinhala
//                 : language === "ta"
//                 ? crop.taskDescriptionTamil
//                 : crop.taskDescriptionEnglish}
//             </Text>
//             {crop.imageLink && (
//               <TouchableOpacity
//                 onPress={() =>
//                   crop.imageLink && Linking.openURL(crop.imageLink)
//                 }
//               >
//                 <View className="flex rounded-lgitems-center m-4 rounded-xl bg-black  ">
//                   <Text className="text-white p-3 text-center">
//                     {t("CropCalender.viewImage")}
//                   </Text>
//                 </View>
//               </TouchableOpacity>
//             )}
//             {crop.videoLink && (
//               <TouchableOpacity
//                 onPress={() =>
//                   crop.videoLink && Linking.openURL(crop.videoLink)
//                 }
//               >
//                 <View className="flex rounded-lgitems-center m-4 -mt-2 rounded-xl bg-black  ">
//                   <Text className="text-white p-3 text-center">
//                     {t("CropCalender.viewVideo")}
//                   </Text>
//                 </View>
//               </TouchableOpacity>
//             )}
//           </View>
//         ))}
//           <TouchableOpacity
//             className="py-2 pb-8 px-4 flex-row items-center justify-center"
//             onPress={loadMorePosts}
//           >
//             <Text className="text-black font-bold">
//               {t("PublicForum.viewMore")}
//             </Text>
//           </TouchableOpacity>
//       </ScrollView>

//     </SafeAreaView>
//   );
// };

// export default CropCalander;

// import {
//   SafeAreaView,
//   ScrollView,
//   Text,
//   TouchableOpacity,
//   ActivityIndicator,
//   View,
//   Alert,
//   Linking,
//   RefreshControl,
// } from "react-native";
// import React, { useEffect, useState } from "react";
// import { StatusBar } from "expo-status-bar";
// import Ionicons from "react-native-vector-icons/Ionicons";
// import axios from "axios";
// import AntDesign from "react-native-vector-icons/AntDesign";
// import { StackNavigationProp } from "@react-navigation/stack";
// import { RootStackParamList } from "./types";
// import { RouteProp } from "@react-navigation/native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import moment from "moment";
// import { environment } from "@/environment/environment";
// import NavigationBar from "@/Items/NavigationBar";
// import { Dimensions } from "react-native";
// import i18n from "@/i18n/i18n";
// import { useTranslation } from "react-i18next";
// import CultivatedLandModal from "./CultivatedLandModal"; // Replace with the correct path
// import {
//   widthPercentageToDP as wp,
//   heightPercentageToDP as hp,
// } from "react-native-responsive-screen";
// import * as Location from "expo-location";
// import { useFocusEffect } from "@react-navigation/native";

// interface CropItem {
//   id: string;
//   task: string;
//   taskIndex: number;
//   days: number;
//   CropDuration: string;
//   taskDescriptionEnglish: string;
//   taskCategoryEnglish: string;
//   taskDescriptionSinhala: string;
//   taskDescriptionTamil: string;
//   status: string;
//   startingDate: string;
//   createdAt: string;
//   onCulscropID: number;
//   imageLink: string;
//   videoLink: string;
//   reqImages: number;
//   reqGeo: number;
// }

// type CropCalanderProp = RouteProp<RootStackParamList, "CropCalander">;

// type CropCalendarNavigationProp = StackNavigationProp<
//   RootStackParamList,
//   "CropCalander"
// >;

// interface CropCalendarProps {
//   navigation: CropCalendarNavigationProp;
//   route: CropCalanderProp;
// }

// const CropCalander: React.FC<CropCalendarProps> = ({ navigation, route }) => {
//   const [crops, setCrops] = useState<CropItem[]>([]);
//   const [checked, setChecked] = useState<boolean[]>([]);
//   const [timestamps, setTimestamps] = useState<string[]>([]);
//   const [language, setLanguage] = useState("en");
//   const { cropId, cropName } = route.params;
//   const { t } = useTranslation();
//   const [updateerror, setUpdateError] = useState<string>("");
//   const [lastCompletedIndex, setLastCompletedIndex] = useState<number | null>(
//     null
//   );
//   const [loading, setLoading] = useState<boolean>(true);
//   const [isCultivatedLandModalVisible, setCultivatedLandModalVisible] =
//     useState(false);
//   const [isImageUpload, setImageUpload] = useState(false);
//   const [isCompleted, setCompleted] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);
//   const [refloading, setRefLoading] = useState(false);
//   const [hasMore, setHasMore] = useState(true);
//   const [page, setPage] = useState(1);
//   const [startIndex, setStartIndex] = useState(0);
//   const tasksPerPage = 5;

//   const loadLanguage = async () => {
//     const storedLanguage = await AsyncStorage.getItem("@user_language");
//     if (storedLanguage) {
//       setLanguage(storedLanguage);
//       i18n.changeLanguage(storedLanguage);
//     }
//   };

//   const fetchCrops = async () => {
//     try {
//       setLanguage(t("CropCalender.LNG"));
//       const token = await AsyncStorage.getItem("userToken");

//       const response = await axios.get(
//         `${environment.API_BASE_URL}api/crop/slave-crop-calendar/${cropId}`,
//         {
//           params: { limit: 10 },
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       const formattedCrops = response.data.map((crop: CropItem) => ({
//         ...crop,
//         startingDate: moment(crop.startingDate).format("YYYY-MM-DD"),
//         createdAt: moment(crop.createdAt).format("YYYY-MM-DD"),
//       }));

//       setCrops(formattedCrops); // Overwrite crops instead of appending

//       const newCheckedStates = formattedCrops.map(
//         (crop: CropItem) => crop.status === "completed"
//       );
//       setChecked(newCheckedStates);
//       setHasMore(formattedCrops.length === 10);

//       // Set last completed index
//       const lastCompletedTaskIndex = newCheckedStates.lastIndexOf(true);
//       setLastCompletedIndex(lastCompletedTaskIndex);

//       setTimestamps(new Array(response.data.length).fill(""));
//       setLoading(false);
//     } catch (error) {
//       // Handle error
//       Alert.alert(t("Main.error"), t("Main.somethingWentWrong"));
//       setLoading(false);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useFocusEffect(
//     React.useCallback(() => {
//       setCrops([]);
//       fetchCrops();
//     }, [cropId])
//   );

//   const viewNextTasks = () => {
//     if (startIndex + tasksPerPage < crops.length) {
//       setStartIndex(startIndex + tasksPerPage);
//     }
//   };

//   const viewPreviousTasks = () => {
//     if (startIndex - tasksPerPage >= 0) {
//       setStartIndex(startIndex - tasksPerPage);
//     }
//   };

//   const currentTasks = crops.slice(startIndex, startIndex + tasksPerPage);

//   const handleCheck = async (i: number) => {
//     // Calculate the global index in the `crops` array
//     const globalIndex = startIndex + i;
//     const currentCrop = crops[globalIndex];
//     const PreviousCrop = crops[globalIndex - 1];

//     // Ensure the previous task is completed before marking the current one
//     if (globalIndex > 0 && !checked[globalIndex - 1]) {
//       return;
//     }

//     // Determine the new status of the task
//     const newStatus = checked[globalIndex] ? "pending" : "completed";

//     let updateMessage = "";

//     // Calculate remaining days and updateMessage logic
//     if (PreviousCrop && currentCrop) {
//       const PreviousCropDate = new Date(PreviousCrop.createdAt);
//       const TaskDays = currentCrop.days;
//       const CurrentDate = new Date();
//       const nextCropUpdate = new Date(
//         PreviousCropDate.getTime() + TaskDays * 24 * 60 * 60 * 1000
//       );
//       const remainingTime = nextCropUpdate.getTime() - CurrentDate.getTime();
//       const remainingDays = Math.ceil(remainingTime / (24 * 60 * 60 * 1000));

//       if (remainingDays > 0 && language === "si") {
//         updateMessage = `${t("CropCalender.YouHave")} ${t(
//           "CropCalender.daysRemaining",
//           {
//             date: remainingDays,
//           }
//         )}`;
//       } else {
//         updateMessage = t("CropCalender.overDue");
//       }

//       if (!updateMessage) {
//         updateMessage = `${t("CropCalender.YouHave")} ${remainingDays} ${t(
//           "CropCalender.daysRemaining"
//         )}`;
//       }

//       setUpdateError(updateMessage); // Set the error message here
//     } else {
//       // If the previous crop or current crop is not available, set a default error message
//       updateMessage = t("CropCalender.noCropData");
//       setUpdateError(updateMessage);
//     }

//     try {
//       const token = await AsyncStorage.getItem("userToken");

//       // Update the status in the backend
//       await axios.post(
//         `${environment.API_BASE_URL}api/crop/update-slave`,
//         {
//           id: currentCrop.id,
//           status: newStatus,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       // Update the local `checked` state
//       const updatedChecked = [...checked];
//       updatedChecked[globalIndex] = !updatedChecked[globalIndex];
//       setChecked(updatedChecked);

//       // Update the timestamps for completed tasks
//       const updatedTimestamps = [...timestamps];
//       if (updatedChecked[globalIndex]) {
//         const now = moment().toISOString();
//         updatedTimestamps[globalIndex] = now;
//         setTimestamps(updatedTimestamps);

//         // Save timestamp to AsyncStorage
//         await AsyncStorage.setItem(`taskTimestamp_${globalIndex}`, now);
//       } else {
//         updatedTimestamps[globalIndex] = "";
//         setTimestamps(updatedTimestamps);

//         // Remove timestamp from AsyncStorage
//         await AsyncStorage.removeItem(`taskTimestamp_${globalIndex}`);
//       }

//       // Update the `lastCompletedIndex` state
//       const newLastCompletedIndex = updatedChecked.lastIndexOf(true);
//       setLastCompletedIndex(newLastCompletedIndex);

//       // Show success alert
//       Alert.alert(
//         t("CropCalender.success"),
//         t("CropCalender.taskUpdated", {
//           task: globalIndex + 1,
//           status: t(`CropCalender.status.${newStatus}`),
//         })
//       );

//       // If the task requires geo-location, handle it
//       if (currentCrop.reqGeo === 1 && newStatus === "completed") {
//         await handleLocationIconPress(currentCrop);
//       }

//       // Show the cultivated land modal if the task requires images
//       if (updatedChecked[globalIndex] && currentCrop.reqImages > 0) {
//         setCultivatedLandModalVisible(true);
//       }
//     } catch (error: any) {
//       if (
//         error.response &&
//         error.response.data.message.includes(
//           "You cannot change the status back to pending after 1 hour"
//         )
//       ) {
//         Alert.alert(
//           t("CropCalender.sorry"),
//           t("CropCalender.cannotChangeStatus")
//         );
//       } else if (
//         error.response &&
//         error.response.data.message.includes("You need to wait 6 hours")
//       ) {
//         Alert.alert(t("CropCalender.sorry"), updateMessage); // Show the updateMessage here
//       } else {
//         Alert.alert(t("CropCalender.sorry"), updateMessage); // Show the updateMessage here
//       }
//     }
//   };

//   useEffect(() => {
//     const loadTimestamps = async () => {
//       const loadedTimestamps = [];
//       for (let i = 0; i < crops.length; i++) {
//         const timestamp = await AsyncStorage.getItem(`taskTimestamp_${i}`);
//         loadedTimestamps.push(timestamp || "");
//       }
//       setTimestamps(loadedTimestamps);
//     };

//     if (crops.length > 0) {
//       loadTimestamps();
//     }
//   }, [crops]);

//   const handleLocationIconPress = async (currentCrop: CropItem) => {
//     setLoading(true);
//     console.log(currentCrop.id);
//     try {
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       if (status === "granted") {
//         const location = await Location.getCurrentPositionAsync({});

//         // Fetch weather data directly for the current location
//         console.log(location.coords.latitude, location.coords.longitude);
//         setLoading(false);

//         const token = await AsyncStorage.getItem("userToken");
//         const response = await axios.post(
//           `${environment.API_BASE_URL}api/crop/geo-location`,
//           {
//             latitude: location.coords.latitude,
//             longitude: location.coords.longitude,
//             taskId: currentCrop.id,
//           },
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );

//         console.log(response.data);
//       } else {
//         Alert.alert(
//           "Permission Denied",
//           "Location access is required to fetch weather data for your current location. You can search for a location manually.",
//           [{ text: "OK" }]
//         );
//       }
//     } catch (error) {
//       console.error("Error getting current location:", error);
//       Alert.alert("Error", "Unable to fetch current location.");
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <View className="flex-1 justify-center items-center">
//         <ActivityIndicator size="large" color="#00ff00" />
//       </View>
//     );
//   }

//   return (
//     <SafeAreaView className="flex-1">
//       <StatusBar style="light" />

//       {isCultivatedLandModalVisible && lastCompletedIndex !== null && (
//         <CultivatedLandModal
//           visible={isCultivatedLandModalVisible}
//           onClose={() => setCultivatedLandModalVisible(false)}
//           cropId={crops[lastCompletedIndex].id}
//           requiredImages={0}
//         />
//       )}

//       <View
//         className="flex-row items-center justify-between"
//         style={{ paddingHorizontal: wp(4), paddingVertical: hp(2) }}
//       >
//         <View>
//           <TouchableOpacity onPress={() => navigation.goBack()}>
//             <Ionicons name="chevron-back-outline" size={30} color="gray" />
//           </TouchableOpacity>
//         </View>
//         <View className="flex-1 items-center">
//           <Text className="text-black text-xl">{cropName}</Text>
//         </View>
//         <View>
//           <TouchableOpacity
//             onPress={() =>
//               navigation.navigate("CropEnrol", {
//                 status: "edit",
//                 onCulscropID: crops[0]?.onCulscropID,
//                 cropId,
//               })
//             }
//           >
//             {crops[0]?.status !== "completed" && (
//               <Ionicons name="pencil" size={20} color="gray" />
//             )}
//           </TouchableOpacity>
//         </View>
//       </View>
//       <ScrollView style={{ marginBottom: 60 }}>
//         {startIndex > 0 && (
//           <TouchableOpacity
//             className="py-2 px-4 flex-row items-center justify-center"
//             onPress={viewPreviousTasks}
//           >
//             <Text className="text-black font-bold">
//               {t("PublicForum.previous")}
//             </Text>
//           </TouchableOpacity>
//         )}

//         {currentTasks.map((crop, index) => (
//           <View
//             key={index}
//             className="flex-1 m-6 shadow border-gray-200 border-[1px] rounded-[15px]"
//           >
//             <View className="flex-row">
//               <View>
//                 <Text className="ml-6 text-xl mt-2">
//                   {t("CropCalender.Task")} {crop.taskIndex}
//                 </Text>
//               </View>
//               <View className="flex-1 items-end justify-center">
//                 <TouchableOpacity
//                   className="p-2"
//                   onPress={() => handleCheck(index)}
//                   disabled={
//                     lastCompletedIndex !== null &&
//                     startIndex + index > lastCompletedIndex + 1
//                   }
//                 >
//                   <AntDesign
//                     name="checkcircle"
//                     size={30}
//                     color={
//                       checked[startIndex + index]
//                         ? "#008000"
//                         : lastCompletedIndex !== null &&
//                           startIndex + index === lastCompletedIndex + 1
//                         ? "#000000"
//                         : "#CDCDCD"
//                     }
//                   />
//                 </TouchableOpacity>
//               </View>
//             </View>
//             <Text className="mt-3 ml-6">{crop.startingDate}</Text>
//             <Text className="m-6">
//               {language === "si"
//                 ? crop.taskDescriptionSinhala
//                 : language === "ta"
//                 ? crop.taskDescriptionTamil
//                 : crop.taskDescriptionEnglish}
//             </Text>
//             {crop.imageLink && (
//               <TouchableOpacity
//                 onPress={() =>
//                   crop.imageLink && Linking.openURL(crop.imageLink)
//                 }
//               >
//                 <View className="flex rounded-lgitems-center m-4 rounded-xl bg-black  ">
//                   <Text className="text-white p-3 text-center">
//                     {t("CropCalender.viewImage")}
//                   </Text>
//                 </View>
//               </TouchableOpacity>
//             )}
//             {crop.videoLink && (
//               <TouchableOpacity
//                 onPress={() =>
//                   crop.videoLink && Linking.openURL(crop.videoLink)
//                 }
//               >
//                 <View className="flex rounded-lgitems-center m-4 -mt-2 rounded-xl bg-black  ">
//                   <Text className="text-white p-3 text-center">
//                     {t("CropCalender.viewVideo")}
//                   </Text>
//                 </View>
//               </TouchableOpacity>
//             )}
//           </View>
//         ))}

//         {startIndex + tasksPerPage < crops.length && (
//           <TouchableOpacity
//             className="py-2 pb-8 px-4 flex-row items-center justify-center"
//             onPress={viewNextTasks}
//           >
//             <Text className="text-black font-bold">
//               {t("PublicForum.viewMore")}
//             </Text>
//           </TouchableOpacity>
//         )}
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// export default CropCalander;

import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  View,
  Alert,
  Linking,
  RefreshControl,
  Platform,
} from "react-native";
import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import Ionicons from "react-native-vector-icons/Ionicons";
import axios from "axios";
import AntDesign from "react-native-vector-icons/AntDesign";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "./types";
import { RouteProp } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";
import { environment } from "@/environment/environment";
import NavigationBar from "@/Items/NavigationBar";
import { Dimensions } from "react-native";
import i18n from "@/i18n/i18n";
import { useTranslation } from "react-i18next";
import CultivatedLandModal from "./CultivatedLandModal"; // Replace with the correct path
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import * as Location from "expo-location";
import { useFocusEffect } from "@react-navigation/native";
import ContentLoader, { Rect, Circle } from "react-content-loader/native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

interface CropItem {
  id: string;
  task: string;
  taskIndex: number;
  days: number;
  CropDuration: string;
  taskDescriptionEnglish: string;
  taskCategoryEnglish: string;
  taskDescriptionSinhala: string;
  taskDescriptionTamil: string;
  status: string;
  startingDate: string;
  createdAt: string;
  onCulscropID: number;
  imageLink: string;
  videoLinkEnglish: string;
  videoLinkSinhala: string;
  videoLinkTamil: string;
  reqImages: number;
  reqGeo: number;
}

type CropCalanderProp = RouteProp<RootStackParamList, "CropCalander">;

type CropCalendarNavigationProp = StackNavigationProp<
  RootStackParamList,
  "CropCalander"
>;

interface CropCalendarProps {
  navigation: CropCalendarNavigationProp;
  route: CropCalanderProp;
}

const CropCalander: React.FC<CropCalendarProps> = ({ navigation, route }) => {
  const [crops, setCrops] = useState<CropItem[]>([]);
  const [checked, setChecked] = useState<boolean[]>([]);
  const [timestamps, setTimestamps] = useState<string[]>([]);
  const [language, setLanguage] = useState("en");
  const { cropId, cropName } = route.params;
  const { t } = useTranslation();
  const [updateerror, setUpdateError] = useState<string>("");
  const [lastCompletedIndex, setLastCompletedIndex] = useState<number | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [isCultivatedLandModalVisible, setCultivatedLandModalVisible] =
    useState(false);
  const [isImageUpload, setImageUpload] = useState(false);
  const [isCompleted, setCompleted] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [refloading, setRefLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [startIndex, setStartIndex] = useState(0);
  const tasksPerPage = 5;

  const loadLanguage = async () => {
    const storedLanguage = await AsyncStorage.getItem("@user_language");
    if (storedLanguage) {
      setLanguage(storedLanguage);
      i18n.changeLanguage(storedLanguage);
    }
  };

  const fetchCrops = async () => {
    setLoading(true);
    try {
      setLanguage(t("CropCalender.LNG"));
      const token = await AsyncStorage.getItem("userToken");

      const response = await axios.get(
        `${environment.API_BASE_URL}api/crop/slave-crop-calendar/${cropId}`,
        {
          params: { limit: 10 },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const formattedCrops = response.data.map((crop: CropItem) => ({
        ...crop,
        startingDate: moment(crop.startingDate).format("YYYY-MM-DD"),
        createdAt: moment(crop.createdAt).format("YYYY-MM-DD"),
      }));

      setCrops(formattedCrops);
      const newCheckedStates = formattedCrops.map(
        (crop: CropItem) => crop.status === "completed"
      );
      setChecked(newCheckedStates);
      setHasMore(formattedCrops.length === 10);

      const lastCompletedTaskIndex = newCheckedStates.lastIndexOf(true);
      setLastCompletedIndex(lastCompletedTaskIndex);

      setTimestamps(new Array(response.data.length).fill(""));

      setTimeout(() => {
        setLoading(false);
      }, 300);
    } catch (error) {
      Alert.alert(t("Main.error"), t("Main.somethingWentWrong"));
      setTimeout(() => {
        setLoading(false);
      }, 300);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const navigateToNextIncompleteTask = () => {
        const firstIncompleteIndex = checked.findIndex((status) => !status);
        if (firstIncompleteIndex !== -1) {
          const newStartIndex =
            Math.floor(firstIncompleteIndex / tasksPerPage) * tasksPerPage;
          setStartIndex(newStartIndex);
        } else {
          setStartIndex(0);
        }
      };

      setCrops([]);
      loadLanguage();
      fetchCrops().then(() => navigateToNextIncompleteTask());
    }, [cropId])
  );

  const viewNextTasks = () => {
    if (startIndex + tasksPerPage < crops.length) {
      setStartIndex(startIndex + tasksPerPage);
    }
  };

  const viewPreviousTasks = () => {
    if (startIndex - tasksPerPage >= 0) {
      setStartIndex(startIndex - tasksPerPage);
    }
  };

  const currentTasks = crops.slice(startIndex, startIndex + tasksPerPage);

  const handleCheck = async (i: number) => {
    const globalIndex = startIndex + i;
    const currentCrop = crops[globalIndex];
    const PreviousCrop = crops[globalIndex - 1];

    if (globalIndex > 0 && !checked[globalIndex - 1]) {
      return;
    }

    const newStatus = checked[globalIndex] ? "pending" : "completed";

    let updateMessage = "";

    if (PreviousCrop && currentCrop) {
      const PreviousCropDate = new Date(PreviousCrop.createdAt);
      const TaskDays = currentCrop.days;
      const CurrentDate = new Date();
      const nextCropUpdate = new Date(
        PreviousCropDate.getTime() + TaskDays * 24 * 60 * 60 * 1000
      );

      const nextCropUpdate2 = new Date(
        CurrentDate.getTime() + TaskDays * 24 * 60 * 60 * 1000
      );

      if (PreviousCrop) {
        const data = {
          taskID: globalIndex + 1,
          date: nextCropUpdate.toISOString(),
        };
        await AsyncStorage.setItem("nextCropUpdate", JSON.stringify(data));
      } else {
        const data = {
          taskID: globalIndex + 1,
          date: nextCropUpdate2.toISOString(),
        };
        await AsyncStorage.setItem("nextCropUpdate", JSON.stringify(data));
      }

      const remainingTime = nextCropUpdate.getTime() - CurrentDate.getTime();
      const remainingDays = Math.ceil(remainingTime / (24 * 60 * 60 * 1000));

      if (remainingDays > 0 && language === "si") {
        updateMessage = `${t("CropCalender.YouHave")} ${t(
          "CropCalender.daysRemaining",
          {
            date: remainingDays,
          }
        )}`;
      }
      // else {
      //   updateMessage = t("CropCalender.overDue");
      // }

      if (!updateMessage) {
        updateMessage = `${t("CropCalender.YouHave")} ${t(
          "CropCalender.daysRemaining",
          {
            date: remainingDays,
          }
        )}`;
      }

      setUpdateError(updateMessage);
    } else {
      updateMessage = t("CropCalender.noCropData");
      setUpdateError(updateMessage);
    }

    try {
      const token = await AsyncStorage.getItem("userToken");
      await axios.post(
        `${environment.API_BASE_URL}api/crop/update-slave`,
        {
          id: currentCrop.id,
          status: newStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedChecked = [...checked];
      updatedChecked[globalIndex] = !updatedChecked[globalIndex];
      setChecked(updatedChecked);

      const updatedTimestamps = [...timestamps];
      if (updatedChecked[globalIndex]) {
        const now = moment().toISOString();
        updatedTimestamps[globalIndex] = now;
        setTimestamps(updatedTimestamps);

        await AsyncStorage.setItem(`taskTimestamp_${globalIndex}`, now);
      } else {
        updatedTimestamps[globalIndex] = "";
        setTimestamps(updatedTimestamps);

        await AsyncStorage.removeItem(`taskTimestamp_${globalIndex}`);
      }

      const newLastCompletedIndex = updatedChecked.lastIndexOf(true);
      setLastCompletedIndex(newLastCompletedIndex);

      Alert.alert(
        t("CropCalender.success"),
        t("CropCalender.taskUpdated", {
          task: globalIndex + 1,
          status: t(`CropCalender.status.${newStatus}`),
        })
      );
      registerForPushNotificationsAsync();
      await scheduleDailyNotification();

      if (currentCrop.reqGeo === 1 && newStatus === "completed") {
        await handleLocationIconPress(currentCrop);
      }

      if (updatedChecked[globalIndex] && currentCrop.reqImages > 0) {
        setCultivatedLandModalVisible(true);
      }
    } catch (error: any) {
      if (
        error.response &&
        error.response.data.message.includes(
          "You cannot change the status back to pending after 1 hour"
        )
      ) {
        Alert.alert(
          t("CropCalender.sorry"),
          t("CropCalender.cannotChangeStatus")
        );
      } else if (
        error.response &&
        error.response.data.message.includes("You need to wait 6 hours")
      ) {
        Alert.alert(t("CropCalender.sorry"), updateMessage);
      } else {
        Alert.alert(t("CropCalender.sorry"), updateMessage);
      }
    }
  };

  async function askForPermissions() {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  }

  async function scheduleDailyNotification() {
    try {
      const hasPermission = await askForPermissions();
      if (!hasPermission) {
        console.error("Notification permission not granted");
        return;
      }

      const storedData = await AsyncStorage.getItem("nextCropUpdate");
      if (storedData) {
        const asy = JSON.parse(storedData);
        console.log(asy);
        const nextCropDate = new Date(asy.date);

        const trigger = new Date(asy.date);
        console.log(trigger.getDate());
        const taskId = asy.taskID;
        console.log(taskId);

        if (trigger <= new Date()) {
          trigger.setDate(trigger.getDate() + 1);
        }

        if (nextCropDate > trigger) {
          trigger.setTime(nextCropDate.getTime());
        }

        const result = await Notifications.scheduleNotificationAsync({
          content: {
            title: `${t("Notification.Reminder")}`,
            body: `${t("Notification.CompleteMsg", {
              task: taskId,
            })}`,
            sound: true,
          },
          trigger: {
            month: trigger.getMonth(),
            day: trigger.getDate(),
            hour: 8,
            minute: 0,
            repeats: true,
          },
        });

        if (result) {
          console.log("Notification scheduled successfully!", result);
        } else {
          console.error("Failed to schedule notification.");
        }
      } else {
        console.error("No next crop update found in storage");
      }
    } catch (error) {
      console.error("Error scheduling notification:", error);
    }
  }

  async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        alert("Failed to get push token for push notification!");
        return;
      }
      // Learn more about projectId:
      // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid

      if (Constants.easConfig?.projectId) {
        token = (
          await Notifications.getExpoPushTokenAsync({
            projectId: Constants.easConfig.projectId, // you can hard code project id if you dont want to use expo Constants
          })
        ).data;
        console.log(token);
      }
    } else {
      alert("Must use physical device for Push Notifications");
    }

    return token;
  }

  useEffect(() => {
    const loadTimestamps = async () => {
      const loadedTimestamps = [];
      for (let i = 0; i < crops.length; i++) {
        const timestamp = await AsyncStorage.getItem(`taskTimestamp_${i}`);
        loadedTimestamps.push(timestamp || "");
      }
      setTimestamps(loadedTimestamps);
    };

    if (crops.length > 0) {
      loadTimestamps();
    }
  }, [crops]);

  const handleLocationIconPress = async (currentCrop: CropItem) => {
    setLoading(true);
    console.log(`Processing crop with ID: ${currentCrop.id}`);

    const maxRetries = 3; // Maximum retry attempts
    const delayBetweenRetries = 2000; // Delay in milliseconds between retries

    // Utility function to introduce delay
    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    // Function to fetch the location with retries
    const getLocationWithRetry = async (
      retries: number
    ): Promise<Location.LocationObject | null> => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          throw new Error("Location permission denied");
        }

        const location = await Location.getCurrentPositionAsync({});
        console.log("Location retrieved:", location.coords);
        return location;
      } catch (error) {
        console.error(`Attempt failed. Retries left: ${retries}`, error);

        if (retries > 0) {
          await delay(delayBetweenRetries); // Wait before retrying
          return getLocationWithRetry(retries - 1); // Retry recursively
        } else {
          return null; // Return null if all retries fail
        }
      }
    };

    try {
      const location = await getLocationWithRetry(maxRetries);

      if (!location) {
        Alert.alert(
          "Error",
          "Unable to fetch location after multiple attempts. Please try again later."
        );
        setLoading(false);
        return;
      }

      const token = await AsyncStorage.getItem("userToken");
      const response = await axios.post(
        `${environment.API_BASE_URL}api/crop/geo-location`,
        {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          taskId: currentCrop.id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Server response:", response.data);
    } catch (error) {
      console.error("Error processing location data:", error);
    } finally {
      setLoading(false);
    }
  };

  const SkeletonLoader = () => {
    const rectHeight = hp("30%");
    const gap = hp("4%");

    return (
      <View style={{ marginTop: hp("2%"), paddingHorizontal: wp("5%") }}>
        <ContentLoader
          speed={2}
          width={wp("100%")}
          height={hp("150%")}
          viewBox={`0 0 ${wp("100%")} ${hp("150%")}`}
          backgroundColor="#ececec"
          foregroundColor="#fafafa"
        >
          {Array.from({ length: 3 }).map((_, index) => (
            <Rect
              key={`rect-${index}`} // Ensure key is unique
              x="0"
              y={index * (rectHeight + gap)} // Add gap to vertical position
              rx="12"
              ry="20"
              width={wp("90%")}
              height={rectHeight} // Maintain rectangle height
            />
          ))}
        </ContentLoader>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1">
      <StatusBar style="light" />

      {isCultivatedLandModalVisible && lastCompletedIndex !== null && (
        <CultivatedLandModal
          visible={isCultivatedLandModalVisible}
          onClose={() => setCultivatedLandModalVisible(false)}
          cropId={crops[lastCompletedIndex].id}
          requiredImages={0}
        />
      )}

      <View
        className="flex-row items-center justify-between"
        style={{ paddingHorizontal: wp(4), paddingVertical: hp(2) }}
      >
        <View>
          <TouchableOpacity onPress={() => navigation.navigate("MyCrop")}>
            <Ionicons name="chevron-back-outline" size={30} color="gray" />
          </TouchableOpacity>
        </View>
        <View className="flex-1 items-center">
          <Text className="text-black text-xl">{cropName}</Text>
        </View>
        <View>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("CropEnrol", {
                status: "edit",
                onCulscropID: crops[0]?.onCulscropID,
                cropId,
              })
            }
          >
            {crops[0]?.status !== "completed" && (
              <Ionicons name="pencil" size={20} color="gray" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <SkeletonLoader />
      ) : (
        <ScrollView style={{ marginBottom: 60 }}>
          {startIndex > 0 && (
            <TouchableOpacity
              className="py-2 px-4 flex-row items-center justify-center"
              onPress={viewPreviousTasks}
            >
              <Text className="text-black font-bold">
                {t("CropCalender.viewPrevious")}
              </Text>
            </TouchableOpacity>
          )}

          {currentTasks.map((crop, index) => (
            <View
              key={index}
              className="flex-1 m-6 shadow border-gray-200 border-[1px] rounded-[15px]"
            >
              <View className="flex-row">
                <View>
                  <Text className="ml-6 text-xl mt-2">
                    {t("CropCalender.Task")} {crop.taskIndex}
                  </Text>
                </View>
                <View className="flex-1 items-end justify-center">
                  <TouchableOpacity
                    className="p-2"
                    onPress={() => handleCheck(index)}
                    disabled={
                      lastCompletedIndex !== null &&
                      startIndex + index > lastCompletedIndex + 1
                    }
                  >
                    <AntDesign
                      name="checkcircle"
                      size={30}
                      color={
                        checked[startIndex + index]
                          ? "#008000"
                          : lastCompletedIndex !== null &&
                            startIndex + index === lastCompletedIndex + 1
                          ? "#000000"
                          : "#CDCDCD"
                      }
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <Text className="mt-3 ml-6">{crop.startingDate}</Text>
              <Text className="m-6">
                {language === "si"
                  ? crop.taskDescriptionSinhala
                  : language === "ta"
                  ? crop.taskDescriptionTamil
                  : crop.taskDescriptionEnglish}
              </Text>
              {crop.imageLink && (
                <TouchableOpacity
                  onPress={() =>
                    crop.imageLink && Linking.openURL(crop.imageLink)
                  }
                >
                  <View className="flex rounded-lgitems-center m-4 rounded-xl bg-black  ">
                    <Text className="text-white p-3 text-center">
                      {t("CropCalender.viewImage")}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              {crop.videoLinkEnglish &&
                crop.videoLinkSinhala &&
                crop.videoLinkTamil && (
                  <TouchableOpacity
                    onPress={() => {
                      if (language === "en" && crop.videoLinkEnglish) {
                        Linking.openURL(crop.videoLinkEnglish);
                      } else if (language === "si" && crop.videoLinkSinhala) {
                        Linking.openURL(crop.videoLinkSinhala);
                      } else if (language === "ta" && crop.videoLinkTamil) {
                        Linking.openURL(crop.videoLinkTamil);
                      }
                    }}
                  >
                    <View className="flex rounded-lg items-center m-4 -mt-2 rounded-xl bg-black">
                      <Text className="text-white p-3 text-center">
                        {t("CropCalender.viewVideo")}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
            </View>
          ))}

          {startIndex + tasksPerPage < crops.length && (
            <TouchableOpacity
              className="py-2 pb-8 px-4 flex-row items-center justify-center"
              onPress={viewNextTasks}
            >
              <Text className="text-black font-bold">
                {t("CropCalender.viewMore")}
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default CropCalander;
