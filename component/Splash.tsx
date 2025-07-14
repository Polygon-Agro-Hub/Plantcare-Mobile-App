// import React, { useEffect, useState } from "react";
// import { View, ImageBackground, Image, Text } from "react-native";
// import * as Progress from "react-native-progress";
// import { useNavigation } from "@react-navigation/native";

// const backgroundImage = require("../assets/images/SplashBackground.webp");
// const llogo = require("../assets/images/logo2White 1.webp");
// import { NativeStackNavigationProp } from "@react-navigation/native-stack";
// import { RootStackParamList } from "./types";

// type SplashNavigationProp = NativeStackNavigationProp<
//   RootStackParamList,
//   "Splash"
// >;

// const Splash: React.FC = () => {
//   const navigation = useNavigation<SplashNavigationProp>();

//   const [progress, setProgress] = useState(0);

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       navigation.navigate("Lanuage");
//     }, 5000);

//     const progressInterval = setInterval(() => {
//       setProgress((prev) => {
//         if (prev < 1) {
//           return prev + 0.1;
//         }
//         clearInterval(progressInterval);
//         return prev;
//       });
//     }, 500);

//     return () => {
//       clearTimeout(timer);
//       clearInterval(progressInterval);
//     };
//   }, [navigation]);

//   return (
//     <ImageBackground source={backgroundImage} style={{ flex: 1 }}>
//       <View
//         style={{
//           paddingBottom: 300,
//           flex: 1,
//           justifyContent: "center",
//           alignItems: "center",
//         }}
//       >
//         <Image
//           source={llogo}
//           style={{
//             marginBottom: 0,
//             width: 150,
//             height: 150,
//             resizeMode: "contain",
//           }}
//         />
//         <Text
//           style={{
//             color: "white",
//             fontSize: 32,
//             fontWeight: "bold",
//             marginTop: 20,
//           }}
//         >
//           PLANT CARE
//         </Text>
//         <View style={{ width: "80%", marginTop: 20 }}>
//           <Progress.Bar
//             progress={progress}
//             width={null}
//             color="#ffffff"
//             borderWidth={0}
//             style={{ height: 10 }}
//           />
//         </View>
//       </View>
//     </ImageBackground>
//   );
// };

// export default Splash;


import React, { useEffect, useState } from "react";
import { View, ImageBackground, Image, Text } from "react-native";
import * as Progress from "react-native-progress";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "./types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { environment } from "@/environment/environment";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUserData } from "../store/userSlice";

const backgroundImage = require("../assets/images/SplashBackground.webp");
const llogo = require("../assets/images/logo2White 1.webp");

type SplashNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Splash"
>;

const Splash: React.FC = () => {
  const navigation = useNavigation<SplashNavigationProp>();
  const [progress, setProgress] = useState(0);
  const dispatch = useDispatch();

  useEffect(() => {
    const timer = setTimeout(() => {
      // Only navigate after token check and progress bar completion
      handleTokenCheck();
    }, 5000);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 1) {
          return prev + 0.1;
        }
        clearInterval(progressInterval);
        return prev;
      });
    }, 500);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [navigation]);

  const handleTokenCheck = async () => {
    try {
      const expirationTime = await AsyncStorage.getItem("tokenExpirationTime");
      const userToken = await AsyncStorage.getItem("userToken");

      if (expirationTime && userToken) {
        const currentTime = new Date();
        const tokenExpiry = new Date(expirationTime);

        if (currentTime < tokenExpiry) {
          console.log("Token is valid, navigating to Main.");
          navigation.navigate("Main", { screen: "Dashboard" });
        } else {
          console.log("Token expired, clearing storage.");
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

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (token) {
          const response = await axios.get(
            `${environment.API_BASE_URL}api/auth/user-profile`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (response.data.status === "success") {
            console.log("splash user res", response.data.usermembership)
            dispatch(setUserData(response.data.usermembership));
          } else {
            navigation.navigate("Signin");
          }
        } 
      } catch (error) {}
    };

    fetchProfile();

  }, []);
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
            height: 150,
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
          PLANT CARE
        </Text>
        <View style={{ width: "80%", marginTop: 20 }}>
          <Progress.Bar
            progress={progress}
            width={null}
            color="#ffffff"
            borderWidth={0}
            style={{ height: 10 }}
          />
        </View>
      </View>
    </ImageBackground>
  );
};

export default Splash;
