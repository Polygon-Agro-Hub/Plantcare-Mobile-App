import React, { useEffect, useState , useCallback} from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, BackHandler } from "react-native";
import axios from "axios";
import { useRouter } from "expo-router";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "./types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AntDesign } from "@expo/vector-icons";
import { Dimensions, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

const { width } = Dimensions.get("window");

const isSmallScreen = width < 400;

type FiveDayForecastTamilNavigationProp = StackNavigationProp<
  RootStackParamList,
  "FiveDayForecastTamil"
>;

interface Props {
  navigation: FiveDayForecastTamilNavigationProp;
}

interface TomorrowWeather {
  weatherId: number;
  icon: string;
  minTemp: number;
  maxTemp: number;
}

interface WeatherProps {
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
  return (
    <View className="flex-row items-center justify-between mb-1 ml-20">
      <Image
        source={getWeatherImage(item.weatherId, item.icon)}
        className="w-20 h-20"
        resizeMode="contain"
      />
      <View className="flex-1 ml-4">
        <Text className="text-xl">நாளை</Text>
        <Text className="text-base  mt-2">
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

    // Fallback in case no match
    return isDayTime;
  } catch (error) {
    console.error("Error loading image:", error);
  }
};

const getWeatherName = (id: number, icon: string): string => {
  const iconString = typeof icon === "string" ? icon : "";
  const isDayTime = iconString.includes("d");

  try {
    if (id === 800) {
      return isDayTime ? "சன்னி" : "தெளிவான வானம்";
    } else if (id >= 800 && id <= 804) {
      if (id === 801 || id === 802) {
        return isDayTime ? "ஓரளவு மேகமூட்டம்" : "ஓரளவு மேகமூட்டம்";
      } else {
        return isDayTime ? "மேகமூட்டம்" : "மேகமூட்டம்";
      }
    } else if (id >= 200 && id <= 232) {
      if (id === 210 || id === 211 || id === 212 || id === 221) {
        return isDayTime ? "இடி மேகங்கள்" : "இடி மேகங்கள்";
      } else {
        return isDayTime ? "இடியுடன் கூடிய மழை" : "இடியுடன் கூடிய மழை";
      }
    } else if (id >= 500 && id <= 531) {
      if (id === 502 || id === 504 || id === 503 || id === 522 || id === 511) {
        return isDayTime ? "கனமழை" : "கனமழை";
      } else {
        return isDayTime ? "ஓரளவு மழை" : "ஓரளவு மழை";
      }
    } else if (id === 701) {
      return isDayTime ? "மூடுபனி" : "மூடுபனி";
    } else if (id >= 600 && id <= 622) {
      return isDayTime ? "பனி" : "பனி";
    } else {
      // Return default name if needed
      return isDayTime ? "ස්ථානයක්" : "රාත්‍රී ස්ථානයක්";
    }
  } catch (error) {
    console.error("Error getting weather name:", error);
    // Return a default name in case of an error
    return "අනීතික වාතාවරණය";
  }
};

// Replace the API_KEY import with the actual API key string
const API_KEY = "8561cb293616fe29259448fd098f654b";

const FiveDayForecastTamil: React.FC<Props> = ({ navigation }) => {
  const [forecastData, setForecastData] = useState([]);
  const [tomorrowWeather, setTomorrowWeather] = useState({});
  const [weatherStats, setWeatherStats] = useState({
    wind: 0,
    humidity: 0,
    rain: 0,
  });
  const route = useRouter();
  const [name, setName] = useState("");
  const fetchWeather = async (name: string): Promise<void> => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${name}&appid=${API_KEY}`
      );

      const data = response.data;
      const tomorrowWeather: ForecastItem = data.list[1]; // Assuming this is the data for tomorrow

      // Convert temperatures from Kelvin to Celsius for tomorrow's weather
      const tempCelsius = tomorrowWeather.main.temp - 273.15;
      const minTempCelsius = tomorrowWeather.main.temp_min - 273.15;
      const maxTempCelsius = tomorrowWeather.main.temp_max - 273.15;

      // Set the weather details for tomorrow
      setTomorrowWeather({
        temp: tempCelsius.toFixed(2), // Rounded to 2 decimal places
        minTemp: minTempCelsius.toFixed(2),
        maxTemp: maxTempCelsius.toFixed(2),
        weatherId: tomorrowWeather.weather[0].id,
        icon: tomorrowWeather.weather[0].icon,
      });

      // Extract wind, humidity, and rain from the first available entry
      const firstEntry: ForecastItem = data.list[0];
      setWeatherStats({
        wind: firstEntry.wind.speed,
        humidity: firstEntry.main.humidity,
        rain: firstEntry.rain ? firstEntry.rain["3h"] : 0,
      });

      // Filter the forecast data for the next 5 days and convert temperatures to Celsius
      const fiveDayForecast = data.list
        .filter((item: ForecastItem, index: number) => index % 8 === 0)
        .slice(0, 5)
        .map((item: ForecastItem) => ({
          ...item,
          main: {
            ...item.main,
            temp: (item.main.temp - 273.15).toFixed(2), // Convert temperature to Celsius
            temp_min: (item.main.temp_min - 273.15).toFixed(2), // Convert min temperature to Celsius
            temp_max: (item.main.temp_max - 273.15).toFixed(2), // Convert max temperature to Celsius
          },
        }));

      setForecastData(fiveDayForecast);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      setError("Failed to fetch weather data");
    } finally {
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   const loadLastSearchedCity = async () => {
  //     try {
  //       const storedCityName = await AsyncStorage.getItem("lastSearchedCity");
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


   useFocusEffect(
            useCallback(() => {
              const handleBackPress = () => {
                navigation.navigate("WeatherForecastTamil") // Fixed: removed the object wrapper
                return true;
              };
          
              const backHandler = BackHandler.addEventListener("hardwareBackPress", handleBackPress);
          
              return () => {
                backHandler.remove();
              };
            }, [navigation])
          );

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
  const API_KEY = "8561cb293616fe29259448fd098f654b";

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="relative w-full">
        <Image
          source={require("../assets/images/upper.webp")}
          className="w-full h-40 mt-0"
        />
        <View className="absolute top-0 left-0 right-0 flex-row items-center justify-between mt-2 px-4 pt-4">
          <TouchableOpacity
            className="p-2 bg-transparent"
            onPress={() => navigation.navigate("WeatherForecastTamil")}
          >
            <AntDesign name="left" size={24} color="#000000" />
          </TouchableOpacity>
          <Text className="text-2xl text-black text-center font-bold flex-1 mx-10">
            5 நாட்கள் முன்னறிவிப்பு
          </Text>
        </View>
      </View>

      {/* Weather Details */}
      <ScrollView contentContainerStyle={{ padding: 5 }} className="mb-10">
        {/* Tomorrow's Weather Component */}
        <TomorrowWeatherComponent
          item={tomorrowWeather as any}
          index={0} // Example index or any other data
        />

        {/* Weather Stats Cards */}
        <View className="flex-row justify-between mb-1 p-5">
          <View
            className="bg-white p-4 rounded-l shadow-lg flex-1 mx-1 items-center"
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
              source={require("../assets/images/Wind.webp")} // Replace with your wind PNG image
              className="w-8 h-8"
              resizeMode="contain"
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
              காற்று
            </Text>
          </View>

          <View
            className="bg-white p-4 rounded-l shadow-lg flex-1 mx-1 items-center"
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
              source={require("../assets/images/Water.webp")} // Replace with your humidity PNG image
              className="w-8 h-8"
              resizeMode="contain"
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
              ஈரப்பதம்
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
              source={require("../assets/images/Rain.webp")} // Replace with your rain PNG image
              className="w-8 h-8"
              resizeMode="contain"
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
              மழை
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
              <Text className="text-base">
                {getWeatherName(item.weather[0].id, item.weather[0].icon)}
              </Text>
              <Text className="text-base">{Math.round(item.main.temp)}°C</Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default FiveDayForecastTamil;
function setError(arg0: string) {
  throw new Error("Function not implemented.");
}

function setLoading(arg0: boolean) {
  throw new Error("Function not implemented.");
}

function setName(storedCityName: any) {
  throw new Error("Function not implemented.");
}
