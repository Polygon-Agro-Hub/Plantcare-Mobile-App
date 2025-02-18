// import {
//   SafeAreaView,
//   ScrollView,
//   Text,
//   TouchableOpacity,
//   View,
//   Alert,
//   Linking,
//   Platform,
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
// import i18n from "@/i18n/i18n";
// import { useTranslation } from "react-i18next";
// import CultivatedLandModal from "./CultivatedLandModal";
// import {
//   widthPercentageToDP as wp,
//   heightPercentageToDP as hp,
// } from "react-native-responsive-screen";
// import * as Location from "expo-location";
// import { useFocusEffect } from "@react-navigation/native";
// import ContentLoader, { Rect, Circle } from "react-content-loader/native";
// import * as Notifications from "expo-notifications";
// import * as Device from "expo-device";
// import Constants from "expo-constants";
// import * as ScreenCapture from "expo-screen-capture";

// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: false,
//     shouldSetBadge: false,
//   }),
// });

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
//   videoLinkEnglish: string;
//   videoLinkSinhala: string;
//   videoLinkTamil: string;
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
//   const [showediticon, setShowEditIcon] = useState(false);
//   const tasksPerPage = 5;

//   useFocusEffect(
//     React.useCallback(() => {
//       const disableScreenCapture = async () => {
//         await ScreenCapture.preventScreenCaptureAsync();
//       };

//       const enableScreenCapture = async () => {
//         await ScreenCapture.allowScreenCaptureAsync();
//       };

//       disableScreenCapture(); // Disable screenshots when this screen is in focus

//       return () => {
//         enableScreenCapture(); // Re-enable screenshots when leaving this screen
//       };
//     }, [])
//   );

//     useFocusEffect(
//       React.useCallback(() => {
//         return () => {
//           setCultivatedLandModalVisible(false);
//         };
//       }, [])
//     );

//   const loadLanguage = async () => {
//     const storedLanguage = await AsyncStorage.getItem("@user_language");
//     if (storedLanguage) {
//       setLanguage(storedLanguage);
//       i18n.changeLanguage(storedLanguage);
//     }
//   };

//   const fetchCrops = async () => {
//     setLoading(true);
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

//       if (formattedCrops[0]?.status === "completed") {
//         setShowEditIcon(false);
//       } else {
//         setShowEditIcon(true);
//       }

//       setCrops(formattedCrops);
//       const newCheckedStates = formattedCrops.map(
//         (crop: CropItem) => crop.status === "completed"
//       );
//       setChecked(newCheckedStates);
//       setHasMore(formattedCrops.length === 10);

//       const lastCompletedTaskIndex = newCheckedStates.lastIndexOf(true);
//       setLastCompletedIndex(lastCompletedTaskIndex);

//       setTimestamps(new Array(response.data.length).fill(""));

//       setTimeout(() => {
//         setLoading(false);
//       }, 300);
//     } catch (error) {
//       Alert.alert(t("Main.error"), t("Main.somethingWentWrong"));
//       setTimeout(() => {
//         setLoading(false);
//       }, 300);
//     } finally {
//       setTimeout(() => {
//         setLoading(false);
//       }, 300);
//     }
//   };

//   useFocusEffect(
//     React.useCallback(() => {
//       const navigateToNextIncompleteTask = () => {
//         const firstIncompleteIndex = checked.findIndex((status) => !status);
//         if (firstIncompleteIndex !== -1) {
//           const newStartIndex =
//             Math.floor(firstIncompleteIndex / tasksPerPage) * tasksPerPage;
//           setStartIndex(newStartIndex);
//         } else {
//           setStartIndex(0);
//         }
//       };

//       setCrops([]);
//       loadLanguage();
//       fetchCrops().then(() => navigateToNextIncompleteTask());
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
//     const globalIndex = startIndex + i;
//     const currentCrop = crops[globalIndex];
//     const PreviousCrop = crops[globalIndex - 1];

//     if (globalIndex > 0 && !checked[globalIndex - 1]) {
//       return;
//     }

//     const newStatus = checked[globalIndex] ? "pending" : "completed";

//     if (newStatus === "pending") {
//       await cancelScheduledNotification();
//     }

//     let updateMessage = "";

