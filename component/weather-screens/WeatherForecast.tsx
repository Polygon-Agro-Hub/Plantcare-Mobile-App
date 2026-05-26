import React, { useState, useCallback, useEffect } from 'react';
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
  RefreshControl,
  BackHandler,
  Dimensions,
  StyleSheet,
} from 'react-native';
import * as Location from 'expo-location';
import { Ionicons, Entypo, AntDesign, FontAwesome6 } from '@expo/vector-icons';
import debounce from 'lodash.debounce';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import NetInfo from '@react-native-community/netinfo';
import { useFocusEffect } from '@react-navigation/native';
import LocationAccess from '../permission/LocationAccess';
import { useTranslation } from 'react-i18next';
import LoadingPage from '../common/LoadingPage';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 400;

type WeatherForecastNavigationProps = StackNavigationProp<RootStackParamList, 'WeatherForecast'>;

interface WeatherForecastProps {
  navigation: WeatherForecastNavigationProps;
}

const WeatherForecast: React.FC<WeatherForecastProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] = useState<boolean | null>(null);
  const [showLocationAccess, setShowLocationAccess] = useState(false);

  const apiKey = '8561cb293616fe29259448fd098f654b';

  useEffect(() => {
    checkLocationPermission();
  }, []);

  const checkLocationPermission = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === 'granted') {
        setHasLocationPermission(true);
        setShowLocationAccess(false);
        await loadCurrentLocationWeather();
      } else {
        setHasLocationPermission(false);
        setShowLocationAccess(true);
      }
    } catch (error) {
      console.error('Error checking location permission:', error);
      setHasLocationPermission(false);
      setShowLocationAccess(true);
    }
  };

  const loadCurrentLocationWeather = async () => {
    setLoading(true);
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        await fetchWeather(location.coords.latitude, location.coords.longitude, true);

        const cityName = await getCityNameFromCoords(location.coords.latitude, location.coords.longitude);
        if (cityName) {
          try {
            await AsyncStorage.setItem('lastSearchedCity', cityName);
          } catch (error) {
            console.error('Error storing city name in local storage:', error);
          }
        }
      } else {
        setLoading(false);
        setShowLocationAccess(true);
      }
    } catch (error) {
      console.error('Error fetching current location:', error);
      setLoading(false);
      setShowLocationAccess(true);
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionGranted = () => {
    setShowLocationAccess(false);
    setHasLocationPermission(true);
    loadCurrentLocationWeather();
  };

  useFocusEffect(
    useCallback(() => {
      if (hasLocationPermission) {
        const resetAndLoadCurrentLocation = async () => {
          setSearchQuery('');
          setSuggestions([]);
          setWeatherData(null);
          setForecastData([]);
          setLoading(true);

          try {
            const { status } = await Location.getForegroundPermissionsAsync();
            if (status === 'granted') {
              const location = await Location.getCurrentPositionAsync({});
              await fetchWeather(location.coords.latitude, location.coords.longitude, true);

              const cityName = await getCityNameFromCoords(location.coords.latitude, location.coords.longitude);
              if (cityName) {
                try {
                  await AsyncStorage.setItem('lastSearchedCity', cityName);
                } catch (error) {
                  console.error('Error storing city name in local storage:', error);
                }
              }
            } else {
              setLoading(false);
              setShowLocationAccess(true);
            }
          } catch (error) {
            console.error('Error fetching current location:', error);
            setLoading(false);
            setShowLocationAccess(true);
          }
        };

        resetAndLoadCurrentLocation();
      }
    }, [hasLocationPermission])
  );

  useFocusEffect(
    useCallback(() => {
      const handleBackPress = () => {
        navigation.navigate('Dashboard');
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
      return () => subscription.remove();
    }, [navigation])
  );

  const fetchWeather = async (lat: number, lon: number, clearSearch: boolean = true) => {
    const netState = await NetInfo.fetch();
    if (!netState.isConnected) {
      setLoading(false);
      Alert.alert(t('WeatherForecast.NoInternet'), t('WeatherForecast.PleaseCheckYourInternetConnectionAndTryAgain'));
      return;
    }

    if (!refreshing) {
      setLoading(true);
    }

    try {
      const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
      const weatherData = await weatherResponse.json();

      if (weatherResponse.ok && weatherData) {
        setWeatherData(weatherData);

        setSuggestions([]);
        if (clearSearch) {
          setSearchQuery('');
        }

        const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
        const forecastData = await forecastResponse.json();

        if (forecastResponse.ok && forecastData.list) {
          setForecastData(forecastData.list);
        } else {
          setForecastData([]);
          Alert.alert(t('WeatherForecast.NoForecastDataAvailable'));
        }
      } else {
        setWeatherData(null);
        Alert.alert(t('WeatherForecast.LocationNotFound'));
      }
    } catch (error) {
      console.error('Error fetching weather data:', error);
      Alert.alert(t('WeatherForecast.AnErrorOccurredWhileFetchingWeatherData'));
    } finally {
      setLoading(false);
      setRefreshing(false);
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

  const fetchSuggestions = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${apiKey}`);
      const data = await response.json();

      if (data.length > 0) {
        setSuggestions(data);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    }
  };

  const debouncedFetchSuggestions = useCallback(debounce(fetchSuggestions, 500), []);

  const handleSuggestionPress = async (lat: number, lon: number, name: string) => {
    setSuggestions([]);
    setSearchQuery('');

    fetchWeather(lat, lon, true);

    try {
      await AsyncStorage.setItem('lastSearchedCity', name);
    } catch (error) {
      console.error('Error storing city name in local storage:', error);
    }
  };

  const handleInputChange = (text: string) => {
    setSearchQuery(text);

    if (text.length < 3) {
      setSuggestions([]);
      return;
    }

    debouncedFetchSuggestions(text);
  };

  const handleLocationIconPress = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setHasLocationPermission(true);
        setShowLocationAccess(false);
        setSearchQuery('');
        setSuggestions([]);

        const location = await Location.getCurrentPositionAsync({});

        fetchWeather(location.coords.latitude, location.coords.longitude, true);

        const cityName = await getCityNameFromCoords(location.coords.latitude, location.coords.longitude);
        if (cityName) {
          try {
            await AsyncStorage.setItem('lastSearchedCity', cityName);
          } catch (error) {
            console.error('Error storing city name in local storage:', error);
          }
        }
      } else {
        setShowLocationAccess(true);
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert(t('Main.Error'), t('WeatherForecast.UnableToFetchCurrentLocation'));
    }
  };

  const getCurrentTimeDate = (): string => {
    const now = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const month = t(`Months.${months[now.getMonth()]}`);
    const dayName = t(`Days.${days[now.getDay()]}`);
    const dd = now.getDate();
    let hours = now.getHours();
    let mins: any = now.getMinutes();

    if (mins < 10) mins = '0' + mins;
    let hh = hours < 10 ? '0' + hours : hours;

    return `${hh}:${mins} ${month} ${dd < 10 ? '0' + dd : dd}`;
  };

  const getWeatherImage = (id: number, icon: string): any => {
    const iconString = typeof icon === 'string' ? icon : '';
    const isDayTime = iconString.includes('d');

    try {
      if (id === 800) {
        return isDayTime
          ? require('../../assets/images/weather icons/daytime/sunny.webp')
          : require('../../assets/images/weather icons/night-time/night-clear sky.webp');
      } else if (id >= 800 && id <= 804) {
        return isDayTime
          ? require('../../assets/images/weather icons/daytime/partly cloudy.webp')
          : require('../../assets/images/weather icons/night-time/Partly Cloudy - night.webp');
      } else if (id >= 200 && id <= 232) {
        return isDayTime
          ? require('../../assets/images/weather icons/daytime/thunderclouds.webp')
          : require('../../assets/images/weather icons/night-time/night-thunderclouds.webp');
      } else if (id >= 500 && id <= 531) {
        return isDayTime
          ? require('../../assets/images/weather icons/daytime/heavy rain.webp')
          : require('../../assets/images/weather icons/night-time/night-heavy rain.webp');
      } else if (id === 701) {
        return isDayTime
          ? require('../../assets/images/weather icons/daytime/mist.webp')
          : require('../../assets/images/weather icons/night-time/mist-nightsky.webp');
      } else if (id >= 600 && id <= 622) {
        return require('../../assets/images/weather icons/daytime/snow.webp');
      }
    } catch (error) {
      console.error('Error loading image:', error);
    }
  };

  const getWeatherName = (id: any, icon: any) => {
    const iconString = typeof icon === "string" ? icon : "";
    const isDayTime = iconString.includes("d");

    try {
      if (id === 800) {
        return isDayTime ? t("WeatherNames.Sunny") : t("WeatherNames.ClearSky");
      } else if (id >= 800 && id <= 804) {
        if (id === 801 || id === 802) {
          return t("WeatherNames.PartlyCloudy");
        } else {
          return t("WeatherNames.Cloudy");
        }
      } else if (id >= 200 && id <= 232) {
        if (id === 210 || id === 211 || id === 212 || id === 221) {
          return t("WeatherNames.Thunderclouds");
        } else {
          return t("WeatherNames.Thunderstorms");
        }
      } else if (id >= 500 && id <= 531) {
        if (id === 502 || id === 504 || id === 503 || id === 522 || id === 511) {
          return t("WeatherNames.HeavyRain");
        } else {
          return t("WeatherNames.LightRain");
        }
      } else if (id === 701) {
        return t("WeatherNames.Mist");
      } else if (id >= 600 && id <= 622) {
        return t("WeatherNames.Snow");
      } else {
        return isDayTime ? t("WeatherNames.Place") : t("WeatherNames.NightPlace");
      }
    } catch (error) {
      console.error("Error getting weather name:", error);
      return t("WeatherNames.Unknown");
    }
  };

  const formatForecastTime = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setSearchQuery('');
    setSuggestions([]);

    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        await fetchWeather(location.coords.latitude, location.coords.longitude, true);

        const cityName = await getCityNameFromCoords(location.coords.latitude, location.coords.longitude);
        if (cityName) {
          await AsyncStorage.setItem('lastSearchedCity', cityName);
        }
      } else {
        setShowLocationAccess(true);
      }
    } catch (error) {
      console.error('Error refreshing with current location:', error);
      Alert.alert(t('Main.Error'), t('WeatherForecast.UnableToFetchCurrentLocation'));
    } finally {
      setRefreshing(false);
    }
  };

  if (showLocationAccess) {
    return (
      <LocationAccess
        navigation={navigation as any}
        onPermissionGranted={handlePermissionGranted}
        returnScreen="WeatherForecast"
      />
    );
  }

  return (
    <View style={{ flex: 1 }} className="bg-white">
      <View className="flex-1">
        <View className="relative w-full">
          <View className="flex-row items-center justify-between mt-1 px-2">
            <View>
              <TouchableOpacity className="p-2 bg-transparent">
                <Entypo
                  name="chevron-left"
                  size={24}
                  color="#000502"
                  onPress={() => navigation.navigate('Dashboard')}
                  style={{ backgroundColor: '#F6F6F6CC', borderRadius: 50, padding: wp(2.5) }}
                />
              </TouchableOpacity>
            </View>

            <View className="relative flex-1 items-center">
              <View className="flex-row items-center bg-[#F6F6F6CC] rounded-3xl max-w-[300px] h-[50px]">
                <TextInput
                  className="flex-1 p-1 text-lg text-black ml-4"
                  placeholder={t('WeatherForecast.SearchLocation')}
                  placeholderTextColor="#999"
                  value={searchQuery}
                  onChangeText={handleInputChange}
                />
                <View className="mr-4">
                  <Ionicons name="search" size={24} color="black" className="ml-2" />
                </View>
              </View>

              {suggestions.length > 0 && (
                <View style={[styles.suggestionsContainer]} className="absolute top-12 left-0 right-0 bg-white shadow-lg rounded-lg">
                  <FlatList
                    data={suggestions}
                    keyExtractor={(item) => `${item.lat}-${item.lon}-${item.name}`}
                    renderItem={({ item }) => (
                      <TouchableWithoutFeedback onPress={() => handleSuggestionPress(item.lat, item.lon, item.name)}>
                        <View className="px-4 py-2 border-b border-gray-200">
                          <Text className="text-lg text-black">{item.name}, {item.state}, {item.country}</Text>
                        </View>
                      </TouchableWithoutFeedback>
                    )}
                  />
                </View>
              )}
            </View>

            <TouchableOpacity
              className="bg-transparent ml-2 h-[50px] w-[50px] items-center justify-center"
              onPress={handleLocationIconPress}
            >
              <View className="bg-[#F8F8F8] rounded-xl w-[50px] h-[50px] items-center justify-center">
                <AntDesign name="aim" size={20} color="#000502" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <View className="flex-1 justify-center items-center">
            <LoadingPage fullScreen />
          </View>
        ) : (
          <ScrollView
            className="mt-6"
            contentContainerStyle={{ flexGrow: 1, zIndex: 1 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          >
            <View className="p-1 pt-0 mt-0 pb-4">
              {weatherData ? (
              <View className="items-center">
                <Image
                  source={getWeatherImage(weatherData.weather[0].id, weatherData.weather[0].icon)}
                  className="w-40 h-32"
                  resizeMode="contain"
                />
                <Text className="text-6xl font-bold mt-4">{weatherData.main.temp}°C</Text>
                <Text className="text-lg text-gray-400 mb-4">{getWeatherName(weatherData.weather[0].id, weatherData.weather[0].icon)}</Text>

                <View className="flex-row gap-1 items-baseline">
                  <Entypo name="location-pin" size={20} color="black" className="ml-2 mt-2" />
                  <Text className="text-lg font-semibold">{weatherData.name}, {weatherData.sys.country}</Text>
                </View>

                <Text className="text font-semibold text-gray-700 mb-2">{getCurrentTimeDate()}</Text>

                <View className="flex-row justify-between p-5 mt-2">
                  <View className="bg-white p-4 rounded-xl shadow-lg flex-1 mx-2 items-center justify-center" style={{ shadowColor: 'grey', shadowOffset: { width: 1, height: 2 }, shadowOpacity: 0.9, shadowRadius: 4, elevation: 4 }}>
                    <FontAwesome6 name="wind" size={24} color="#0075FF" style={{ marginBottom: 8 }} />
                    <Text className="text-l font-bold">{weatherData.wind.speed} km/h</Text>
                    <Text style={{ fontSize: isSmallScreen ? 13 : 16, color: '#666' }}>{t('WeatherForecast.Wind')}</Text>
                  </View>
                  <View className="bg-white p-4 rounded-xl shadow-lg flex-1 mx-2 items-center justify-center" style={{ shadowColor: 'grey', shadowOffset: { width: 1, height: 2 }, shadowOpacity: 0.9, shadowRadius: 4, elevation: 4 }}>
                    <FontAwesome6 name="water" size={24} color="#0075FF" style={{ marginBottom: 8 }} />
                    <Text className="text-l font-bold">{weatherData.main.humidity}%</Text>
                    <Text style={{ fontSize: isSmallScreen ? 13 : 16, color: '#666' }}>{t('WeatherForecast.Humidity')}</Text>
                  </View>
                  <View className="bg-white p-4 rounded-xl shadow-lg flex-1 mx-2 items-center justify-center" style={{ shadowColor: 'grey', shadowOffset: { width: 1, height: 2 }, shadowOpacity: 0.9, shadowRadius: 4, elevation: 4 }}>
                    <FontAwesome6 name="cloud-rain" size={24} color="#0075FF" style={{ marginBottom: 8 }} />
                    <Text className="text-l font-bold">
                      {`${
                        weatherData?.rain?.['1h'] ??
                        weatherData?.rain?.['3h'] ??
                        forecastData?.[0]?.rain?.['1h'] ??
                        forecastData?.[0]?.rain?.['3h'] ??
                        0
                      } mm`}
                    </Text>
                    <Text style={{ fontSize: isSmallScreen ? 13 : 16, color: '#666' }}>{t('WeatherForecast.Rain')}</Text>
                  </View>
                </View>

                <ScrollView className="mt-0 pt-0">
                  <View className="flex-row justify-between items-center px-4 pt-0">
                    <Text className="text-l mb-2 font-semibold">{t('WeatherForecast.Today')}</Text>
                    <TouchableOpacity
                      className="p-2"
                      onPress={() => {
                        if (weatherData) {
                          navigation.navigate('FiveDayForecast');
                        } else {
                          Alert.alert(t('WeatherForecast.LocationNotFound'));
                        }
                      }}
                    >
                      <Text className="text-l mb-2 font-semibold -mr-3">
                        {t('WeatherForecast.5Days')}
                        <AntDesign name="caret-right" size={14} color="black" />
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {forecastData.length > 0 ? (
                    <FlatList
                      className="mb-20"
                      data={forecastData}
                      horizontal
                      keyExtractor={(item) => item.dt.toString()}
                      renderItem={({ item }) => (
                        <View className="bg-white p-4 rounded-lg shadow-lg mx-2 items-center mt-1 mb-2" style={{ shadowColor: 'gray', shadowOffset: { width: 1, height: 1 }, shadowOpacity: 0.8, shadowRadius: 2, elevation: 4 }}>
                          <Image source={getWeatherImage(item.weather[0].id, item.weather[0].icon)} className="w-6 h-6" resizeMode="contain" />
                          <Text className="text-base font-bold mb-1">{item.main.temp}°C</Text>
                          <Text className="text-gray-600">{formatForecastTime(item.dt)}</Text>
                        </View>
                      )}
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{ paddingHorizontal: 10 }}
                    />
                  ) : (
                    <Text className="text-center text-lg text-gray-700">{t('WeatherForecast.NoForecastDataAvailable')}</Text>
                  )}
                </ScrollView>
              </View>
              ) : (
                <View className="flex-1 justify-center items-center">
                  <ActivityIndicator size="large" color="#26D041" />
                </View>
              )}
            </View>
          </ScrollView>
        )}
      </View>
    </View>
  );
};

export default WeatherForecast;

const styles = StyleSheet.create({
  suggestionsContainer: {
    zIndex: 50,
    elevation: 5,
    maxHeight: 200,
  },
});
