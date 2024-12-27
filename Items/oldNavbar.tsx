// import React, { useState, useEffect, useCallback } from 'react';
// import { StackNavigationProp } from '@react-navigation/stack';
// import { RootStackParamList } from '@/component/types';
// import { Image, Text, TouchableOpacity, View, Keyboard  } from 'react-native';
// import { useTranslation } from 'react-i18next';
// import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage for state persistence
// import { useFocusEffect, useNavigationState } from '@react-navigation/native'; // Import navigation state
// import axios, { AxiosError } from 'axios';
// import { environment } from "@/environment/environment";
// interface NavigationbarProps {
//   navigation: StackNavigationProp<RootStackParamList>;
// }

// const NavigationBar: React.FC<NavigationbarProps> = ({ navigation }) => {
//   const { t } = useTranslation();

//   // Add state to track which tab is clicked
//   const [activeTab, setActiveTab] = useState<string>('Dashboard');

//   const [isKeyboardVisible, setKeyboardVisible] = useState<boolean>(false);

//   useEffect(() => {
//     const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
//       setKeyboardVisible(true);
//     });
//     const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
//       setKeyboardVisible(false);
//     });

//     return () => {
//       keyboardDidShowListener.remove();
//       keyboardDidHideListener.remove();
//     };
//   }, []);

//   // Load the active tab from local storage and update based on current screen when the app mounts
//   useEffect(() => {
//     const loadActiveTab = async () => {
//       const storedTab = await AsyncStorage.getItem('activeTab');
//       const currentRoute = navigation.getState().routes[navigation.getState().index].name;

//       // If there's no stored tab or stored tab doesn't match the current route, update it
//       if (!storedTab || storedTab !== currentRoute) {
//         setActiveTab(currentRoute);
//         await AsyncStorage.setItem('activeTab', currentRoute); // Sync activeTab with current route
//       } else {
//         setActiveTab(storedTab); // If stored tab matches current route, use it
//       }
//     };
//     loadActiveTab();
//   }, []);

//   // Ensure the correct tab is active when the screen regains focus
//   useFocusEffect(
//     useCallback(() => {
//       const loadActiveTab = async () => {
//         const currentRoute = navigation.getState().routes[navigation.getState().index].name;
//         setActiveTab(currentRoute);
//         await AsyncStorage.setItem('activeTab', currentRoute); // Sync the tab with current route when screen is focused
//       };
//       loadActiveTab();
//     }, [])
//   );

//   // Function to handle tab change and save to local storage
//   const handleTabPress = async (tabName: string) => {
//     setActiveTab(tabName);
//     await AsyncStorage.setItem('activeTab', tabName);
//     navigation.navigate(tabName as any);
//   };

//   const checkAddressFields = async () => {
//     try {
//       // Retrieve the token from AsyncStorage (or your auth context)
//       const token = await AsyncStorage.getItem("userToken"); // Assuming 'authToken' is the key in AsyncStorage

//       if (!token) {
//         console.error('No authorization token found');
//         return;
//       }

//       // Set the token in the Authorization header
//       const response = await axios.get(`${environment.API_BASE_URL}api/auth/check-address-fields`, {
//         headers: {
//           Authorization: `Bearer ${token}`, // Adding token to the header
//         },
//       });

//       console.log(response.data);

//       // Check the response message and navigate accordingly
//       if (response.data.message === 'Yes') {
//         // If all address fields are filled, navigate to NewCrop
//         console.log("Address is complete, navigating to NewCrop.");
//         navigation.navigate('NewCrop');
//       } else if (response.data.message === 'No') {
//         // If any address field is missing, navigate to LocationDetailsScreen to update address
//         console.log("Address is incomplete, navigating to LocationDetailsScreen.");
//         navigation.navigate('LocationDetailsScreen');
//       } else {
//         // Handle any unexpected responses from the server
//         console.error('Unexpected response:', response.data.message);
//       }
//     } catch (error: unknown) {
//       // Type assertion for AxiosError
//       if (error instanceof AxiosError) {
//         // Handle errors based on the status code
//         if (error.response && error.response.status === 400) {
//           console.log("Address fields are incomplete, redirecting to address page.");
//           navigation.navigate('LocationDetailsScreen'); // Redirect to address page on 400
//         } else {
//           console.error('Error checking address fields:', error);
//         }
//       } else {
//         // Handle other types of errors if necessary
//         console.error('Unexpected error occurred:', error);
//       }
//     }
//   };

//   if (isKeyboardVisible) return null;

