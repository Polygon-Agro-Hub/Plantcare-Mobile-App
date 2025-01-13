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

  let currentTabName = state.routes[state.index]?.name || "Dashboard";
  if (currentTabName === 'CropCalander') {
    currentTabName = "MyCrop";
  }

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

    navigation.navigate(tabName);
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
        alignItems: "center",
        justifyContent: "center",
        width: 60,
        height: 40,
      }}
      key={index} // This is the key prop
    >
      <TouchableOpacity
        onPress={() => handleTabPress(tab.name, index)}
        className={`${
          isFocused
            ? "bg-green-500  p-4 rounded-full -mt-6 border-4 border-[#1A1920] shadow-md"
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