//     if (PreviousCrop && currentCrop) {
//       const PreviousCropDate = new Date(PreviousCrop.createdAt);
//       const TaskDays = currentCrop.days;
//       const CurrentDate = new Date();
//       const nextCropUpdate = new Date(
//         PreviousCropDate.getTime() + TaskDays * 24 * 60 * 60 * 1000
//       );

//       const nextCropUpdate2 = new Date(
//         CurrentDate.getTime() + TaskDays * 24 * 60 * 60 * 1000
//       );

//       if (PreviousCrop) {
//         const data = {
//           taskID: globalIndex + 1,
//           date: nextCropUpdate.toISOString(),
//         };
//         await AsyncStorage.setItem("nextCropUpdate", JSON.stringify(data));
//       } else {
//         const data = {
//           taskID: globalIndex + 1,
//           date: nextCropUpdate2.toISOString(),
//         };
//         await AsyncStorage.setItem("nextCropUpdate", JSON.stringify(data));
//       }

//       const remainingTime = nextCropUpdate.getTime() - CurrentDate.getTime();
//       const remainingDays = Math.ceil(remainingTime / (24 * 60 * 60 * 1000));

//       if (remainingDays > 0 && language === "si") {
//         updateMessage = `${t("CropCalender.YouHave")} ${t(
//           "CropCalender.daysRemaining",
//           {
//             date: remainingDays,
//           }
//         )}`;
//       }

//       if (!updateMessage) {
//         updateMessage = `${t("CropCalender.YouHave")} ${t(
//           "CropCalender.daysRemaining",
//           {
//             date: remainingDays,
//           }
//         )}`;
//       }

//       setUpdateError(updateMessage);
//     } else {
//       updateMessage = t("CropCalender.noCropData");
//       setUpdateError(updateMessage);
//     }

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
//       updatedChecked[globalIndex] = !updatedChecked[globalIndex];
//       setChecked(updatedChecked);

//       const updatedTimestamps = [...timestamps];
//       if (updatedChecked[globalIndex]) {
//         const now = moment().toISOString();
//         updatedTimestamps[globalIndex] = now;
//         setTimestamps(updatedTimestamps);

//         await AsyncStorage.setItem(`taskTimestamp_${globalIndex}`, now);
//       } else {
//         updatedTimestamps[globalIndex] = "";
//         setTimestamps(updatedTimestamps);

//         await AsyncStorage.removeItem(`taskTimestamp_${globalIndex}`);
//       }

//       const newLastCompletedIndex = updatedChecked.lastIndexOf(true);
//       setLastCompletedIndex(newLastCompletedIndex);

//       Alert.alert(
//         t("CropCalender.success"),
//         t("CropCalender.taskUpdated", {
//           task: globalIndex + 1,
//           status: t(`CropCalender.status.${newStatus}`),
//         })
//       );

//       if (currentCrop.reqGeo === 1 && newStatus === "completed") {
//         await handleLocationIconPress(currentCrop);
//       }
//       if (newStatus === "completed") {
//         registerForPushNotificationsAsync();
//         await scheduleDailyNotification();
//       }

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
//         Alert.alert(t("CropCalender.sorry"), updateMessage);
//       } else {
//         Alert.alert(t("CropCalender.sorry"), updateMessage);
//       }
//     }
//   };

//   async function askForPermissions() {
//     const { status } = await Notifications.requestPermissionsAsync();
//     return status === "granted";
//   }

//   async function cancelScheduledNotification() {
//     const storedNotificationId = await AsyncStorage.getItem(
//       "currentNotificationId"
//     );
//     if (storedNotificationId) {
//       await Notifications.cancelScheduledNotificationAsync(
//         storedNotificationId
//       );
//       console.log("Scheduled notification canceled.");
//       await AsyncStorage.removeItem("currentNotificationId");
//     } else {
//       console.log("No scheduled notification found.");
//     }
//   }

//   async function scheduleDailyNotification() {
//     try {
//       const hasPermission = await askForPermissions();
//       if (!hasPermission) {
//         console.error("Notification permission not granted");
//         return;
//       }

//       const storedNotificationId = await AsyncStorage.getItem(
//         "currentNotificationId"
//       );

