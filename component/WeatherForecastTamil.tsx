import React, { useState, useEffect } from 'react';
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
  Alert
} from 'react-native';
import * as Location from 'expo-location';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import debounce from 'lodash.debounce';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './types';
import NavigationBar from '@/Items/NavigationBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router';


type WeatherForecastTamilNavigationProps = StackNavigationProp<RootStackParamList , 'WeatherForecastTamil'>

interface  WeatherForecastEngProps {
    navigation:WeatherForecastTamilNavigationProps
}
const WeatherForecastTamil: React.FC<WeatherForecastEngProps> = ({navigation}) => {
  const route = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);

  const apiKey = '8561cb293616fe29259448fd098f654b'; // Replace with your OpenWeatherMap API key



  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationPermissionDenied(true);
        Alert.alert(
          'அனுமதி மறுக்கப்பட்டது',
          'உங்கள் தற்போதைய இருப்பிடத்திற்கான வானிலைத் தரவைப் பெற இருப்பிட அணுகல் தேவை. நீங்கள் ஒரு இடத்தை கைமுறையாகத் தேடலாம்.',
          [{ text: 'OK' }]
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      fetchWeather(location.coords.latitude, location.coords.longitude);
    })();
  }, []);

  const fetchSuggestions = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      const response = await fetch(
        `http://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${apiKey}`
      );
      const data = await response.json();
      if (data.length > 0) {
        setSuggestions(data);
      } else {
        setSuggestions([]);
        console.warn('No suggestions found for this location.');
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const debouncedFetchSuggestions = debounce(fetchSuggestions, 500);

  const fetchWeather = async (lat: number, lon: number) => {
    setLoading(true);
    try {
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
      );
      const weatherData = await weatherResponse.json();

      if (weatherResponse.ok && weatherData) {
        setWeatherData(weatherData);
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
      alert('வானிலைத் தரவைப் பெறும்போது பிழை ஏற்பட்டது.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionPress = async (lat: number, lon: number, name: string) => {
    setSearchQuery(name);
    fetchWeather(lat, lon);
    setSuggestions([]);
    
    try {
      // Store the name in AsyncStorage
      await AsyncStorage.setItem('lastSearchedCity', name);
      console.log(`Stored ${name} in local storage`);
    } catch (error) {
      console.error('Error storing city name in local storage:', error);
    }
  };

  // Optionally, retrieve the last searched city name when the component mounts
  useEffect(() => {
    const loadLastSearchedCity = async () => {
      try {
        const storedCityName = await AsyncStorage.getItem('lastSearchedCity');
        if (storedCityName) {
          setSearchQuery(storedCityName);
          console.log(`Loaded ${storedCityName} from local storage`);
        }
      } catch (error) {
        console.error('Error loading city name from local storage:', error);
      }
    };

    loadLastSearchedCity();
  }, []);

  useEffect(() => {
    debouncedFetchSuggestions(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    debouncedFetchSuggestions(searchQuery);
  }, [searchQuery]);



  const handleLocationIconPress = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const location = await Location.getCurrentPositionAsync({});
      fetchWeather(location.coords.latitude, location.coords.longitude);
    } else {
        Alert.alert(
            'அனுமதி மறுக்கப்பட்டது',
            'உங்கள் தற்போதைய இருப்பிடத்திற்கான வானிலைத் தரவைப் பெற இருப்பிட அணுகல் தேவை. நீங்கள் ஒரு இடத்தை கைமுறையாகத் தேடலாம்.',
            [{ text: 'OK' }]
          );
    }
  };

 
  const getCurrentTimeDate = (): string => {
    const now = new Date();
    
    // Define the date options with correct typings for DateTimeFormatOptions
    const dateOptions: Intl.DateTimeFormatOptions = {
      month: 'long',      // Full month name (e.g., August)
      day: '2-digit',     // 2-digit day (e.g., 26)
      weekday: 'short',   // Short weekday name (e.g., Mon, Tue)
    };
    
    // Define the time options with correct typings for DateTimeFormatOptions
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',    // 2-digit hour (e.g., 14)
      minute: '2-digit',  // 2-digit minute (e.g., 05)
      hour12: false,      // 24-hour format (e.g., 14:05)
    };

    // Get formatted date and time
    const date = now.toLocaleDateString('en-US', dateOptions);
    const time = now.toLocaleTimeString('en-US', timeOptions);

    // Return formatted date and time as a single string
    return `${date} ${time}`;
};

  const getWeatherImage = (id:any, icon:any) => {
    const iconString = typeof icon === 'string' ? icon : '';
    const isDayTime = iconString.includes('d');
  
    try {
      if (id === 800) {
        return isDayTime ? require('../assets/images/weather icons/daytime/sunny.png') : require('../assets/images/weather icons/night-time/night-clear sky.png');
      } else if (id >= 800 && id <= 804) {
        if (id === 801 || id === 802) {
          return isDayTime ? require('../assets/images/weather icons/daytime/partly cloudy.png') : require('../assets/images/weather icons/night-time/Partly Cloudy - night.png');
        } else {
          return isDayTime ? require('../assets/images/weather icons/daytime/cloudy.png') : require('../assets/images/weather icons/night-time/cloudy-night.png');
        }
      } else if (id >= 200 && id <= 232) {
        if (id === 210 || id === 211 || id === 212 || id === 221) {
          return isDayTime ? require('../assets/images/weather icons/daytime/thunderclouds.png') : require('../assets/images/weather icons/night-time/night-thunderclouds.png');
        } else {
          return isDayTime ? require('../assets/images/weather icons/daytime/thunderstorms.png') : require('../assets/images/weather icons/night-time/night-thunderstorms.png');
        }
      } else if (id >= 500 && id <= 531) {
        if (id === 502 || id === 504 || id === 503 || id === 522 || id === 511) {
          return isDayTime ? require('../assets/images/weather icons/daytime/heavy rain.png') : require('../assets/images/weather icons/night-time/night-heavy rain.png');
        } else {
          return isDayTime ? require('../assets/images/weather icons/daytime/partly rainy.png') : require('../assets/images/weather icons/night-time/night-partly-rainy.png');
        }
      } else if (id === 701) {
        return isDayTime ? require('../assets/images/weather icons/daytime/mist.png') : require('../assets/images/weather icons/night-time/mist-nightsky.png');
      } else if (id >= 600 && id <= 622) {
        return isDayTime ? require('../assets/images/weather icons/daytime/snow.png') : require('../assets/images/weather icons/night-time/snow.png');
      } else {
        // Fallback image
        // return isDayTime ? require('../assets/images/weather icons/daytime/default.png') : require('../assets/images/weather icons/night-time/default.png');
      }
    } catch (error) {
      console.error('Error loading image:', error);
      // // Return a default image in case of an error
      // return require('../assets/images/weather icons/default.png');
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
  


  return  (
    <View className="flex-1 bg-white">
      <View className="relative w-full">
        <Image
          source={require('../assets/images/upper.jpeg')}
          className="w-full h-40 mt-0"
        />
        <View className="absolute top-0 left-0 right-0 flex-row items-center justify-between mt-5 px-4 pt-4">
          <TouchableOpacity
            className="p-2 bg-transparent" onPress={() => route.back()}
            // onPress={() => route.push('/profile')}
          >
            <AntDesign
              name="left"
              size={24}
              color="#000000"
            />
          </TouchableOpacity>

          <View className="flex-row items-center bg-gray-200 rounded-lg px-4 ml-2 flex-1 max-w-[300px]">
            <TextInput
              className="flex-1 h-10 text-lg text-black"
              placeholder="உங்கள் முகவரி "
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <Ionicons name="search" size={24} color="black" className="ml-2" />
          </View>

          <TouchableOpacity
            className="p-2 bg-transparent ml-2s"
            onPress={handleLocationIconPress}
          >
            <Image
              source={require('../assets/images/location.png')}  // Replace with your location icon path
              style={{ width: 24, height: 24 }}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Location Suggestions */}
      {suggestions.length > 0 && (
        <View className="absolute top-28 left-6 right-6 bg-white shadow-lg rounded-lg z-50">
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

      {/* Weather Information */}
      <View className="p-1 pt-0 mt-0">
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : weatherData ? (
          <View className="items-center">
            {/* Display weather image and data */}
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

            {/* Weather Details Cards */}
            <View className="flex-row justify-between p-5 pb-0">
              <View
                className="bg-white p-4 rounded-l shadow-lg flex-1 mx-2 items-center"
                style={{
                  shadowColor: 'grey',
                  shadowOffset: { width: 1, height: 2 },
                  shadowOpacity: 0.9,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
               <Image
                    source={require('../assets/images/Wind.png')}  // Replace with your rain PNG image
                    className="w-8 h-8"
                    resizeMode="contain"
                  />
                <Text className="text-l font-bold mt-2">
                  {weatherData.wind.speed} m/s
                </Text>
                <Text className="text-base text-gray-600">காற்று</Text>
              </View>
              <View
                className="bg-white p-4 rounded-l shadow-lg flex-1 mx-2 items-center"
                style={{
                  shadowColor: 'grey',
                  shadowOffset: { width: 1, height: 2 },
                  shadowOpacity: 0.9,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <Image
                    source={require('../assets/images/Water.png')}  // Replace with your rain PNG image
                    className="w-8 h-8"
                    resizeMode="contain"
                  />
                <Text className="text-l font-bold mt-2">
                  {weatherData.main.humidity}%
                </Text>
                <Text className="text-base text-gray-600">ஈரப்பதம்</Text>
              </View>
              <View
                className="bg-white p-4 rounded-l shadow-lg flex-1 mx-2 items-center"
                style={{
                  shadowColor: 'grey',
                  shadowOffset: { width: 1, height: 2 },
                  shadowOpacity: 0.9,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <Image
                    source={require('../assets/images/Rain.png')}  // Replace with your rain PNG image
                    className="w-8 h-8"
                    resizeMode="contain"
                  />
                <Text className="text-l font-bold mt-2">
                  {weatherData.rain ? `${weatherData.rain['1h']} mm` : '0 mm'}
                </Text>
                <Text className="text-base text-gray-600">மழை</Text>
              </View>
            </View>

            {/* Forecast data display */}
            <ScrollView className="mt-4">
              <View className="flex-row justify-between items-center px-4">
                <Text className="text-l mb-2 font-bold">இன்றைய நாள் </Text>
                <TouchableOpacity
                    className="p-2"
                    onPress={() => {
                      if (weatherData) {
                     navigation.navigate('FiveDayForecastTamil')
                      } else {
                        alert('No location selected');
                      }
                    }}
                  >
                    <Text className="text-l mb-2 font-bold">அடுத்த ஐந்து நாட்கள்</Text>
                  </TouchableOpacity>
              </View>
              {forecastData.length > 0 ? (
                <FlatList
                  data={forecastData.filter((_, index) => index % 3 === 0)}  // Filtering for 3-hour intervals
                  horizontal
                  keyExtractor={(item) => item.dt.toString()}
                  renderItem={({ item }) => (
                    <View
                      className="bg-white p-4 rounded-lg shadow-lg mx-2 items-center"
                      style={{
                        shadowColor: 'gray',
                        shadowOffset: { width: 1, height: 2 },
                        shadowOpacity: 0.8,
                        shadowRadius: 4,
                        elevation: 2, // For Android shadow effect
                      }}
                    >
                      <Image
               source={getWeatherImage(weatherData.weather[0].id, weatherData.weather[0].icon)}
                className="w-9 h-9"
                resizeMode="contain"
              />
                      <Text className="text-xl font-bold mb-1">{item.main.temp}°C</Text>
                      <Text className="text-gray-600">
                        {new Date(item.dt * 1000).toLocaleTimeString()}
                      </Text>
                    </View>
                  )}
                  showsHorizontalScrollIndicator={false}  // Hides horizontal scroll indicator
                  contentContainerStyle={{ paddingHorizontal: 10 }}
                />
              ) : (
                <Text className="text-center text-lg text-gray-700">முன்னறிவிப்பு தரவு இல்லை</Text>
              )}
            </ScrollView>
            
          </View>
        ) : (
          <Text style={{textAlign:'center'}}>வானிலை தரவு இல்லை! . மீண்டும் முயற்சிக்கவும்</Text>
        )}
      </View>
      <View className='flex-1 justify-end'>
            <NavigationBar navigation={navigation} />
        </View>
    </View>
  );
};

export default WeatherForecastTamil;
