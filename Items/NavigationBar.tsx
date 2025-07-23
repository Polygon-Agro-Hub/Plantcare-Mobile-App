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
import AsyncStorage from "@react-native-async-storage/async-storage"; 
import { useFocusEffect, useNavigationState } from "@react-navigation/native"; 
import axios, { AxiosError } from "axios";
import { environment } from "@/environment/environment";
import { useSelector } from "react-redux";
import type { RootState } from "../services/reducxStore";

// Define the user data interface
interface UserData {
  farmCount: number;
  membership: string;
  paymentActiveStatus: string | null;
  role:string
}

const homeIcon = require("../assets/images/BottomNav/Home.webp");
const NewCrop = require("../assets/images/BottomNav/NewCrop.webp");
const MyCrop = require("../assets/images/BottomNav/MyCrop.webp");

const NavigationBar = ({
  navigation,
  state,
}: {
  navigation: any;
  state: any;
}) => {
  // let tabs = [
  //   { name: "Dashboard", icon: homeIcon, focusedIcon: homeIcon },
  //   { name: "AddNewFarmFirst", icon: NewCrop, focusedIcon: NewCrop },
  //   { name: "MyCultivation", icon: MyCrop, focusedIcon: MyCrop },
  // ];
  
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isKeyboardVisible, setKeyboardVisible] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("Dashboard");
  const { t } = useTranslation();
const [scales] = useState(() => new Array(3).fill(new Animated.Value(1)));
  const user = useSelector((state: RootState) => state.user.userData) as UserData | null;
 
  const [tabs, setTabs] = useState<any[]>([]);
  console.log("redux user data", user);

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

  let currentTabName = state.routes[state.index]?.name || "Dashboard";
  if (currentTabName === 'CropCalander') {
    currentTabName = "MyCrop";
  }else if (currentTabName === 'AddFarmList') {
    currentTabName = "AddNewFarmFirst";
  }
 useEffect(() => {
    // Define default tabs for user with roles
    let defaultTabs = [
      { name: "Dashboard", icon: homeIcon, focusedIcon: homeIcon },
      { name: "AddNewFarmFirst", icon: NewCrop, focusedIcon: NewCrop },
      { name: "MyCultivation", icon: MyCrop, focusedIcon: MyCrop },
    ];

    if (!user || !user.role) {
      setTabs([]); // Hide navigation bar if no user role
    } else if (user.role === "Laboror") {
      setTabs([]); // Hide navigation bar if role is Laboror
    } else {
      setTabs(defaultTabs); // Show default tabs if user is valid
    }
  }, [user]); 
  console.log("Current tab name:", currentTabName);
  useEffect(() => {
    const loadActiveTab = async () => {
      const storedTab = await AsyncStorage.getItem("activeTab");
      const currentRoute =
        navigation.getState().routes[navigation.getState().index].name;

      if (!storedTab || storedTab !== currentRoute) {
        setActiveTab(currentRoute);
        await AsyncStorage.setItem("activeTab", currentRoute); 
      } else {
        setActiveTab(storedTab); 
      }
    };
    loadActiveTab();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const loadActiveTab = async () => {
        const currentRoute =
          navigation.getState().routes[navigation.getState().index].name;
        setActiveTab(currentRoute);
        await AsyncStorage.setItem("activeTab", currentRoute); 
      };
      loadActiveTab();
    }, [])
  );

  const handleTabPress = async (tabName: string, index: number) => {
    Animated.spring(scales[index], {
      toValue: 1.1,
      useNativeDriver: true,
    }).start(() => {
      Animated.spring(scales[index], {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    });

    // Handle conditional navigation for the NewCrop tab
    if (tabName === "AddNewFarmFirst") {
      // Check if user data exists and has the required properties
      if (user && (user.membership === "Basic" || user.membership === "Pro") && user.farmCount > 0) {
        console.log
        navigation.navigate("AddFarmList");
      } else {
        navigation.navigate("AddNewFarmFirst");
      }
    } else {
      navigation.navigate(tabName);
    }
  };
 useEffect(() => {
    if (!user) return;

    if (user.role === "Laboror" && currentTabName === "Dashboard") {
      navigation.navigate("LabororDashbord");
    } else if (user.role === "Owner" && currentTabName === "Dashboard") {
      navigation.navigate("Dashboard");
    }
  }, [user, currentTabName, navigation]);
  // if (isKeyboardVisible) return null;
  if (isKeyboardVisible || !tabs.length || (user && user.role === "Laboror")) return null;
  return (
    <View className="absolute bottom-0 flex-row justify-between items-center bg-[#21202B] py-2 px-6 rounded-t-3xl w-full">
      {tabs.map((tab, index) => {
        const isFocused = currentTabName === tab.name;
        return (
          <Animated.View
            style={{
              transform: [{ scale: scales[index] }],
              alignItems: "center",
              justifyContent: "center",
              width: 60,
              height: 40,
            }}
            key={index}
          >
            <TouchableOpacity
              onPress={() => handleTabPress(tab.name, index)}
              className={`${
                isFocused
                  ? "bg-green-500 p-4 rounded-full -mt-6 border-4 border-[#1A1920] shadow-md"
                  : "items-center justify-center"
              }`}
              style={{
                backgroundColor: isFocused ? "#2AAD7A" : "transparent",
                padding: isFocused ? 8 : 8,
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
  );
};

export default NavigationBar;