import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  BackHandler,
} from "react-native";
import axios from "axios";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "./types";
import { useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AntDesign from "react-native-vector-icons/AntDesign";
  import { useFocusEffect } from "@react-navigation/native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Dimensions, StyleSheet } from "react-native";
import LottieView from "lottie-react-native";

const { width } = Dimensions.get("window");

const isSmallScreen = width < 400;

const API_KEY = "8561cb293616fe29259448fd098f654b";

type FiveDayForecastEngNavigationProp = StackNavigationProp<
  RootStackParamList,
  "FiveDayForecastEng"
>;

interface FiveDayForecastEngProps {
  navigation: FiveDayForecastEngNavigationProp;
}

interface TomorrowWeather {
  weatherId: number;
  icon: string;
  minTemp: number;
  maxTemp: number;
}

interface ForecastItem {
  main: {
    temp: number;
    temp_min: number;
    temp_max: number;
    humidity: number;
  };
  weather: {
    id: any;
    main: string;
    icon: string;
  }[];
  wind: {
    speed: number;
  };
  rain?: {
    "3h": number;
  };
  dt_txt: string;
}

interface WeatherComponentProps {
  item: TomorrowWeather;
  index: number;
}

const TomorrowWeatherComponent: React.FC<WeatherComponentProps> = ({
  item,
  index,
}) => {
  const [loading, setLoading] = useState(false);

  return (
    <View className="flex items-center justify-center  mb-1">
      <View className="justify-between flex-row items-center">
      <Image
        source={getWeatherImage(item.weatherId, item.icon)}
        className="w-40 h-32"
        resizeMode="contain"
      />
      <View className="ml-2">
        <Text className="text-xl ">Tomorrow</Text>
        <Text className=" mt-3">
          <Text className="text-3xl font-bold">{Math.round(item.minTemp)}°C</Text> 
          <Text className="text-base font-semibold text-gray-400"> / {Math.round(item.maxTemp)}°C</Text>
        </Text>
      </View>
      </View>
    </View>
  );
};

const getWeatherImage = (id: number, icon: string): any => {
  const iconString = typeof icon === "string" ? icon : "";
  const isDayTime = iconString.includes("d");

  try {
    // Clear sky
    if (id === 800) {
      return isDayTime
        ? require("../assets/images/weather icons/daytime/sunny.webp")
        : require("../assets/images/weather icons/night-time/night-clear sky.webp");
    }

    // Cloudy weather
    else if (id >= 800 && id <= 804) {
      if (id === 801 || id === 802) {
        return isDayTime
          ? require("../assets/images/weather icons/daytime/partly cloudy.webp")
          : require("../assets/images/weather icons/night-time/Partly Cloudy - night.webp");
      } else {
        return isDayTime
          ? require("../assets/images/weather icons/daytime/cloudy.webp")
          : require("../assets/images/weather icons/night-time/cloudy-night.webp");
      }
    }

    // Thunderstorms
    else if (id >= 200 && id <= 232) {
      if (id === 210 || id === 211 || id === 212 || id === 221) {
        return isDayTime
          ? require("../assets/images/weather icons/daytime/thunderclouds.webp")
          : require("../assets/images/weather icons/night-time/night-thunderclouds.webp");
      } else {
        return isDayTime
          ? require("../assets/images/weather icons/daytime/thunderstorms.webp")
          : require("../assets/images/weather icons/night-time/night-thunderstorms.webp");
      }
    }

    // Rain
    else if (id >= 500 && id <= 531) {
      if (id === 502 || id === 504 || id === 503 || id === 522 || id === 511) {
        return isDayTime
          ? require("../assets/images/weather icons/daytime/heavy rain.webp")
          : require("../assets/images/weather icons/night-time/night-heavy rain.webp");
      } else {
        return isDayTime
          ? require("../assets/images/weather icons/daytime/partly rainy.webp")
          : require("../assets/images/weather icons/night-time/night-partly-rainy.webp");
      }
    }

    // Mist
    else if (id === 701) {
      return isDayTime
        ? require("../assets/images/weather icons/daytime/mist.webp")
        : require("../assets/images/weather icons/night-time/mist-nightsky.webp");
    }

    // Snow
    else if (id >= 600 && id <= 622) {
      return require("../assets/images/weather icons/daytime/snow.webp"); // Assuming snow icon is the same for day/night
    }

    return isDayTime;
  } catch (error) {
    console.error("Error loading image:", error);
  }
};

const apiKey = "8561cb293616fe29259448fd098f654b"; // Replace with your OpenWeatherMap API key

const FiveDayForecastEng: React.FC<FiveDayForecastEngProps> = ({
  navigation,
}) => {
  const route = useRoute();

  const [forecastData, setForecastData] = useState([]);
  const [tomorrowWeather, setTomorrowWeather] = useState({});
  const [weatherStats, setWeatherStats] = useState({
    wind: 0,
    humidity: 0,
    rain: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(""); // State to hold the city name
  const fetchWeather = async (name: string): Promise<void> => {
    setLoading(true); // Start loading
    console.log("name", name)
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${name}&appid=${API_KEY}`
      );

      const data = response.data;
      const tomorrowWeather: ForecastItem = data.list[1]; // Assuming this is the data for tomorrow

      const tempCelsius = tomorrowWeather.main.temp - 273.15;
      const minTempCelsius = tomorrowWeather.main.temp_min - 273.15;
      const maxTempCelsius = tomorrowWeather.main.temp_max - 273.15;

      setTomorrowWeather({
        weatherId: tomorrowWeather.weather[0].id,
        icon: tomorrowWeather.weather[0].icon,
        minTemp: minTempCelsius,
        maxTemp: maxTempCelsius,
      });

      const firstEntry: ForecastItem = data.list[0];
      setWeatherStats({
        wind: firstEntry.wind.speed,
        humidity: firstEntry.main.humidity,
        rain: firstEntry.rain ? firstEntry.rain["3h"] : 0,
      });

      const fiveDayForecast = data.list
        .filter((item: ForecastItem, index: number) => index % 8 === 0)
        .slice(0, 5)
        .map((item: ForecastItem) => ({
          ...item,
          main: {
            ...item.main,
            temp: (item.main.temp - 273.15).toFixed(2),
            temp_min: (item.main.temp_min - 273.15).toFixed(2),
            temp_max: (item.main.temp_max - 273.15).toFixed(2),
          },
        }));
        console.log(fiveDayForecast)

      setForecastData(fiveDayForecast);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      setError("Failed to fetch weather data");
    } finally {
      setLoading(false); // Stop loading after data is fetched
    }
  };

     useFocusEffect(
        useCallback(() => {
          const handleBackPress = () => {
            navigation.navigate("WeatherForecastEng") // Fixed: removed the object wrapper
            return true;
          };
      
          BackHandler.addEventListener("hardwareBackPress", handleBackPress);
      
          return () => {
            BackHandler.removeEventListener("hardwareBackPress", handleBackPress);
          };
        }, [navigation])
      );


// Inside your component
useFocusEffect(
  useCallback(() => {
    
    const loadLastSearchedCity = async () => {
      try {
        const storedCityName = await AsyncStorage.getItem("lastSearchedCity");
        console.log("stcity", storedCityName)
        if (storedCityName) {
          setName(storedCityName);
        }
      } catch (error) {
        console.error("Error loading city name from local storage:", error);
      }
    };

    loadLastSearchedCity();
    if (name) {
      fetchWeather(name); 
    }

    return () => {};
  }, [name])
);

  // useEffect(() => {
  //   const loadLastSearchedCity = async () => {
  //     try {
  //       const storedCityName = await AsyncStorage.getItem("lastSearchedCity");
  //       console.log("stcity", storedCityName)
  //       if (storedCityName) {
  //         setName(storedCityName);
  //       }
  //     } catch (error) {
  //       console.error("Error loading city name from local storage:", error);
  //     }
  //   };

  //   loadLastSearchedCity();
  // }, []);

  // useEffect(() => {
  //   if (name) {
  //     fetchWeather(name); // Fetch weather when name is set
  //   }
  // }, [name]);

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <View className="flex-1 justify-center items-center">
          <LottieView
            source={require('../assets/jsons/loader.json')}
            autoPlay
            loop
            style={{ width: 300, height: 300 }}
          />
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="relative w-full">

        <View className=" flex-row items-center justify-between mt-2 px-4 ">
          <TouchableOpacity
            className="p-2 bg-transparent"
            onPress={() => navigation.navigate("WeatherForecastEng")}
          >
            <AntDesign
              name="left"
              size={24}
              color="#000502"
              onPress={() => navigation.navigate("WeatherForecastEng")}
              style={{ paddingHorizontal: wp(3), paddingVertical: hp(1.5), backgroundColor: "#F6F6F680" , borderRadius: 50 }}
              
            />
          </TouchableOpacity>
          <Text className="text-xl text-black text-center font-bold flex-1 mx-10 -ml-5">
            5 Days Forecast
          </Text>
        </View>
      </View>

      {/* Weather Details */}
      <ScrollView contentContainerStyle={{ padding: 5 }} className="mb-10 mt-6">
        {/* Tomorrow's Weather */}
        <TomorrowWeatherComponent
          item={tomorrowWeather as any}
          index={0} // Example index or any other data
        />

        {/* Weather Stats Cards */}
        <View className="flex-row justify-between mb-1 p-5">
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
            {/* Wind Icon */}
            <Image
              source={require("../assets/images/Wind.webp")} // Replace with your wind PNG image
              className="w-6 h-6"
            />
            <Text className="text-l font-bold ">
              {Math.round(weatherStats.wind)} km/h
            </Text>
            <Text
              style={{
                fontSize: isSmallScreen ? 13 : 16, // Adjust font size based on screen width
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
            {/* Humidity Icon */}
            <Image
              source={require("../assets/images/Water.webp")} // Replace with your humidity PNG image
              className="w-8 h-8"
            />
            <Text className="text-l font-bold ">
              {weatherStats.humidity}%
            </Text>
            <Text
              style={{
                fontSize: isSmallScreen ? 13 : 16, // Adjust font size based on screen width
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
            {/* Rain Icon */}
            <Image
              source={require("../assets/images/Rain.webp")} // Replace with your rain PNG image
              className="w-8 h-8"
            />
            <Text className="text-l font-bold ">
              {weatherStats.rain} mm
            </Text>
            <Text
              style={{
                fontSize: isSmallScreen ? 13 : 16, // Adjust font size based on screen width
                color: "#666",
              }}
            >
              Rain
            </Text>
          </View>
        </View>

        {/* Forecast Data */}

        {forecastData.map((item: ForecastItem, index: number) => {
          const date = new Date(item.dt_txt);
          const dayMonth = date.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
          });
          const dayOfWeek = date.toLocaleDateString("en-US", {
            weekday: "short",
          });

          return (
            <View
              key={index}
              className="flex-row justify-between items-center  p-4"
            >
              <View className="items-center">
                <Text className="text-lg text-black font-bold">{dayMonth}</Text>
                <Text className="text-sm ">{dayOfWeek}</Text>
              </View>
              <Image
                source={getWeatherImage(
                  item.weather[0].id,
                  item.weather[0].icon
                )}
                className="w-10 h-10"
                resizeMode="contain"
              />
              <Text className="text-base text-gray-500 ">{item.weather[0].main}</Text>
              <Text className="text-base font-bold text-gray-500 ">{Math.round(item.main.temp)}°C</Text>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

export default FiveDayForecastEng;