//       // Cancel previous notification if exists
//       if (storedNotificationId) {
//         await Notifications.cancelScheduledNotificationAsync(
//           storedNotificationId
//         );
//         console.log(storedNotificationId);
//         console.log("Previous notification canceled.");
//         await AsyncStorage.removeItem("currentNotificationId");
//       }

//       const storedData = await AsyncStorage.getItem("nextCropUpdate");
//       if (storedData) {
//         const asy = JSON.parse(storedData);
//         const nextCropDate = new Date(asy.date);
//         const trigger = new Date(asy.date);
//         const taskId = asy.taskID;

//         if (trigger <= new Date()) {
//           trigger.setDate(trigger.getDate() + 1);
//         }

//         if (nextCropDate > trigger) {
//           trigger.setTime(nextCropDate.getTime());
//         }

//         const result = await Notifications.scheduleNotificationAsync({
//           content: {
//             title: `${t("Notification.Reminder")}`,
//             body: `${t("Notification.CompleteMsg", {
//               task: taskId,
//             })}`,
//             sound: true,
//           },
//           trigger: {
//             month: trigger.getMonth(),
//             day: trigger.getDate(),
//             hour: 8,
//             minute: 0,
//           },
//         });

//         if (result) {
//           console.log("Notification scheduled successfully!", result);
//           await AsyncStorage.setItem("currentNotificationId", result);
//         } else {
//           console.error("Failed to schedule notification.");
//         }
//       } else {
//         console.error("No next crop update found in storage");
//       }
//     } catch (error) {
//       console.error("Error scheduling notification:", error);
//     }
//   }

//   async function registerForPushNotificationsAsync() {
//     let token;

//     if (Platform.OS === "android") {
//       await Notifications.setNotificationChannelAsync("default", {
//         name: "default",
//         importance: Notifications.AndroidImportance.MAX,
//         vibrationPattern: [0, 250, 250, 250],
//         lightColor: "#FF231F7C",
//       });
//     }

//     if (Device.isDevice) {
//       const { status: existingStatus } =
//         await Notifications.getPermissionsAsync();
//       let finalStatus = existingStatus;
//       if (existingStatus !== "granted") {
//         const { status } = await Notifications.requestPermissionsAsync();
//         finalStatus = status;
//       }
//       if (finalStatus !== "granted") {
//         alert("Failed to get push token for push notification!");
//         return;
//       }

//       if (Constants.easConfig?.projectId) {
//         token = (
//           await Notifications.getExpoPushTokenAsync({
//             projectId: Constants.easConfig.projectId,
//           })
//         ).data;
//         console.log(token);
//       }
//     } else {
//       alert("Must use physical device for Push Notifications");
//     }

//     return token;
//   }

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
//     console.log(`Processing crop with ID: ${currentCrop.id}`);

//     const maxRetries = 3;
//     const delayBetweenRetries = 2000;

//     const delay = (ms: number) =>
//       new Promise((resolve) => setTimeout(resolve, ms));

//     const getLocationWithRetry = async (
//       retries: number
//     ): Promise<Location.LocationObject | null> => {
//       try {
//         const { status } = await Location.requestForegroundPermissionsAsync();
//         if (status !== "granted") {
//           throw new Error("Location permission denied");
//         }

//         const location = await Location.getCurrentPositionAsync({});
//         return location;
//       } catch (error) {
//         console.error(`Attempt failed. Retries left: ${retries}`, error);

//         if (retries > 0) {
//           await delay(delayBetweenRetries);
//           return getLocationWithRetry(retries - 1);
//         } else {
//           return null;
//         }
//       }
//     };

//     try {
//       const location = await getLocationWithRetry(maxRetries);

//       if (!location) {
//         Alert.alert(
//           "Error",
//           "Unable to fetch location after multiple attempts. Please try again later."
//         );
//         setLoading(false);
//         return;
//       }

//       const token = await AsyncStorage.getItem("userToken");
//       const response = await axios.post(
//         `${environment.API_BASE_URL}api/crop/geo-location`,
//         {
//           latitude: location.coords.latitude,
//           longitude: location.coords.longitude,
//           taskId: currentCrop.id,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       console.log("Server response:", response.data);
//     } catch (error) {
//       console.error("Error processing location data:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const SkeletonLoader = () => {
//     const rectHeight = hp("30%");
//     const gap = hp("4%");

