import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  Alert,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import NavigationBar from "@/Items/NavigationBar";
import { StackNavigationProp } from "@react-navigation/stack/lib/typescript/src/types";
import { RootStackParamList } from "./types";
import { useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AntDesign from "react-native-vector-icons/AntDesign";

import { Dimensions, StyleSheet } from "react-native";

const { width } = Dimensions.get("window"); // Get the screen width

const isSmallScreen = width < 400; // Check if the screen width is smaller than 350 pixels

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
  item: TomorrowWeather; // Replace `ForecastItem` with the correct type for `item`
  index: number;
}

const TomorrowWeatherComponent: React.FC<WeatherComponentProps> = ({
  item,
  index,
}) => {
  const [loading, setLoading] = useState(false);

  return (
    <View className="flex-row items-center justify-between mb-1 ml-20">
      <Image
        source={getWeatherImage(item.weatherId, item.icon)}
        className="w-20 h-20"
        resizeMode="contain"
      />
      <View className="flex-1 ml-4">
        <Text className="text-3xl font-bold">Tomorrow</Text>
        <Text className="text-base mt-2 ml-5">
          <Text className="text-3xl">{Math.round(item.minTemp)}°C</Text> /
          <Text className="text-base">{Math.round(item.maxTemp)}°C</Text>
        </Text>
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
        ? require("../assets/images/weather icons/daytime/sunny.png")
        : require("../assets/images/weather icons/night-time/night-clear sky.png");
    }

    // Cloudy weather
    else if (id >= 800 && id <= 804) {
      if (id === 801 || id === 802) {
        return isDayTime
          ? require("../assets/images/weather icons/daytime/partly cloudy.png")
          : require("../assets/images/weather icons/night-time/Partly Cloudy - night.png");
      } else {
        return isDayTime
          ? require("../assets/images/weather icons/daytime/cloudy.png")
          : require("../assets/images/weather icons/night-time/cloudy-night.png");
      }
    }

    // Thunderstorms
    else if (id >= 200 && id <= 232) {
      if (id === 210 || id === 211 || id === 212 || id === 221) {
        return isDayTime
          ? require("../assets/images/weather icons/daytime/thunderclouds.png")
          : require("../assets/images/weather icons/night-time/night-thunderclouds.png");
      } else {
        return isDayTime
          ? require("../assets/images/weather icons/daytime/thunderstorms.png")
          : require("../assets/images/weather icons/night-time/night-thunderstorms.png");
      }
    }

    // Rain
    else if (id >= 500 && id <= 531) {
      if (id === 502 || id === 504 || id === 503 || id === 522 || id === 511) {
        return isDayTime
          ? require("../assets/images/weather icons/daytime/heavy rain.png")
          : require("../assets/images/weather icons/night-time/night-heavy rain.png");
      } else {
        return isDayTime
          ? require("../assets/images/weather icons/daytime/partly rainy.png")
          : require("../assets/images/weather icons/night-time/night-partly-rainy.png");
      }
    }

    // Mist
    else if (id === 701) {
      return isDayTime
        ? require("../assets/images/weather icons/daytime/mist.png")
        : require("../assets/images/weather icons/night-time/mist-nightsky.png");
    }

    // Snow
    else if (id >= 600 && id <= 622) {
      return require("../assets/images/weather icons/daytime/snow.png"); // Assuming snow icon is the same for day/night
    }

    // Fallback in case no match
    return isDayTime;
    //   ? require('../assets/images/weather icons/daytime/default.png')
    //   : require('../assets/images/weather icons/night-time/default.png');
  } catch (error) {
    console.error("Error loading image:", error);
    // Return a default image in case of an error
    // return require('../assets/images/weather icons/default.png');
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

      setForecastData(fiveDayForecast);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      setError("Failed to fetch weather data");
    } finally {
      setLoading(false); // Stop loading after data is fetched
    }
  };

  useEffect(() => {
    const loadLastSearchedCity = async () => {
      try {
        const storedCityName = await AsyncStorage.getItem("lastSearchedCity");
        if (storedCityName) {
          setName(storedCityName);
          console.log(storedCityName);
        }
      } catch (error) {
        console.error("Error loading city name from local storage:", error);
      }
    };

    loadLastSearchedCity();
  }, []);

  useEffect(() => {
    if (name) {
      fetchWeather(name); // Fetch weather when name is set
    }
  }, [name]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#00ff00" />
        <Text>Loading weather data...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="relative w-full">
        <Image
          source={require("../assets/images/upper.jpeg")}
          className="w-full h-40 mt-0"
        />
        <View className="absolute top-0 left-0 right-0 flex-row items-center justify-between mt-4 px-4 pt-4">
          <TouchableOpacity
            className="p-2 bg-transparent"
            onPress={() => navigation.navigate("WeatherForecastEng")}
          >
            <AntDesign
              name="left"
              size={24}
              color="#000502"
              onPress={() => navigation.navigate("WeatherForecastEng")}
            />
          </TouchableOpacity>
          <Text className="text-2xl text-black text-center font-bold flex-1 mx-10">
            5 Days Forecast
          </Text>
        </View>
      </View>

      {/* Weather Details */}
      <ScrollView contentContainerStyle={{ padding: 5 }}>
        {/* Tomorrow's Weather */}
        <TomorrowWeatherComponent
          item={tomorrowWeather as any}
          index={0} // Example index or any other data
        />

        {/* Weather Stats Cards */}
        <View className="flex-row justify-between mb-1 p-5">
          <View
            className="bg-white p-4 rounded-l shadow-lg flex-1 mx-2 items-center"
            style={{
              shadowColor: "grey",
              shadowOffset: { width: 1, height: 2 },
              shadowOpacity: 0.9,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            {/* Wind Icon */}
            <Image
              source={require("../assets/images/Wind.png")} // Replace with your wind PNG image
              className="w-8 h-8"
            />
            <Text className="text-l font-bold mt-2">
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
            className="bg-white p-4 rounded-l shadow-lg flex-1 mx-2 items-center"
            style={{
              shadowColor: "grey",
              shadowOffset: { width: 1, height: 2 },
              shadowOpacity: 0.9,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            {/* Humidity Icon */}
            <Image
              source={require("../assets/images/Water.png")} // Replace with your humidity PNG image
              className="w-8 h-8"
            />
            <Text className="text-l font-bold mt-2">
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
            className="bg-white p-4 rounded-l shadow-lg flex-1 mx-2 items-center"
            style={{
              shadowColor: "grey",
              shadowOffset: { width: 1, height: 2 },
              shadowOpacity: 0.9,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            {/* Rain Icon */}
            <Image
              source={require("../assets/images/Rain.png")} // Replace with your rain PNG image
              className="w-8 h-8"
            />
            <Text className="text-l font-bold mt-2">
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
              className="flex-row justify-between items-center mb-4 p-4"
            >
              <View>
                <Text className="text-xl text-black font-bold">{dayMonth}</Text>
                <Text className="text-base ml-5">{dayOfWeek}</Text>
              </View>
              <Image
                source={getWeatherImage(
                  item.weather[0].id,
                  item.weather[0].icon
                )}
                className="w-12 h-12"
                resizeMode="contain"
              />
              <Text className="text-base">{item.weather[0].main}</Text>
              <Text className="text-base">{Math.round(item.main.temp)}°C</Text>
            </View>
          );
        })}

        {/* Bottom Navigation Bar */}
      </ScrollView>
      {/* <View>
        <NavigationBar navigation={navigation} />
      </View> */}
    </SafeAreaView>
  );
};

export default FiveDayForecastEng;