//   return (
//     <View className="flex-row justify-around bg-white border-t border-gray-300 shadow-lg">
//       {/* Dashboard Button */}
//       <TouchableOpacity onPress={() => handleTabPress('Dashboard')}>
//         <View className="flex items-center justify-center pt-0.5 pb-2">
//           <Image
//             source={
//               activeTab === 'Dashboard'
//                 ? require('../assets/images/HomeClick.png') // Clicked version
//                 : require('../assets/images/Home.png') // Default version
//             }
//             style={{ width: 48, height: 48 }}
//             resizeMode="contain"
//           />
//           <Text className="text-green-500 mt-0 pt-0">{t('navbar.home')}</Text>
//         </View>
//       </TouchableOpacity>

//            {/* NewCrop Button */}
//         <TouchableOpacity onPress={checkAddressFields}>
//         <View className="flex items-center justify-center pt-2 pb-2 pl-5">
//           <Image
//             source={
//               activeTab === 'NewCrop'
//                 ? require('../assets/images/NewCropClick.png')
//                 : require('../assets/images/New Crop.png')
//             }
//             resizeMode="contain"
//           />
//           <Text className="text-green-500 mt-1">{t('navbar.newcrop')}</Text>
//         </View>
//       </TouchableOpacity>

//       {/* MyCrop Button */}
//       <TouchableOpacity onPress={() => handleTabPress('MyCrop')}>
//         <View className="flex items-center justify-center pt-2 pb-2">
//           <Image
//             source={
//               activeTab === 'MyCrop'
//                 ? require('../assets/images/IrrigationClick.png') // Clicked version
//                 : require('../assets/images/Irrigation.png') // Default version
//             }
//             resizeMode="contain"
//           />
//           <Text className="text-green-500 mt-1">{t('navbar.mycultivation')}</Text>
//         </View>
//       </TouchableOpacity>
//     </View>
//   );
// };

// export default NavigationBar;

import React, { useState, useEffect, useCallback } from "react";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "@/component/types";
import {
  Image,
  Text,
  TouchableOpacity,
  View,
  Keyboard,
  Animated,
} from "react-native";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage for state persistence
import { useFocusEffect, useNavigationState } from "@react-navigation/native"; // Import navigation state
import axios, { AxiosError } from "axios";
import { environment } from "@/environment/environment";

const homeIcon = require("../assets/images/BottomNav/Home.png");
const NewCrop = require("../assets/images/BottomNav/NewCrop.png");
const MyCrop = require("../assets/images/BottomNav/MyCrop.png");

