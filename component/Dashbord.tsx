import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ImageBackground,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { StatusBar } from "expo-status-bar";
import axios from "axios";
import AntDesign from "react-native-vector-icons/AntDesign";
import NewsSlideShow from "@/Items/NewsSlideShow";
import MarketPriceSlideShow from "@/Items/MarketPriceSlideShow";
import { RootStackParamList } from "./types";
import { StackNavigationProp } from "@react-navigation/stack";
import NavigationBar from "@/Items/NavigationBar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { environment } from "@/environment/environment";
import { useTranslation } from "react-i18next";

// Define the type for navigation prop
type DashboardNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Lanuage"
>;

// Define the interface for user details
interface User {
  firstName: string;
  lastName?: string; // Optional if not always provided
  phoneNumber?: string; // Optional if not always provided
  NICnumber?: string; // Optional if not always provided
  // Add other properties as needed
}

interface DashboardProps {
  navigation: DashboardNavigationProp;
}

const Dashboard: React.FC<DashboardProps> = ({ navigation }) => {
  // Use the User interface to type state
  const [user, setUser] = useState<User | null>(null);
  const [language, setLanguage] = useState("en");
  const { t } = useTranslation();

  useEffect(() => {
    const selectedLanguage = t("Dashboard.LNG");
    setLanguage(selectedLanguage);
    // Fetch initial profile data (dummy example, replace with your API call)
    const fetchProfileData = async () => {
      try {
        const response = await fetch(
          `${environment.API_BASE_URL}api/auth/user-profile`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${await AsyncStorage.getItem(
                "userToken"
              )}`,
            },
          }
        );
        const data = await response.json();
        console.log(data.user);

        setUser(data.user);
      } catch (error) {
        console.error("Error fetching profile data:", error);
        Alert.alert("Error", "Failed to fetch profile data.");
      }
    };

    fetchProfileData();
  }, []);

  // Function to handle weather card click based on language selection
  const handleWeatherNavigation = () => {
    if (language === "en") {
      navigation.navigate("WeatherForecastEng"); // Navigate to English form
    } else if (language === "si") {
      navigation.navigate("WeatherForecastSinhala"); // Navigate to Sinhala form
    } else if (language === "ta") {
      navigation.navigate("WeatherForecastTamil"); // Navigate to Tamil form
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="light" />

      <ImageBackground
        source={require("../assets/images/Group.png")} // Make sure the path is correct
        style={{ flex: 1, width: wp(100), height: hp(20) }}
      >
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity onPress={() => navigation.navigate("EngProfile")}>
            {/* <Image
              source={require("../assets/images/pcprofile 1.jpg")}
              style={{
                height: hp(8),
                width: hp(8),
                borderRadius: hp(4),
                marginLeft: 15,
                marginTop: 15,
              }}
            /> */}
            <View style={{ position: "relative" }}>
              <Image
                source={require("../assets/images/pcprofile 1.jpg")}
                style={{
                  height: hp(8),
                  width: hp(8),
                  borderRadius: hp(4),
                  marginLeft: 15,
                  marginTop: 15,
                }}
              />
              {/* Green circle on the upper corner */}
              <View
                style={{
                  position: "absolute",
                  top: 13,
                  right: 4,
                  height: 15,
                  width: 15,
                  borderRadius: 7.5,
                  backgroundColor: "green", // Green color
                  borderWidth: 2, // Border to make the circle more visible
                  borderColor: "white", // White border to separate from profile image
                }}
              />
            </View>


          </TouchableOpacity>
          <View style={{ marginTop: 20, marginLeft: 15 }}>
            <Text style={{ fontSize: 15, fontWeight: "bold" }}>
            {t("Dashboard.hi")}, {user ? `${user.firstName} 👍` : `${t("Dashboard.loading")}`}
            </Text>
            <Text style={{ fontSize: 12, color: "gray" }}>
              {/* Last seen 11.23PM */}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate("PublicForum" as any);
            }}
            className="ml-auto mr-4 mt-5" // Push it to the right
          >
            <AntDesign name="message1" size={34} color="black" />
          </TouchableOpacity>
        </View>

        <View style={{ marginTop: 20, marginLeft: 20 }}>
          <Text style={{ fontSize: 20, color: "gray" }}>
            {t("Dashboard.news")}
          </Text>
          <View
            style={{
              borderTopWidth: 1,
              borderTopColor: "gray",
              marginRight: 20,
            }}
          />
        </View>

        <View
          style={{
            marginTop: 20,
            flex: 1,
            marginLeft: 20,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <NewsSlideShow navigation={navigation} />
        </View>

        <View style={{ marginLeft: 20, marginTop: 20 }}>
          <Text style={{ fontSize: 20, color: "gray" }}>
            {t("Dashboard.marketplace")}
          </Text>
          <View
            style={{
              borderTopWidth: 1,
              borderTopColor: "gray",
              marginRight: 20,
            }}
          />
        </View>

        <View
          style={{
            marginTop: 20,
            flex: 1,
            marginLeft: 20,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <MarketPriceSlideShow />
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginHorizontal: 20,
            marginTop: 20,
          }}
        >
          <TouchableOpacity
            style={{
              borderRadius: 25,
              backgroundColor: "#26D041",
              width: wp(35),
              height: wp(28),
              marginLeft: 20,
            }}
            onPress={() => {
              navigation.navigate("CurrentAssert");
            }}
          >
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Image
                source={require("../assets/images/Sales Performance.png")}
                style={{ width: 50, height: 40 }}
                resizeMode="contain"
              />
              <Text style={{ marginTop: 15, color: "white", fontSize: 12 }}>
                {t("Dashboard.myassets")}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              borderRadius: 25,
              backgroundColor: "#26D041",
              width: wp(35),
              height: wp(28),
              marginRight: 20,
            }}
            onPress={handleWeatherNavigation}
          >
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                marginLeft: 10,
              }}
            >
              <Image
                source={require("../assets/images/whether fill w.png")}
                style={{ width: 50, height: 50 }}
                resizeMode="contain"
              />
              <Text style={{ marginTop: 5, color: "white", fontSize: 12 }}>
                {t("Dashboard.weather")}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          <NavigationBar navigation={navigation} />
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default Dashboard;