//     return (
//       <View style={{ marginTop: hp("2%"), paddingHorizontal: wp("5%") }}>
//         <ContentLoader
//           speed={2}
//           width={wp("100%")}
//           height={hp("150%")}
//           viewBox={`0 0 ${wp("100%")} ${hp("150%")}`}
//           backgroundColor="#ececec"
//           foregroundColor="#fafafa"
//         >
//           {Array.from({ length: 3 }).map((_, index) => (
//             <Rect
//               key={`rect-${index}`}
//               x="0"
//               y={index * (rectHeight + gap)}
//               rx="12"
//               ry="20"
//               width={wp("90%")}
//               height={rectHeight}
//             />
//           ))}
//         </ContentLoader>
//       </View>
//     );
//   };

//   return (
//     <SafeAreaView className="flex-1">
//       <StatusBar style="dark" />

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
//           <TouchableOpacity onPress={() => navigation.navigate("MyCrop")}>
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
//             {/* {crops[0]?.status !== "completed" && (
//               <Ionicons name="pencil" size={20} color="gray" />
//             )} */}

//             {showediticon ? (
//               <Ionicons name="pencil" size={20} color="gray" />
//             ) : null}
//           </TouchableOpacity>
//         </View>
//       </View>

//       {loading ? (
//         <SkeletonLoader />
//       ) : (
//         <ScrollView
//           style={{ marginBottom: 60 }}
//           refreshControl={
//             <RefreshControl
//               refreshing={refreshing}
//               onRefresh={async () => {
//                 setRefLoading(true);
//                 await fetchCrops();
//                 setRefLoading(false);
//               }}
//             />
//           }
//         >
//           {startIndex > 0 && (
//             <TouchableOpacity
//               className="py-2 px-4 flex-row items-center justify-center"
//               onPress={viewPreviousTasks}
//             >
//               <Text className="text-black font-bold">
//                 {t("CropCalender.viewPrevious")}
//               </Text>
//             </TouchableOpacity>
//           )}

//           {currentTasks.map((crop, index) => (
//             <View
//               key={index}
//               className="flex-1 m-6 shadow border-gray-200 border-[1px] rounded-[15px]"
//             >
//               <View className="flex-row">
//                 <View>
//                   <Text className="ml-6 text-xl mt-2">
//                     {t("CropCalender.Task")} {crop.taskIndex}
//                   </Text>
//                 </View>
//                 <View className="flex-1 items-end justify-center">
//                   <TouchableOpacity
//                     className="p-2"
//                     onPress={() => handleCheck(index)}
//                     disabled={
//                       lastCompletedIndex !== null &&
//                       startIndex + index > lastCompletedIndex + 1
//                     }
//                   >
//                     <AntDesign
//                       name="checkcircle"
//                       size={30}
//                       color={
//                         checked[startIndex + index]
//                           ? "#008000"
//                           : lastCompletedIndex !== null &&
//                             startIndex + index === lastCompletedIndex + 1
//                           ? "#000000"
//                           : "#CDCDCD"
//                       }
//                     />
//                   </TouchableOpacity>
//                 </View>
//               </View>
//               <Text className="mt-3 ml-6">{crop.startingDate}</Text>
//               <Text className="m-6">
//                 {language === "si"
//                   ? crop.taskDescriptionSinhala
//                   : language === "ta"
//                   ? crop.taskDescriptionTamil
//                   : crop.taskDescriptionEnglish}
//               </Text>
//               {crop.imageLink && (
//                 <TouchableOpacity
//                   onPress={() =>
//                     crop.imageLink && Linking.openURL(crop.imageLink)
//                   }
//                 >
//                   <View className="flex rounded-lgitems-center m-4 rounded-xl bg-black  ">
//                     <Text className="text-white p-3 text-center">
//                       {t("CropCalender.viewImage")}
//                     </Text>
//                   </View>
//                 </TouchableOpacity>
//               )}
//               {crop.videoLinkEnglish &&
//                 crop.videoLinkSinhala &&
//                 crop.videoLinkTamil && (
//                   <TouchableOpacity
//                     onPress={() => {
//                       if (language === "en" && crop.videoLinkEnglish) {
//                         Linking.openURL(crop.videoLinkEnglish);
//                       } else if (language === "si" && crop.videoLinkSinhala) {
//                         Linking.openURL(crop.videoLinkSinhala);
//                       } else if (language === "ta" && crop.videoLinkTamil) {
//                         Linking.openURL(crop.videoLinkTamil);
//                       }
//                     }}
//                   >
//                     <View className="flex items-center m-4 -mt-2 rounded-xl bg-black">
//                       <Text className="text-white p-3 text-center">
//                         {t("CropCalender.viewVideo")}
//                       </Text>
//                     </View>
//                   </TouchableOpacity>
//                 )}
//             </View>
//           ))}

