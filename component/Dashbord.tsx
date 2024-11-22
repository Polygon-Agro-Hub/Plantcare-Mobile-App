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
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import NewsSlideShow from "@/Items/NewsSlideShow";
import MarketPriceSlideShow from "@/Items/MarketPriceSlideShow";
import { RootStackParamList } from "./types";
import { StackNavigationProp } from "@react-navigation/stack";
import NavigationBar from "@/Items/NavigationBar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { environment } from "@/environment/environment";
import { useTranslation } from "react-i18next";
import { useIsFocused } from "@react-navigation/native";
import NetInfo from "@react-native-community/netinfo";

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
  const isFocused = useIsFocused();

  // State for tracking network status
  const [isConnected, setIsConnected] = useState(true); // Default to connected
  const screenWidth = wp(100); // Get the full width of the screen

  // Monitor network connection status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected ?? false);
    });
    return () => unsubscribe(); // Cleanup the listener on unmount
  }, []);

  useEffect(() => {
    console.log("hi.. news language is", language);
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
        Alert.alert(t("Dashboard.error"), t("Dashboard.failedToFetch"));
      }
    };

    if (isFocused) {
      fetchProfileData();
    }
  }, [isFocused]);

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

  //Define dynamic styles based on screen size
  const dynamicStyles = {
    imageSize: screenWidth < 400 ? wp(6) : wp(8), // Adjust profile image size
    buttonWidth: screenWidth < 400 ? wp(38) : wp(35), // Adjust button width
    buttonHeight: screenWidth < 400 ? wp(28) : wp(28), // Adjust button height
    iconSize: screenWidth < 400 ? 40 : 50, // Adjust icon size
    textSize: screenWidth < 400 ? 8 : 12, // Adjust text size
    paddingTopSlideshow: screenWidth < 400 ? 80 : 80,
    slideShowTitleSize: screenWidth < 400 ? 15 : 20,
    paddingFromProfileImage: screenWidth < 400 ? 10 : 20,
    paddingTopForCards: screenWidth < 400 ? 60 : 60,
  };

  return (
    <SafeAreaView className="flex-1 bg-white ">
      <StatusBar style="light" />

      <ImageBackground
        source={require("../assets/images/Group.png")} // Make sure the path is correct
        style={{ flex: 1, width: wp(100), height: hp(20) }}
      >
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity onPress={() => navigation.navigate("EngProfile")}>
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
              {/* Green/Gray circle based on network status */}
              <View
                style={{
                  position: "absolute",
                  top: 13,
                  right: 4,
                  height: 15,
                  width: 15,
                  borderRadius: 7.5,
                  backgroundColor: isConnected ? "#00ff00" : "#808080", // <-- Green for online, Gray for offline
                  borderWidth: 2, // Border to make the circle more visible
                  borderColor: "white", // White border to separate from profile image
                }}
              />
            </View>
          </TouchableOpacity>
          <View style={{ marginTop: 20, marginLeft: 15 }}>
            <Text style={{ fontSize: 15, fontWeight: "bold" }}>
              {t("Dashboard.hi")},{" "}
              {user ? `${user.firstName} 👍` : `${t("Dashboard.loading")}`}
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
            <MaterialCommunityIcons
              name="message-processing"
              size={34}
              color="black"
            />
          </TouchableOpacity>
        </View>

        <View></View>

        <View
          style={{
            marginLeft: 20,
            marginTop: dynamicStyles.paddingTopSlideshow,
          }}
        >
          <Text
            style={{
              fontSize: dynamicStyles.slideShowTitleSize,
              color: "gray",
              marginBottom: 5,
            }}
          >
            {t("Dashboard.marketplace")}
          </Text>
          <View
            style={{
              borderTopWidth: 1,
              borderTopColor: "#E2E2E2",
              marginRight: dynamicStyles.paddingTopSlideshow,
              
            }}
          />
        </View>

        <View
          style={{
            marginTop: dynamicStyles.paddingTopSlideshow,
            flex: 1,
            marginLeft: 20,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <MarketPriceSlideShow language={language} />
        </View>

        <View
          style={{            
            marginLeft: 20,
          }}
        >
          <Text
            style={{
              fontSize: dynamicStyles.slideShowTitleSize,
              color: "gray",
              marginBottom: 5,
            }}
          >
            {t("Dashboard.news")}
          </Text>
          <View
            style={{
              borderTopWidth: 1,
              borderTopColor: "#E2E2E2",
              marginRight: dynamicStyles.paddingTopSlideshow,
              marginBottom: 60,
            }}
          />
        </View>

        <View
          style={{
            marginTop: 40,
            flex: 1,
            padding: 10,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 50,
          }}
        >
          <NewsSlideShow navigation={navigation} language={language} />
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: dynamicStyles.paddingTopForCards,
            marginBottom: 40,
          }}
        >
          <TouchableOpacity
            style={{
              borderRadius: 10,
              backgroundColor: "#26D041",
              width: dynamicStyles.buttonWidth,
              height: dynamicStyles.buttonHeight,
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
                style={{
                  width: dynamicStyles.iconSize,
                  height: dynamicStyles.iconSize,
                }}
                resizeMode="contain"
              />
              <Text
                style={{
                  marginTop: 15,
                  color: "white",
                  fontSize: dynamicStyles.textSize,
                }}
              >
                {t("Dashboard.myassets")}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              borderRadius: 10,
              backgroundColor: "#26D041",
              width: dynamicStyles.buttonWidth,
              height: dynamicStyles.buttonHeight,
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
                style={{
                  width: dynamicStyles.iconSize,
                  height: dynamicStyles.iconSize,
                }}
                resizeMode="contain"
              />
              <Text
                style={{
                  marginTop: 5,
                  color: "white",
                  fontSize: dynamicStyles.textSize,
                }}
              >
                {t("Dashboard.weather")}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={{ width: "100%" }} >
          <NavigationBar navigation={navigation} />
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default Dashboard;
