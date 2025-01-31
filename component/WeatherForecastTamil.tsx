import React, { useState, useEffect } from "react";
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
} from "react-native";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import debounce from "lodash.debounce";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "./types";
import NavigationBar from "@/Items/NavigationBar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Dimensions ,StyleSheet} from "react-native";
import axios from "axios";

const { width } = Dimensions.get("window"); // Get the screen width

const isSmallScreen = width < 400; // Check if the screen width is smaller than 400 pixels

type WeatherForecastTamilNavigationProps = StackNavigationProp<
  RootStackParamList,
  "WeatherForecastTamil"
>;

interface WeatherForecastTamilProps {
  navigation: WeatherForecastTamilNavigationProps;
}

const WeatherForecastTamil: React.FC<WeatherForecastTamilProps> = ({
  navigation,
}) => {
  const route = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);

  const apiKey = '8561cb293616fe29259448fd098f654b'; // Replace with your OpenWeatherMap API key

  const fetchWeather = async (lat: number, lon: number) => {
    setLoading(true);
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
                alert('No forecast data available.');
            }
        } else {
            setWeatherData(null);
            alert('Location not found.');
        }
    } catch (error) {
        console.error('Error fetching weather data:', error);
        alert('An error occurred while fetching weather data.');
    } finally {
        setLoading(false);
    }
};


  const getCityNameFromCoords = async (lat: number, lon: number) => {
    try {
      const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`);
      return response.data.name; 
    } catch (error) {
      console.error('Error fetching city name from coordinates:', error);
      return null;
    }
  };

  useEffect(() => {
    console.log('====================================');
    console.log("Screen width is...", width);
    console.log('====================================');
  
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocationPermissionDenied(true);
          Alert.alert(
            'Permission Denied',
            'Location access is required to fetch weather data for your current location. You can search for a location manually.',
            [{ text: 'OK' }]
          );
          return;
        }
  
        const location = await Location.getCurrentPositionAsync({});
        fetchWeather(location.coords.latitude, location.coords.longitude);
  
        // Clear suggestions since location data is automatically fetched
        setSuggestions([]);
  
        // Optionally store the last fetched location's city name
        const cityName = await getCityNameFromCoords(location.coords.latitude, location.coords.longitude);
        if (cityName) {
          try {
            await AsyncStorage.setItem('lastSearchedCity', cityName);
            console.log(`Stored ${cityName} as last searched city from location`);
          } catch (error) {
            console.error('Error storing city name in local storage:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching current location:', error);
        Alert.alert('Error', 'Unable to fetch current location.');
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
        `http://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${apiKey}`
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
          console.log('Weather data already loaded, skipping suggestions.');
        }
        
      } else {
        setSuggestions([]);
        console.warn('No suggestions found for this location.');
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };
  

  
  const debouncedFetchSuggestions = debounce(fetchSuggestions, 500);

  const handleSuggestionPress = async (lat: number, lon: number, name: string) => {
    setSearchQuery(name);
    fetchWeather(lat, lon);
    
    // Clear the suggestions
    setSuggestions([]);
    
    try {
      await AsyncStorage.setItem('lastSearchedCity', name);
      console.log(`Stored ${name} in local storage`);
    } catch (error) {
      console.error('Error storing city name in local storage:', error);
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
      if (status !== 'granted') {
        setLocationPermissionDenied(true);
        Alert.alert(
          'Permission Denied',
          'Location access is required to fetch weather data for your current location. You can search for a location manually.',
          [{ text: 'OK' }]
        );
        return;
      }
  
      // Get the user's current location
      const location = await Location.getCurrentPositionAsync({});
      const cityName = await getCityNameFromCoords(location.coords.latitude, location.coords.longitude);
  
      if (cityName) {
        // Do not set the search query to the city name (keeping it empty)
        // setSearchQuery(cityName); // Remove this line to prevent city name in search box
  
        // Fetch weather data for the current location
        fetchWeather(location.coords.latitude, location.coords.longitude);
  
        // Optionally store the current city as the last searched city in local storage
        try {
          await AsyncStorage.setItem('lastSearchedCity', cityName);
          console.log(`Stored ${cityName} as last searched city from location`);
        } catch (error) {
          console.error('Error storing city name in local storage:', error);
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
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        
        // Fetch weather data directly for the current location
        fetchWeather(location.coords.latitude, location.coords.longitude);
        
        // Clear suggestions without updating the search box
        setSuggestions([]);
      } else {
        Alert.alert(
          'Permission Denied',
          'Location access is required to fetch weather data for your current location. You can search for a location manually.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert('Error', 'Unable to fetch current location.');
    }
  };
  

  const getCurrentTimeDate = (): string => {
    const now = new Date();
    const dateOptions: Intl.DateTimeFormatOptions = {
      month: 'long', 
      day: '2-digit', 
      weekday: 'short', 
    };
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false, 
    };

    const date = now.toLocaleDateString('en-US', dateOptions);
    const time = now.toLocaleTimeString('en-US', timeOptions);

    return `${date} ${time}`;
  };

  const getWeatherImage = (id: number, icon: string): any => {
    const iconString = typeof icon === 'string' ? icon : '';
    const isDayTime = iconString.includes('d');

    try {
      if (id === 800) {
        return isDayTime
          ? require('../assets/images/weather icons/daytime/sunny.webp')
          : require('../assets/images/weather icons/night-time/night-clear sky.webp');
      } else if (id >= 800 && id <= 804) {
        return isDayTime
          ? require('../assets/images/weather icons/daytime/partly cloudy.webp')
          : require('../assets/images/weather icons/night-time/Partly Cloudy - night.webp');
      } else if (id >= 200 && id <= 232) {
        return isDayTime
          ? require('../assets/images/weather icons/daytime/thunderclouds.webp')
          : require('../assets/images/weather icons/night-time/night-thunderclouds.webp');
      } else if (id >= 500 && id <= 531) {
        return isDayTime
          ? require('../assets/images/weather icons/daytime/heavy rain.webp')
          : require('../assets/images/weather icons/night-time/night-heavy rain.webp');
      } else if (id === 701) {
        return isDayTime
          ? require('../assets/images/weather icons/daytime/mist.webp')
          : require('../assets/images/weather icons/night-time/mist-nightsky.webp');
      } else if (id >= 600 && id <= 622) {
        return require('../assets/images/weather icons/daytime/snow.webp'); 
      }
    } catch (error) {
      console.error('Error loading image:', error);
    }
  };
  
  const getWeatherName = (id:any, icon:any) => {
    const iconString = typeof icon === 'string' ? icon : '';
    const isDayTime = iconString.includes('d');
    
    try {
      if (id === 800) {
        return isDayTime ? 'சன்னி' : 'தெளிவான வானம்';
      } else if (id >= 800 && id <= 804) {
        if (id === 801 || id === 802) {
          return isDayTime ? 'ஓரளவு மேகமூட்டம்' : 'ஓரளவு மேகமூட்டம்';
        } else {
          return isDayTime ? 'மேகமூட்டம்' : 'மேகமூட்டம்';
        }
      } else if (id >= 200 && id <= 232) {
        if (id === 210 || id === 211 || id === 212 || id === 221) {
          return isDayTime ? 'இடி மேகங்கள்' : 'இடி மேகங்கள்';
        } else {
          return isDayTime ? 'இடியுடன் கூடிய மழை' : 'இடியுடன் கூடிய மழை';
        }
      } else if (id >= 500 && id <= 531) {
        if (id === 502 || id === 504 || id === 503 || id === 522 || id === 511) {
          return isDayTime ? 'கனமழை' : 'கனமழை';
        } else {
          return isDayTime ? 'ஓரளவு மழை' : 'ஓரளவு மழை';
        }
      } else if (id === 701) {
        return isDayTime ? 'மூடுபனி' : 'மூடுபனி';
      } else if (id >= 600 && id <= 622) {
        return isDayTime ? 'பனி' : 'பனி';
      } else {
        // Return default name if needed
        return isDayTime ? 'ස්ථානයක්' : 'රාත්‍රී ස්ථානයක්';
      }
    } catch (error) {
      console.error('Error getting weather name:', error);
      // Return a default name in case of an error
      return 'අනීතික වාතාවරණය';
    }
  };
  



  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="flex-1 bg-white">
      <View className="relative w-full">
  <Image
    source={require('../assets/images/upper.webp')}
    className="w-full h-40 mt-0"
    resizeMode="contain"
  />
  <View className="absolute top-0 left-0 right-0 flex-row items-center justify-between mt-5 px-4 pt-4">
    <TouchableOpacity className="p-2 bg-transparent">
      <AntDesign name="left" size={24} color="#000502" onPress={() => navigation.goBack()} />
    </TouchableOpacity>
    <View className="relative flex-1">
      <View className="flex-row items-center bg-gray-200 rounded-lg px-4 max-w-[300px]">
        <TextInput
          className="flex-1 h-10 text-lg text-black"
          placeholder="உங்கள் முகவரி "
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={handleInputChange}
        />
        <Ionicons name="search" size={24} color="black" className="ml-2" />
      </View>

      {suggestions.length > 0 && (
        <View style={[styles.suggestionsContainer]} className="absolute top-12 left-0 right-0 bg-white shadow-lg rounded-lg">
          <FlatList
            data={suggestions}
            keyExtractor={(item) => `${item.lat}-${item.lon}`}
            renderItem={({ item }) => (
              <TouchableWithoutFeedback
                onPress={() => handleSuggestionPress(item.lat, item.lon, item.name)}
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
    <TouchableOpacity className="p-2 bg-transparent ml-2" onPress={handleLocationIconPress}>
      <Image
        source={require('../assets/images/location.webp')}
        style={{ width: 24, height: 24 }}
        resizeMode="contain"
      />
    </TouchableOpacity>
  </View>
</View>

        {/* Scrollable content */}
        <ScrollView contentContainerStyle={{ flexGrow: 1, zIndex: 1 }}>
 

          <View className="p-1 pt-0 mt-0 pb-2">
            {loading ? (
              <ActivityIndicator size="large" color="#0000ff" />
            ) : weatherData ? (
              <View className="items-center">
                <Image
               source={getWeatherImage(weatherData.weather[0].id, weatherData.weather[0].icon)}
                className="w-20 h-20"
                resizeMode="contain"
              />
            <Text className="text-4xl font-bold mb-2 mt-4">{weatherData.main.temp}°C</Text>
             <Text className="text-lg mb-4">
             {getWeatherName(weatherData.weather[0].id, weatherData.weather[0].icon)}
            </Text>
            <Text className="text-lg font-bold mb-2">
              {weatherData.name}, {weatherData.sys.country}
            </Text>
            <Text className="text-l text-gray-700 mb-0">{getCurrentTimeDate()}</Text>

                <View className="flex-row justify-between p-5 pb-0">
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
                    <Image
                      source={require("../assets/images/Wind.webp")}
                      className="w-8 h-8"
                      resizeMode="contain"
                    />
                    <Text className="text-l font-bold mt-2">
                      {weatherData.wind.speed} m/s
                    </Text>
                    <Text
                      style={{
                        fontSize: isSmallScreen ? 13 : 16,
                        color: "#666",
                      }}
                    >
                      காற்று
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
                    <Image
                      source={require("../assets/images/Water.webp")}
                      className="w-8 h-8"
                      resizeMode="contain"
                    />
                    <Text className="text-l font-bold mt-2">
                      {weatherData.main.humidity}%
                    </Text>
                    <Text
                      style={{
                        fontSize: isSmallScreen ? 13 : 16,
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
                    <Image
                      source={require("../assets/images/Rain.webp")}
                      className="w-8 h-8"
                      resizeMode="contain"
                    />
                    <Text className="text-l font-bold mt-2">
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
                      மழை
                    </Text>
                  </View>
                </View>

                <ScrollView className="mt-4">
                  <View className="flex-row justify-between items-center px-4">
                    <Text className="text-l mb-2 font-bold">இன்றைய நாள்</Text>
                    <TouchableOpacity
                      className="p-2"
                      onPress={() => {
                        if (weatherData) {
                          navigation.navigate("FiveDayForecastTamil");
                        } else {
                          alert("No location selected");
                        }
                      }}
                    >
                      <Text className="text-l mb-2 font-bold">
                        அடுத்த ஐந்து நாட்கள்
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {forecastData.length > 0 ? (
                    <FlatList
                      data={forecastData.filter((_, index) => index % 3 === 0)}
                      horizontal
                      keyExtractor={(item) => item.dt.toString()}
                      renderItem={({ item }) => (
                        <View
                          className="bg-white p-4 rounded-lg shadow-lg mx-2 items-center"
                          style={{
                            shadowColor: "gray",
                            shadowOffset: { width: 1, height: 2 },
                            shadowOpacity: 0.8,
                            shadowRadius: 4,
                            elevation: 2,
                          }}
                        >
                          <Image
                            source={getWeatherImage(
                              item.weather[0].id,
                              item.weather[0].icon
                            )}
                            className="w-9 h-9"
                            resizeMode="contain"
                          />
                          <Text className="text-xl font-bold mb-1">
                            {item.main.temp}°C
                          </Text>
                          <Text className="text-gray-600">
                            {new Date(item.dt * 1000).toLocaleTimeString()}
                          </Text>
                        </View>
                      )}
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{ paddingHorizontal: 10 }}
                    />
                  ) : (
                    <Text className="text-center text-lg text-gray-700">
                      முன்னறிவிப்பு தரவு இல்லை
                    </Text>
                  )}
                </ScrollView>
              </View>
            ) : (
              <Text style={{ textAlign: "center" }}>
                வானிலை தரவு இல்லை! . மீண்டும் முயற்சிக்கவும்
              </Text>
            )}
          </View>
        </ScrollView>

        {/* <View className="flex-none">
          <NavigationBar navigation={navigation} />
        </View> */}
      </View>
    </SafeAreaView>
  );
};

export default WeatherForecastTamil;
const styles = StyleSheet.create({
  suggestionsContainer: {
    zIndex: 50, // Ensures it appears above other components
    elevation: 5, // For Android
    maxHeight: 200, // Prevents the dropdown from exceeding the screen
  },
});
