import React, { useEffect, useState } from "react";
import { View, ImageBackground, Image, Text } from "react-native";
import * as Progress from "react-native-progress";
import { useNavigation } from "@react-navigation/native";

const backgroundImage = require("../assets/images/SplashBackground.webp");
const llogo = require("../assets/images/logo2White 1.webp");
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "./types";

type SplashNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Splash"
>;

const Splash: React.FC = () => {
  const navigation = useNavigation<SplashNavigationProp>();

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate("Lanuage");
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
