import { useState, useEffect, useCallback } from "react";
import {
  Image,
  TouchableOpacity,
  View,
  Keyboard,
  Animated,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useSelector } from "react-redux";
import type { RootState } from "../services/reducxStore";

interface UserData {
  farmCount: number;
  membership: string;
  paymentActiveStatus: string | null;
  role: string;
}

const homeIcon = require("../assets/images/bottom-nav/home-image.webp");
const NewCrop = require("../assets/images/bottom-nav/new-crop.webp");
const MyCrop = require("../assets/images/bottom-nav/my-crop.webp");

const NavigationBar = ({
  navigation,
  state,
}: {
  navigation: any;
  state: any;
}) => {
  const [isKeyboardVisible, setKeyboardVisible] = useState<boolean>(false);

  const [scales] = useState(() => new Array(3).fill(new Animated.Value(1)));
  const user = useSelector(
    (state: RootState) => state.user.userData,
  ) as UserData | null;

  const [tabs, setTabs] = useState<any[]>([]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      },
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  let currentTabName = state.routes[state.index]?.name || "Dashboard";
  if (currentTabName === "CropCalander") {
    currentTabName = "MyCrop";
  } else if (
    currentTabName === "AddFarmList" ||
    currentTabName === "AddNewFarmBasicDetails"
  ) {
    currentTabName = "AddNewFarmFirst";
  }
  useEffect(() => {
    let defaultTabs = [
      { name: "Dashboard", icon: homeIcon, focusedIcon: homeIcon },
      { name: "AddNewFarmFirst", icon: NewCrop, focusedIcon: NewCrop },
      { name: "MyCultivation", icon: MyCrop, focusedIcon: MyCrop },
    ];

    if (!user || !user.role) {
      setTabs([]);
    } else if (user.role === "Laborer" || user.role === "Laboror") {
      setTabs([]);
    } else if (user.role === "Manager") {
      setTabs([]);
    } else if (user.role === "Supervisor") {
      setTabs([]);
    } else {
      setTabs(defaultTabs);
    }
  }, [user]);


  useFocusEffect(
    useCallback(() => {
      const loadActiveTab = async () => {
        const currentRoute =
          navigation.getState().routes[navigation.getState().index].name;

        await AsyncStorage.setItem("activeTab", currentRoute);
      };
      loadActiveTab();
    }, []),
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

    if (tabName === "AddNewFarmFirst") {
      if (
        user &&
        (user.membership === "Basic" || user.membership === "Pro") &&
        user.farmCount > 0
      ) {
        navigation.navigate("AddFarmList");
      } else {
        navigation.navigate("AddNewFarmFirst");
      }
    } else {
      navigation.navigate(tabName);
    }
  };
  useFocusEffect(
    useCallback(() => {
      if (!user) return;

      if ((user.role === "Laborer" || user.role === "Laboror") && currentTabName === "Dashboard") {
        navigation.navigate("LabororDashbord");
      } else if (user.role === "Manager" && currentTabName === "Dashboard") {
        navigation.navigate("ManagerDashbord");
      } else if (user.role === "Supervisor" && currentTabName === "Dashboard") {
        navigation.navigate("SupervisorDashbord");
      } else if (user.role === "Owner" && currentTabName === "Dashboard") {
        navigation.navigate("Dashboard");
      }
    }, [user, currentTabName, navigation]),
  );

  if (isKeyboardVisible || !tabs.length || (user && (user.role === "Laborer" || user.role === "Laboror")))
    return null;
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
                  ? "bg-green-500 p-4 rounded-full -mt-6 border-4 border-[#1A1920]"
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
