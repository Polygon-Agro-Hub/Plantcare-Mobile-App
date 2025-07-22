import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  TextInput,
  Text,
  ActivityIndicator,
  FlatList,
  TouchableWithoutFeedback,
  ScrollView,
  Alert,
  SafeAreaView,
  RefreshControl,
  ImageBackground
} from "react-native";
import * as Location from "expo-location";
import { Ionicons, MaterialCommunityIcons, Entypo } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import debounce from "lodash.debounce";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "./types";
import NavigationBar from "@/Items/NavigationBar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import AntDesign from "react-native-vector-icons/AntDesign";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Dimensions, StyleSheet } from "react-native";

const { width } = Dimensions.get("window"); // Get the screen width

const isSmallScreen = width < 400; // Check if the screen width is smaller than 350 pixels

type WeatherForecastEngNavigationProps = StackNavigationProp<
  RootStackParamList,
  "WeatherForecastEng"
>;

interface WeatherForecastEngProps {
  navigation: WeatherForecastEngNavigationProps;
}

const WeatherForecastEng: React.FC<WeatherForecastEngProps> = ({
  navigation,
}) => {
  const route = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [locationPermissionDenied, setLocationPermissionDenied] =
    useState(false);

  const apiKey = "8561cb293616fe29259448fd098f654b"; // Replace with your OpenWeatherMap API key

  useFocusEffect(
  useCallback(() => {
    // Clear search query every time screen comes into focus
    setSearchQuery("");
    setSuggestions([]);
  }, [])
);


  const fetchWeather = async (lat: number, lon: number) => {
    setLoading(true);
    if(refreshing === false)
      {setLoading(false)}
    try {
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
      );
      const weatherData = await weatherResponse.json();

      if (weatherResponse.ok && weatherData) {
        setWeatherData(weatherData);

        // Clear suggestions since location is set
        setSuggestions([]);

        const forecastResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
        );
        const forecastData = await forecastResponse.json();

        if (forecastResponse.ok && forecastData.list) {
          setForecastData(forecastData.list);
        
        } else {
          setForecastData([]);
          alert("No forecast data available.");
        }
      } else {
        setWeatherData(null);
        alert("Location not found.");
      }
    } catch (error) {
      console.error("Error fetching weather data:", error);
      alert("An error occurred while fetching weather data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getCityNameFromCoords = async (lat: number, lon: number) => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`
      );
      return response.data.name;
    } catch (error) {
      console.error("Error fetching city name from coordinates:", error);
      return null;
    }
  };

  useEffect(() => {
    console.log("====================================");
    console.log("Screen width is...", width);
    console.log("====================================");

    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLocationPermissionDenied(true);
          Alert.alert(
            "Permission Denied",
            "Location access is required to fetch weather data for your current location. You can search for a location manually.",
            [{ text: "OK" }]
          );
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        fetchWeather(location.coords.latitude, location.coords.longitude);

        // Clear suggestions since location data is automatically fetched
        setSuggestions([]);

        // Optionally store the last fetched location's city name
        const cityName = await getCityNameFromCoords(
          location.coords.latitude,
          location.coords.longitude
        );
        if (cityName) {
          try {
            await AsyncStorage.setItem("lastSearchedCity", cityName);
            console.log(
              `Stored ${cityName} as last searched city from location`
            );
          } catch (error) {
            console.error("Error storing city name in local storage:", error);
          }
        }
      } catch (error) {
        console.error("Error fetching current location:", error);
        Alert.alert("Error", "Unable to fetch current location.");
      }
    })();
  }, []);

  const fetchSuggestions = async (query: string) => {
    if (query.length < 3) {
      // setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${apiKey}`
      );
      const data = await response.json();

      if (data.length > 0) {
        setSuggestions(data);
        console.log(data);

        // Add a condition to clear suggestions if the details are already loaded
        if (!weatherData) {
          setSuggestions(data);
          console.log(data);
        } else {
          console.log("Weather data already loaded, skipping suggestions.");
        }
      } else {
        setSuggestions([]);
        console.warn("No suggestions found for this location.");
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  const debouncedFetchSuggestions = debounce(fetchSuggestions, 500);

  const handleSuggestionPress = async (
    lat: number,
    lon: number,
    name: string
  ) => {
    setSearchQuery(name);
    fetchWeather(lat, lon);

    // Clear the suggestions
    setSuggestions([]);

    try {
      await AsyncStorage.setItem("lastSearchedCity", name);
      console.log(`Stored ${name} in local storage`);
    } catch (error) {
      console.error("Error storing city name in local storage:", error);
    }
  };

  const handleInputChange = (text: string) => {
    setSearchQuery(text);
    if (text.length < 3) {
      setSuggestions([]); // Clear suggestions for short inputs
    }
    debouncedFetchSuggestions(text);
    // Continue fetching suggestions
  };

  useEffect(() => {
    // This will be triggered when the component is first loaded
    const loadCurrentLocationData = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationPermissionDenied(true);
        Alert.alert(
          "Permission Denied",
          "Location access is required to fetch weather data for your current location. You can search for a location manually.",
          [{ text: "OK" }]
        );
        return;
      }

      // Get the user's current location
      const location = await Location.getCurrentPositionAsync({});
      const cityName = await getCityNameFromCoords(
        location.coords.latitude,
        location.coords.longitude
      );
      console.log("City name from location:", location.coords.latitude);

      if (cityName) {
        // Do not set the search query to the city name (keeping it empty)
        // setSearchQuery(cityName); // Remove this line to prevent city name in search box

        // Fetch weather data for the current location
        fetchWeather(location.coords.latitude, location.coords.longitude);
setSuggestions([]);
        // Optionally store the current city as the last searched city in local storage
        try {
          await AsyncStorage.setItem("lastSearchedCity", cityName);
          console.log(`Stored ${cityName} as last searched city from location`);
        } catch (error) {
          console.error("Error storing city name in local storage:", error);
        }
      }
    };

    loadCurrentLocationData();

    // Clear any lingering suggestions on startup
    setSuggestions([]);
  }, []);

  useEffect(() => {
    debouncedFetchSuggestions(searchQuery);
  }, [searchQuery]);

  const handleLocationIconPress = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({});

        // Fetch weather data directly for the current location
        fetchWeather(location.coords.latitude, location.coords.longitude);
        const cityName = await getCityNameFromCoords(
          location.coords.latitude,
          location.coords.longitude
        );
        if (cityName) {
          try {
            await AsyncStorage.setItem("lastSearchedCity", cityName);
            console.log(
              `Stored ${cityName} as last searched city from location`
            );
          } catch (error) {
            console.error("Error storing city name in local storage:", error);
          }
        }
        // Clear suggestions without updating the search box
        setSuggestions([]);
      } else {
        Alert.alert(
          "Permission Denied",
          "Location access is required to fetch weather data for your current location. You can search for a location manually.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("Error getting current location:", error);
      Alert.alert("Error", "Unable to fetch current location.");
    }
  };

  const getCurrentTimeDate = (): string => {
    const now = new Date();
    const dateOptions: Intl.DateTimeFormatOptions = {
      month: "long",
      day: "2-digit",
    };
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    };

    const date = now.toLocaleDateString("en-US", dateOptions);
    const time = now.toLocaleTimeString("en-US", timeOptions);

    //console.log("[[[[[[[[[[[]]]]]]]]]]]]]",time)

    return `${time} ${date}`;
  };

  const getWeatherImage = (id: number, icon: string): any => {
    const iconString = typeof icon === "string" ? icon : "";
    const isDayTime = iconString.includes("d");

  //s  console.log("=============",iconString)

    try {
      if (id === 800) {
        return isDayTime
          ? require("../assets/images/weather icons/daytime/sunny.webp")
          : require("../assets/images/weather icons/night-time/night-clear sky.webp");
      } else if (id >= 800 && id <= 804) {
        return isDayTime
          ? require("../assets/images/weather icons/daytime/partly cloudy.webp")
          : require("../assets/images/weather icons/night-time/Partly Cloudy - night.webp");
      } else if (id >= 200 && id <= 232) {
        return isDayTime
          ? require("../assets/images/weather icons/daytime/thunderclouds.webp")
          : require("../assets/images/weather icons/night-time/night-thunderclouds.webp");
      } else if (id >= 500 && id <= 531) {
        return isDayTime
          ? require("../assets/images/weather icons/daytime/heavy rain.webp")
          : require("../assets/images/weather icons/night-time/night-heavy rain.webp");
      } else if (id === 701) {
        return isDayTime
          ? require("../assets/images/weather icons/daytime/mist.webp")
          : require("../assets/images/weather icons/night-time/mist-nightsky.webp");
      } else if (id >= 600 && id <= 622) {
        return require("../assets/images/weather icons/daytime/snow.webp");
      }
    } catch (error) {
      console.error("Error loading image:", error);
    }
  };

   const formatForecastTime = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchWeather(weatherData.coord.lat, weatherData.coord.lon); // Use current coordinates to refresh
    setRefreshing(false);

  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
         
      <View className="flex-1 ">
       
        <View className="relative w-full">

          <View className=" flex-row items-center justify-between mt-2 px-4 ">
               <View className=" ">
            <TouchableOpacity className="p-2 bg-transparent">
              <AntDesign
                name="left"
                size={24}
                color="#000502"
                onPress={() => navigation.goBack()}
                            style={{ paddingHorizontal: wp(3), paddingVertical: hp(1.5), backgroundColor: "#F6F6F680" , borderRadius: 50 }}
                
              />
            </TouchableOpacity>
            </View>
            <View className="relative flex-1 items-center">
              <View className="flex-row items-center bg-[#F6F6F6CC] rounded-lg max-w-[300px] ">
                <TextInput
                  className="flex-1 p-1 text-lg text-black ml-4 "
                  placeholder="Search location"
                  placeholderTextColor="#999"
                  value={searchQuery}
                  onChangeText={handleInputChange}
                />
                <View className="mr-4">
        <Ionicons
                  name="search"
                  size={24}
                  color="black"
                  className="ml-2"
                />
                </View>
        
              </View>

              {suggestions.length > 0 && (
                <View
                  style={[styles.suggestionsContainer]}
                  className="absolute top-12 left-0 right-0 bg-white shadow-lg rounded-lg"
                >
                  <FlatList
                    data={suggestions}
                    keyExtractor={(item) => `${item.lat}-${item.lon}`}
                    renderItem={({ item }) => (
                      <TouchableWithoutFeedback
                        onPress={() =>
                          handleSuggestionPress(item.lat, item.lon, item.name)
                        }
                      >
                        <View className="px-4 py-2 border-b border-gray-200">
                          <Text className="text-lg text-black">
                            {item.name}, {item.state}, {item.country}
                          </Text>
                        </View>
                      </TouchableWithoutFeedback>
                    )}
                  />
                </View>
              )}
            </View>
            <TouchableOpacity
              className="p-1 ml-2 bg-[#F6F6F6CC] rounded-lg"
              onPress={handleLocationIconPress}
            >
              <Image
                source={require("../assets/images/location.webp")}
                style={{ width: 24, height: 24 }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Scrollable content */}
        <ScrollView
        className="mt-6 "
          contentContainerStyle={{ flexGrow: 1, zIndex: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          <View className="p-1 pt-0 mt-0 pb-4 ">
            {loading ? (
              <ActivityIndicator size="large" color="#00ff00" />
            ) : weatherData ? (
              <View className="items-center">
                <Image
                  source={getWeatherImage(
                    weatherData.weather[0].id,
                    weatherData.weather[0].icon
                  )}
                  className="w-40 h-32"
                  resizeMode="contain"
                />
                <Text className="text-6xl font-bold  mt-4">
                  {weatherData.main.temp}°C
                </Text>
                <Text className="text-lg text-gray-400 mb-4">
                  {weatherData.weather[0].description}
                </Text>
                <View className="flex-row gap-1 items-baseline ">
                          <Entypo
                  name="location-pin"
                  size={20}
                  color="black"
                  className="ml-2 mt-2"
                />
                         <Text className="text-lg font-semibold ">
                  {weatherData.name}, {weatherData.sys.country}
                </Text>
                </View>
       
                <Text className="text font-semibold text-gray-700 mb-2">
                  {getCurrentTimeDate()}
                </Text>

                <View className="flex-row justify-between p-5 mt-2">
                  <View
                    className="bg-white p-4 rounded-xl shadow-lg flex-1 mx-2 items-center justify-center"
                    style={{
                      shadowColor: "grey",
                      shadowOffset: { width: 1, height: 2 },
                      shadowOpacity: 0.9,
                      shadowRadius: 4,
                      elevation: 4,
                    }}
                  >
                    <Image
                      source={require("../assets/images/Wind.webp")}
                      className="w-8 h-8"
                      resizeMode="contain"
                    />
                    <Text className="text-l font-bold ">
                      {weatherData.wind.speed} m/s
                    </Text>
                    <Text
                      style={{
                        fontSize: isSmallScreen ? 13 : 16,
                        color: "#666",
                      }}
                    >
                      Wind
                    </Text>
                  </View>
                  <View
                    className="bg-white p-4 rounded-xl shadow-lg flex-1 mx-2 items-center justify-center"
                    style={{
                      shadowColor: "grey",
                      shadowOffset: { width: 1, height: 2 },
                      shadowOpacity: 0.9,
                      shadowRadius: 4,
                      elevation: 4,
                    }}
                  >
                    <Image
                      source={require("../assets/images/Water.webp")}
                      className="w-8 h-8"
                      resizeMode="contain"
                    />
                    <Text className="text-l font-bold ">
                      {weatherData.main.humidity}%
                    </Text>
                    <Text
                      style={{
                        fontSize: isSmallScreen ? 13 : 16,
                        color: "#666",
                      }}
                    >
                      Humidity
                    </Text>
                  </View>
                  <View
                    className="bg-white p-4 rounded-xl shadow-lg flex-1 mx-2 items-center justify-center"
                    style={{
                      shadowColor: "grey",
                      shadowOffset: { width: 1, height: 2 },
                      shadowOpacity: 0.9,
                      shadowRadius: 4,
                      elevation: 4,
                    }}
                  >
                    <Image
                      source={require("../assets/images/Rain.webp")}
                      className="w-8 h-8"
                      resizeMode="contain"
                    />
                    <Text className="text-l font-bold ">
                      {weatherData.rain
                        ? `${weatherData.rain["1h"]} mm`
                        : "0 mm"}
                    </Text>
                    <Text
                      style={{
                        fontSize: isSmallScreen ? 13 : 16,
                        color: "#666",
                      }}
                    >
                      Rain
                    </Text>
                  </View>
                </View>

                <ScrollView className="mt-0 pt-0">
                  <View className="flex-row justify-between items-center px-4 pt-0">
                    <Text className="text-l mb-2 font-semibold">Today</Text>
                    <TouchableOpacity
                      className="p-2"
                      onPress={() => {
                        if (weatherData) {
                          navigation.navigate("FiveDayForecastEng");
                        } else {
                          alert("No location selected");
                        }
                      }}
                    >
                      <Text className="text-l mb-2 font-semibold -mr-3">5 days <AntDesign name="caretright"/></Text>
                    </TouchableOpacity>
                  </View>

                  {forecastData.length > 0 ? (
                  <FlatList
                  className="mb-20"
          data={forecastData}
          horizontal
          keyExtractor={(item) => item.dt.toString()}
          renderItem={({ item }) => (
            <View
              className="bg-white p-4 rounded-lg shadow-lg mx-2 items-center mt-1 mb-2"
              style={{
                shadowColor: "gray",
                shadowOffset: { width: 1, height: 1 },
                shadowOpacity: 0.8,
                shadowRadius: 2,
                elevation:4
              }}
            >
              <Image
                source={getWeatherImage(
                  item.weather[0].id,
                  item.weather[0].icon
                )}
                className="w-6 h-6"
                resizeMode="contain"
              />
              <Text className="text-base font-bold mb-1">
                {item.main.temp}°C
              </Text>
              <Text className="text-gray-600">
                {formatForecastTime(item.dt)}
              </Text>
            </View>
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 10 }}
        />
                  ) : (
                    <Text className="text-center text-lg text-gray-700">
                      No forecast data available
                    </Text>
                  )}
                </ScrollView>
              </View>
            ) : (
              <>
               {/* <Text style={{ textAlign: "center" }}>
                No weather data available! Try Again
              </Text> */}
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#26D041" />
            </View>  
                         
               </>
             
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default WeatherForecastEng;

const styles = StyleSheet.create({
  suggestionsContainer: {
    zIndex: 50, // Ensures it appears above other components
    elevation: 5, // For Android
    maxHeight: 200, // Prevents the dropdown from exceeding the screen
  },
});