const NavigationBar = ({
  navigation,
  state,
}: {
  navigation: any;
  state: any;
}) => {
  let tabs = [
    { name: "Dashboard", icon: homeIcon, focusedIcon: homeIcon },
    { name: "NewCrop", icon: NewCrop, focusedIcon: NewCrop },
    { name: "MyCrop", icon: MyCrop, focusedIcon: MyCrop },
  ];
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isKeyboardVisible, setKeyboardVisible] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("Dashboard");
  const { t } = useTranslation();
  const [scales] = useState(() => tabs.map(() => new Animated.Value(1)));

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Get the name of the currently focused tab from the state
  let currentTabName = state.routes[state.index]?.name || "Dashboard";
  // console.log('Current tab:', currentTabName);
  if (currentTabName === 'CropCalander') {
    currentTabName = "MyCrop";
  }

  useEffect(() => {
    const loadActiveTab = async () => {
      const storedTab = await AsyncStorage.getItem("activeTab");
      const currentRoute =
        navigation.getState().routes[navigation.getState().index].name;

      // If there's no stored tab or stored tab doesn't match the current route, update it
      if (!storedTab || storedTab !== currentRoute) {
        setActiveTab(currentRoute);
        await AsyncStorage.setItem("activeTab", currentRoute); // Sync activeTab with current route
      } else {
        setActiveTab(storedTab); // If stored tab matches current route, use it
      }
    };
    loadActiveTab();
  }, []);

  // Ensure the correct tab is active when the screen regains focus
  useFocusEffect(
    useCallback(() => {
      const loadActiveTab = async () => {
        const currentRoute =
          navigation.getState().routes[navigation.getState().index].name;
        setActiveTab(currentRoute);
        await AsyncStorage.setItem("activeTab", currentRoute); // Sync the tab with current route when screen is focused
      };
      loadActiveTab();
    }, [])
  );

  // const handleTabPress = async (tabName: string) => {
  //   if (tabName === 'NewCrop') {
  //     await checkAddressFields(); // Call address check function for NewCrop
  //   } else {
  //     setActiveTab(tabName);
  //     await AsyncStorage.setItem('activeTab', tabName);
  //     navigation.navigate(tabName as any);
  //   }
  // };

  const handleTabPress = async (tabName: string, index: number) => {
    if (tabName === 'NewCrop') {
          await checkAddressFields(); 
        } else {
          setActiveTab(tabName);
          await AsyncStorage.setItem('activeTab', tabName);
          navigation.navigate(tabName as any);
        }
    Animated.spring(scales[index], {
      toValue: 1.2,
      useNativeDriver: true,
    }).start(() => {
      Animated.spring(scales[index], {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    });

    navigation.navigate(tabName);
  };

  const checkAddressFields = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken"); 

      if (!token) {
        console.error("No authorization token found");
        return;
      }
      const response = await axios.get(
        `${environment.API_BASE_URL}api/auth/check-address-fields`,
        {
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        }
      );

      console.log(response.data);
      if (response.data.message === "Yes") {
        console.log("Address is complete, navigating to NewCrop.");
        navigation.navigate("NewCrop");
      } else if (response.data.message === "No") {
        console.log(
          "Address is incomplete, navigating to LocationDetailsScreen."
        );
        navigation.navigate("LocationDetailsScreen");
      } else {
        console.error("Unexpected response:", response.data.message);
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        if (error.response && error.response.status === 400) {
          console.log(
            "Address fields are incomplete, redirecting to address page."
          );
          navigation.navigate("LocationDetailsScreen"); 
        } else {
          console.error("Error checking address fields:", error);
        }
      } else {
        console.error("Unexpected error occurred:", error);
      }
    }
  };

  if (isKeyboardVisible) return null;
  return (
    <View className="flex-row  justify-around items-center bg-[#21202B] py-2  rounded-t-3xl w-full ">
      {tabs.map((tab, index) => {
        const isFocused = currentTabName === tab.name;
        return (
          <Animated.View
            style={{
              transform: [{ scale: scales[index] }],
            }}
          >
            <TouchableOpacity
              key={index}
              onPress={() => handleTabPress(tab.name, index)}
              className={`${
                isFocused
                  ? "bg-green-500  p-2 rounded-full -mt-6 border-4 border-[#1A1920] shadow-md"
                  : "items-center justify-center"
              }`}
              style={{
                backgroundColor: isFocused ? "#2AAD7A" : "transparent",
                padding: isFocused ? 8 : 6,
                borderRadius: 50,
                borderWidth: isFocused ? 2 : 0,
                borderColor: "#1A1920",
                shadowColor: isFocused ? "#000" : "transparent",
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: isFocused ? 5 : 0,
              }}
            >
              <Image
                source={tab.icon}
                style={{ width: 28, height: 28, resizeMode: "contain" }}
              />
            </TouchableOpacity>
          </Animated.View>
        );
      })}
    </View>
    // <View className="flex-row justify-around bg-white border-t border-gray-300 shadow-lg">
    //     {/* Dashboard Button */}
    //     <TouchableOpacity onPress={() => handleTabPress('Dashboard')}>
    //       <View className="flex items-center justify-center pt-0.5 pb-2">
    //         <Image
    //           source={
    //             activeTab === 'Dashboard'
    //               ? require('../assets/images/HomeClick.png') // Clicked version
    //               : require('../assets/images/Home.png') // Default version
    //           }
    //           style={{ width: 48, height: 48 }}
    //           resizeMode="contain"
    //         />
    //         <Text className="text-green-500 mt-0 pt-0">{t('navbar.home')}</Text>
    //       </View>
    //     </TouchableOpacity>

    //          {/* NewCrop Button */}
    //       <TouchableOpacity onPress={checkAddressFields}>
    //       <View className="flex items-center justify-center pt-2 pb-2 pl-5">
    //         <Image
    //           source={
    //             activeTab === 'NewCrop'
    //               ? require('../assets/images/NewCropClick.png')
    //               : require('../assets/images/New Crop.png')
    //           }
    //           resizeMode="contain"
    //         />
    //         <Text className="text-green-500 mt-1">{t('navbar.newcrop')}</Text>
    //       </View>
    //     </TouchableOpacity>

    //     {/* MyCrop Button */}
    //     <TouchableOpacity onPress={() => handleTabPress('MyCrop')}>
    //       <View className="flex items-center justify-center pt-2 pb-2">
    //         <Image
    //           source={
    //             activeTab === 'MyCrop'
    //               ? require('../assets/images/IrrigationClick.png') // Clicked version
    //               : require('../assets/images/Irrigation.png') // Default version
    //           }
    //           resizeMode="contain"
    //         />
    //         <Text className="text-green-500 mt-1">{t('navbar.mycultivation')}</Text>
    //       </View>
    //     </TouchableOpacity>
    //   </View>
  );
};

export default NavigationBar;
