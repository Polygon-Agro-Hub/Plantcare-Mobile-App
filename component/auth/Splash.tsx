import React, { useEffect, useRef, useState } from "react";
import { View, ImageBackground, Image, Text, Animated } from "react-native";
import * as Progress from "react-native-progress";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { environment } from "@/environment/environment";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUserData, setUserPersonalData } from "../../store/userSlice";

const backgroundImage = require("../../assets/images/auth/splash-background.webp");
const llogo = require("../../assets/images/auth/logowhite.webp");

type SplashNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Splash"
>;

const Splash: React.FC = () => {
  const navigation = useNavigation<SplashNavigationProp>();
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [progress, setProgress] = useState(0);
  const dispatch = useDispatch();

  useEffect(() => {
    const listenerId = progressAnim.addListener(({ value }) => {
      setProgress(value);
    });

    const animation = Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: false,
    });

    animation.start(async () => {
      await checkFirstLaunchAndNavigate();
    });

    return () => {
      progressAnim.removeListener(listenerId);
      animation.stop();
    };
  }, [navigation, progressAnim]);

  const checkFirstLaunchAndNavigate = async () => {
    try {
      const hasLaunchedBefore = await AsyncStorage.getItem("hasLaunchedBefore");

      if (!hasLaunchedBefore) {
        await AsyncStorage.setItem("hasLaunchedBefore", "true");
        navigation.navigate("Lanuage");
      } else {
        handleTokenCheck();
      }
    } catch (error) {
      console.error("Error checking first launch:", error);

      handleTokenCheck();
    }
  };

  const handleTokenCheck = async () => {
    try {
      const expirationTime = await AsyncStorage.getItem("tokenExpirationTime");
      const userToken = await AsyncStorage.getItem("userToken");

      if (expirationTime && userToken) {
        const currentTime = new Date();
        const tokenExpiry = new Date(expirationTime);

        if (currentTime < tokenExpiry) {
          await fetchUserProfile(userToken);
        } else {
          await AsyncStorage.multiRemove([
            "userToken",
            "tokenStoredTime",
            "tokenExpirationTime",
          ]);
          navigation.navigate("Signin");
        }
      } else {
        navigation.navigate("Signin");
      }
    } catch (error) {
      console.error("Error checking token expiration:", error);
      navigation.navigate("Signin");
    }
  };

  const fetchUserProfile = async (token: string) => {
    try {
      const response = await axios.get(
        `${environment.API_BASE_URL}api/auth/user-profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.status === "success") {
        const user = response.data.user;

        dispatch(setUserData(response.data.usermembership));
        dispatch(setUserPersonalData(response.data.user));

        if (response.data.usermembership.role === "Laboror") {
          navigation.navigate("Main", { screen: "LabororDashboard" as any });
        } else if (response.data.usermembership.role === "Manager") {
          navigation.navigate("Main", { screen: "ManagerDashboard" as any });
        } else if (response.data.usermembership.role === "Supervisor") {
          navigation.navigate("Main", { screen: "SupervisorDashboard" as any });
        } else {
          navigation.navigate("Main", { screen: "Dashboard" });
        }
      } else {
        navigation.navigate("Signin");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      navigation.navigate("Signin");
    }
  };

  return (
    <ImageBackground source={backgroundImage} style={{ flex: 1 }}>
      <View
        style={{
          paddingBottom: 300,
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Image
          source={llogo}
          style={{
            marginBottom: 0,
            width: 150,
            height: 300,
            resizeMode: "contain",
          }}
        />
        <Text
          style={{
            color: "white",
            fontSize: 32,
            fontWeight: "bold",
            marginTop: 20,
          }}
        >
          GOVI CARE
        </Text>
        <View style={{ marginTop: 20 }}>
          <Progress.Bar
            progress={progress}
            animated={false}
            color="#ffffff"
            unfilledColor="rgba(255, 255, 255, 0.3)"
            borderWidth={0}
            height={10}
            width={200}
          />
        </View>
      </View>
    </ImageBackground>
  );
};

export default Splash;