//           {startIndex + tasksPerPage < crops.length && (
//             <TouchableOpacity
//               className="py-2 pb-8 px-4 flex-row items-center justify-center"
//               onPress={viewNextTasks}
//             >
//               <Text className="text-black font-bold">
//                 {t("CropCalender.viewMore")}
//               </Text>
//             </TouchableOpacity>
//           )}
//         </ScrollView>
//       )}
//     </SafeAreaView>
//   );
// };

// export default CropCalander;



import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Linking,
  Platform,
  RefreshControl,
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
import i18n from "@/i18n/i18n";
import { useTranslation } from "react-i18next";
import CultivatedLandModal from "./CultivatedLandModal";
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
import * as ScreenCapture from "expo-screen-capture";
import { set } from "lodash";

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
  // reqGeo: number;
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
  const [showediticon, setShowEditIcon] = useState(false);
  const [lastCompletedInd, setLastCompletedInd] = useState<number | null>();
  const tasksPerPage = 5;

  useFocusEffect(
    React.useCallback(() => {
      const disableScreenCapture = async () => {
        await ScreenCapture.preventScreenCaptureAsync();
      };

      const enableScreenCapture = async () => {
        await ScreenCapture.allowScreenCaptureAsync();
      };

      disableScreenCapture(); // Disable screenshots when this screen is in focus

      return () => {
        enableScreenCapture(); // Re-enable screenshots when leaving this screen
      };
    }, [])
  );

    useFocusEffect(
      React.useCallback(() => {
        return () => {
          setCultivatedLandModalVisible(false);
        };
      }, [])
    );

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

      if (formattedCrops[0]?.status === "completed") {
        setShowEditIcon(false);
      } else {
        setShowEditIcon(true);
      }

      setCrops(formattedCrops);
      const newCheckedStates = formattedCrops.map(
        (crop: CropItem) => crop.status === "completed"
      );
      setChecked(newCheckedStates);
      setHasMore(formattedCrops.length === 10);

      const lastCompletedTaskIn = formattedCrops
      .filter((crop: { status: string; }) => crop.status === "completed")
      .sort((a: { createdAt: string | number | Date; }, b: { createdAt: string | number | Date; }) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]; // Sort by latest createdAt

    // Get the taskIndex of the last completed task
    const lastCompletedTaskInd = lastCompletedTaskIn?.taskIndex;
     setLastCompletedInd(lastCompletedTaskInd);

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
    await AsyncStorage.removeItem(`uploadCompleted-${currentCrop.id}`)

    if (globalIndex > 0 && !checked[globalIndex - 1]) {
      return;
    }

    const newStatus = checked[globalIndex] ? "pending" : "completed";

    if (newStatus === "pending") {
      await cancelScheduledNotification();
    }

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

      // Alert.alert(
      //   t("CropCalender.success"),
      //   t("CropCalender.taskUpdated", {
      //     task: globalIndex + 1,
      //     status: t(`CropCalender.status.${newStatus}`),
      //   })
      // );

      if (currentCrop.taskIndex === 1 && newStatus === "completed") {
        await handleLocationIconPress(currentCrop);
      }
      // if (newStatus === "completed") {
      //   registerForPushNotificationsAsync();
      //   await scheduleDailyNotification();
      // }
      if (globalIndex < crops.length - 1) {
        if (newStatus === "completed") {
          registerForPushNotificationsAsync();
          await scheduleDailyNotification();
        }
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
  
  // useEffect(() => {
  //   const checkImageUploadCount = async () => {
  //     if (crops.length === 0) {
  //       console.log("No crops to check.");
  //       return;
  //     }
  
  //     const token = await AsyncStorage.getItem("userToken");
  
  //     if (!token) {
  //       console.error("No token found. Cannot proceed.");
  //       return;
  //     }
  
  //     for (let i = 0; i < crops.length; i++) {
  //       const currentCrop = crops[i];        
  //       const requiredImages = currentCrop.reqImages;
  
  //       try {
  //         const response = await axios.get(
  //           `${environment.API_BASE_URL}api/crop/get-uploaded-images-count/${currentCrop.id}`, 
  //           {
  //             headers: {
  //               Authorization: `Bearer ${token}`,
  //             },
  //           }
  //         );
  
  //         const uploadedImages = response.data[0]?.count || 0;  
  //         console.log(`Crop with ID ${currentCrop.id} has ${uploadedImages} uploaded images.`);
  //         console.log(`Crop with ID ${currentCrop.id} requires ${requiredImages} images.`);
    
  //         if (uploadedImages < requiredImages) {
  //           await cancelScheduledNotification();
  //           try {
  //             await axios.post(
  //               `${environment.API_BASE_URL}api/crop/update-slave`,
  //               {
  //                 id: currentCrop.id,
  //                 status: "pending",
  //               },
  //               {
  //                 headers: {
  //                   Authorization: `Bearer ${token}`,
  //                 },
  //               }
  //             );
  //             console.log(`Crop with ID ${currentCrop.id} status set to pending due to incomplete upload.`);
  //           } catch (error) {
  //             console.error("Error setting status to pending", error);
  //           }
  //         }
  //       } catch (error) {
  //         console.error("Error fetching uploaded image count", error);
  //       }
  //     }
  //   };
  
  //   checkImageUploadCount();
  // }, [crops]);  
  
  // useFocusEffect(
  //   React.useCallback(() => {
  //     const checkImageUploadCount = async () => {
  //       console.log(lastCompletedInd)
  //       if (crops.length === 0) {
  //         console.log("No crops to check.");
  //         return;
  //       }
  
  //       const token = await AsyncStorage.getItem("userToken");
  
  //       if (!token) {
  //         console.error("No token found. Cannot proceed.");
  //         return;
  //       }
  
  //       if (lastCompletedInd == null || lastCompletedInd >= crops.length) {
  //         console.error("Invalid or out-of-bounds lastCompletedInd.");
  //         return;
  //       }
  //         const currentCrop = crops[lastCompletedInd];
  //         const requiredImages = currentCrop.reqImages;
  //         console.log("cur", currentCrop.id)
  
  //         try {
  //           const response = await axios.get(
  //             `${environment.API_BASE_URL}api/crop/get-uploaded-images-count/${currentCrop.id}`,
  //             {
  //               headers: {
  //                 Authorization: `Bearer ${token}`,
  //               },
  //             }
  //           );
  
  //           const uploadedImages = response.data[0]?.count || 0;  
  //           if (uploadedImages < requiredImages) {
  //             await cancelScheduledNotification();  // Make sure this function is correctly implemented elsewhere in your code
  
  //             try {
  //               await axios.post(
  //                 `${environment.API_BASE_URL}api/crop/update-slave`,
  //                 {
  //                   id: currentCrop.id,
  //                   status: "pending",
  //                 },
  //                 {
  //                   headers: {
  //                     Authorization: `Bearer ${token}`,
  //                   },
  //                 }
  //               );
  //               console.log(`Crop with ID ${currentCrop.id} status set to pending due to incomplete upload.`);
  //             } catch (error) {
  //               console.error("Error setting status to pending", error);
  //             }
  //           }
  //         } catch (error) {
  //           console.error("Error fetching uploaded image count", error);
  //         }
        
  //     };
  
  //     checkImageUploadCount();
  //   }, [crops, lastCompletedInd]) 
  // );

  useEffect(() => {
    const checkImageUploadCount = async () => {
      if (crops.length === 0) {
        console.log("No crops to check.");
        return;
      }
  
      const token = await AsyncStorage.getItem("userToken");
  
      if (!token) {
        console.error("No token found. Cannot proceed.");
        return;
      }
  
      let lastCompletedCrop = null;
      let lastCompletedCropIndex = -1;
  
      // Loop through the crops and find the last completed crop
      for (let i = 0; i < crops.length; i++) {
        const currentCrop = crops[i];
  
        // Check if the crop's status is completed
        if (currentCrop.status === 'completed') {
          lastCompletedCrop = currentCrop;  // Store the last completed crop
          lastCompletedCropIndex = i;  // Store the index of the last completed crop
        }
      }
  
      // If we found a completed crop, process it
      if (lastCompletedCrop) {
        const requiredImages = lastCompletedCrop.reqImages;
  
        try {
          const response = await axios.get(
            `${environment.API_BASE_URL}api/crop/get-uploaded-images-count/${lastCompletedCrop.id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
  
          const uploadedImages = response.data[0]?.count || 0;
          console.log(`Crop with ID ${lastCompletedCrop.id} has ${uploadedImages} uploaded images.`);
          console.log(`Crop with ID ${lastCompletedCrop.id} requires ${requiredImages} images.`);
  
          if (uploadedImages < requiredImages) {
            await cancelScheduledNotification();
            try {
              await axios.post(
                `${environment.API_BASE_URL}api/crop/update-slave`,
                {
                  id: lastCompletedCrop.id,
                  status: "pending",
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
              console.log(`Crop with ID ${lastCompletedCrop.id} status set to pending due to incomplete upload.`);
            } catch (error) {
              console.error("Error setting status to pending", error);
            }
          }
        } catch (error) {
          console.error("Error fetching uploaded image count", error);
        }
      } else {
        console.log("No completed crops found.");
      }
    };
  
    checkImageUploadCount();
  }, [crops]);
  

  async function askForPermissions() {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  }

  async function cancelScheduledNotification() {
    const storedNotificationId = await AsyncStorage.getItem(
      "currentNotificationId"
    );
    if (storedNotificationId) {
      await Notifications.cancelScheduledNotificationAsync(
        storedNotificationId
      );
      console.log("Scheduled notification canceled.");
      await AsyncStorage.removeItem("currentNotificationId");
    } else {
      console.log("No scheduled notification found.");
    }
  }

  async function scheduleDailyNotification() {
    try {
      const hasPermission = await askForPermissions();
      if (!hasPermission) {
        console.error("Notification permission not granted");
        return;
      }

      const storedNotificationId = await AsyncStorage.getItem(
        "currentNotificationId"
      );

      if (storedNotificationId) {
        await Notifications.cancelScheduledNotificationAsync(
          storedNotificationId
        );
        console.log("Previous notification canceled.");
        await AsyncStorage.removeItem("currentNotificationId");
      }

      const storedData = await AsyncStorage.getItem("nextCropUpdate");
      if (storedData) {
        const asy = JSON.parse(storedData);
        const nextCropDate = new Date(asy.date);
        const trigger = new Date(asy.date);
        const taskId = asy.taskID;

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
          await AsyncStorage.setItem("currentNotificationId", result);
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

      if (Constants.easConfig?.projectId) {
        token = (
          await Notifications.getExpoPushTokenAsync({
            projectId: Constants.easConfig.projectId,
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

    const maxRetries = 3;
    const delayBetweenRetries = 2000;

    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    const getLocationWithRetry = async (
      retries: number
    ): Promise<Location.LocationObject | null> => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          throw new Error("Location permission denied");
        }

        // const location = await Location.getCurrentPositionAsync({});
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High, // High accuracy for the best location
        });
        return location;
      } catch (error) {
        console.error(`Attempt failed. Retries left: ${retries}`, error);

        if (retries > 0) {
          await delay(delayBetweenRetries);
          return getLocationWithRetry(retries - 1);
        } else {
          return null;
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
          onCulscropID: currentCrop.onCulscropID,
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
              key={`rect-${index}`}
              x="0"
              y={index * (rectHeight + gap)}
              rx="12"
              ry="20"
              width={wp("90%")}
              height={rectHeight}
            />
          ))}
        </ContentLoader>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1">
      <StatusBar style="dark" />

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
            {/* {crops[0]?.status !== "completed" && (
              <Ionicons name="pencil" size={20} color="gray" />
            )} */}

            {showediticon ? (
              <Ionicons name="pencil" size={20} color="gray" />
            ) : null}
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <SkeletonLoader />
      ) : (
        <ScrollView
          style={{ marginBottom: 60 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={async () => {
                setRefLoading(true);
                await fetchCrops();
                setRefLoading(false);
              }}
            />
          }
        >
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
                    <View className="flex items-center m-4 -mt-2 rounded-xl bg-black">
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
