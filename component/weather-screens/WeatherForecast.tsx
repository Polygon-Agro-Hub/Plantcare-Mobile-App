import React, { useState, useCallback, useEffect } from "react";
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
  Modal,
  Platform,
} from "react-native";
import * as Location from "expo-location";
import { Ionicons, Entypo, AntDesign, FontAwesome6 } from "@expo/vector-icons";
const debounce = require("lodash.debounce");
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import NetInfo from "@react-native-community/netinfo";
import { useFocusEffect } from "@react-navigation/native";
import LocationAccess from "../permission/LocationAccess";
import { useTranslation } from "react-i18next";
import LoadingPage from "../common/LoadingPage";

const { width } = Dimensions.get("window");
const isSmallScreen = width < 400;

type WeatherForecastNavigationProps = StackNavigationProp<
  RootStackParamList,
  "WeatherForecast"
>;

interface WeatherForecastProps {
  navigation: WeatherForecastNavigationProps;
}

const WeatherForecast: React.FC<WeatherForecastProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] = useState<
    boolean | null
  >(null);
  const [showLocationAccess, setShowLocationAccess] = useState(false);
  const [noResultsFound, setNoResultsFound] = useState(false);
  const [currentCityName, setCurrentCityName] = useState<string>("");

  const apiKey = "8561cb293616fe29259448fd098f654b";

  const getDeviceLocation = async (): Promise<Location.LocationObject | null> => {
    try {
      // 1. Check if device location services (GPS) are enabled
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled && Platform.OS === "android") {
        try {
          await Location.enableNetworkProviderAsync();
        } catch (e) {
          console.log("User declined network provider enable", e);
        }
      }

      // 2. Request current position with High accuracy (GPS satellite fix, ~10m accuracy)
      try {
        const positionPromise = Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        const timeoutPromise = new Promise<null>((resolve) =>
          setTimeout(() => resolve(null), 7000),
        );
        const highAccuracyPos = await Promise.race([
          positionPromise,
          timeoutPromise,
        ]);
        if (highAccuracyPos?.coords) {
          return highAccuracyPos;
        }
      } catch (e) {
        console.log("High accuracy GPS error:", e);
      }

      // 3. Fallback: Balanced accuracy (Wi-Fi + Cellular)
      try {
        const balanced = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (balanced?.coords) {
          return balanced;
        }
      } catch (e) {
        console.log("getCurrentPositionAsync Balanced error:", e);
      }

      // 4. Fallback to fresh last known position (within last 2 minutes only)
      try {
        const lastKnown = await Location.getLastKnownPositionAsync({
          maxAge: 120000,
        });
        if (lastKnown?.coords) {
          return lastKnown;
        }
      } catch (e) {
        console.log("getLastKnownPositionAsync error:", e);
      }

      // 5. Final fallback
      return await Location.getLastKnownPositionAsync({});
    } catch (err) {
      console.error("Error in getDeviceLocation:", err);
      return null;
    }
  };

  const getCityNameFromCoords = async (
    lat: number,
    lon: number,
  ): Promise<string | null> => {
    // 1. Try OpenStreetMap Nominatim reverse geocode first (most accurate for Sri Lanka towns/suburbs)
    try {
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=18&addressdetails=1`,
        {
          headers: { "User-Agent": "Plantcare-Mobile-App" },
          timeout: 4000,
        },
      );
      if (res.data?.address) {
        const addr = res.data.address;
        const candidate =
          addr.town ||
          addr.suburb ||
          addr.neighbourhood ||
          addr.city_district ||
          addr.village ||
          addr.city ||
          addr.hamlet ||
          addr.municipality;
        if (candidate && candidate.trim() !== "") {
          return candidate.trim();
        }
      }
    } catch (err) {
      console.log("Nominatim reverse geocode error:", err);
    }

    // 2. Try native Expo Location reverse geocode (Google Play Services / iOS Apple Maps)
    try {
      const reverseResult = await Location.reverseGeocodeAsync({
        latitude: lat,
        longitude: lon,
      });

      if (reverseResult && reverseResult.length > 0) {
        const place = reverseResult[0];
        const isHouseNumber = (val?: string | null) =>
          !val || /^[0-9\/\-\s]+$/.test(val.trim());

        // Prioritize local subregion/district over broader administrative city
        let candidate: string | null = null;
        if (place.subregion && !isHouseNumber(place.subregion)) {
          candidate = place.subregion;
        } else if (place.district && !isHouseNumber(place.district)) {
          candidate = place.district;
        } else if (place.city && !isHouseNumber(place.city)) {
          candidate = place.city;
        } else if (place.name && !isHouseNumber(place.name)) {
          candidate = place.name;
        }

        if (candidate) {
          return candidate.trim();
        }
      }
    } catch (err) {
      console.log("Location.reverseGeocodeAsync error:", err);
    }

    // 3. Fallback to OpenWeatherMap weather endpoint
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`,
        { timeout: 4000 },
      );
      if (response.data?.name) {
        return response.data.name;
      }
    } catch (err) {
      console.error("Error fetching city name from coordinates:", err);
    }

    return null;
  };

  const fetchWeatherByName = async (cityName: string) => {
    try {
      const geoRes = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityName)}&limit=1&appid=${apiKey}`,
      );
      const geoData = await geoRes.json();
    
      if (geoData && geoData.length > 0) {
        await fetchWeather(
          geoData[0].lat,
          geoData[0].lon,
          true,
          geoData[0].name || cityName,
        );
      } else {
        await fetchWeather(6.9271, 79.8612, true, cityName);
      }
    } catch {
      await fetchWeather(6.9271, 79.8612, true, cityName);
    }
  };

  const loadCurrentLocationWeather = async () => {
    setLoading(true);
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== "granted") {
        setHasLocationPermission(false);
        setShowLocationAccess(true);
        setLoading(false);
        return;
      }

      setHasLocationPermission(true);
      setShowLocationAccess(false);

      const location = await getDeviceLocation();
      if (location?.coords) {
        const cityName = await getCityNameFromCoords(
          location.coords.latitude,
          location.coords.longitude,
        );

        await fetchWeather(
          location.coords.latitude,
          location.coords.longitude,
          true,
          cityName || undefined,
        );

        if (cityName) {
          try {
            await AsyncStorage.setItem("lastSearchedCity", cityName);
            await AsyncStorage.setItem(
              "lastSearchedLat",
              location.coords.latitude.toString(),
            );
            await AsyncStorage.setItem(
              "lastSearchedLon",
              location.coords.longitude.toString(),
            );
          } catch (error) {
            console.error("Error storing city name in local storage:", error);
          }
        }
      } else {
        // Fallback to last searched city or Colombo
        const lastCity = await AsyncStorage.getItem("lastSearchedCity");
        const lastLat = await AsyncStorage.getItem("lastSearchedLat");
        const lastLon = await AsyncStorage.getItem("lastSearchedLon");

        if (lastLat && lastLon) {
          await fetchWeather(
            parseFloat(lastLat),
            parseFloat(lastLon),
            true,
            lastCity || undefined,
          );
        } else if (lastCity) {
          await fetchWeatherByName(lastCity);
        } else {
          await fetchWeather(6.9271, 79.8612, true, "Colombo");
        }
      }
    } catch (error) {
      console.error("Error loading current location weather:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionGranted = () => {
    setShowLocationAccess(false);
    setHasLocationPermission(true);
    loadCurrentLocationWeather();
  };

  // Every time Weather screen comes into focus:
  // If location permission has not been granted, Location Access UI is displayed.
  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const checkPermissionAndLoad = async () => {
        try {
          const { status } = await Location.getForegroundPermissionsAsync();
          if (status === "granted") {
            setHasLocationPermission(true);
            setShowLocationAccess(false);
            if (isMounted) {
              await loadCurrentLocationWeather();
            }
          } else {
            setHasLocationPermission(false);
            setShowLocationAccess(true);
          }
        } catch (error) {
          console.error("Error checking location permission on focus:", error);
          setHasLocationPermission(false);
          setShowLocationAccess(true);
        }
      };

      checkPermissionAndLoad();

      const handleHardwareBackPress = () => {
        // When Location Access UI is displayed, phone back navigation is blocked
        if (showLocationAccess) {
          return true;
        }
        navigation.navigate("Dashboard");
        return true;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        handleHardwareBackPress,
      );

      return () => {
        isMounted = false;
        subscription.remove();
      };
    }, [showLocationAccess, navigation]),
  );

  const fetchWeather = async (
    lat: number,
    lon: number,
    clearSearch: boolean = true,
    customCityName?: string,
  ) => {
    const netState = await NetInfo.fetch();
    if (!netState.isConnected) {
      setLoading(false);
      Alert.alert(
        t("WeatherForecast.NoInternet"),
        t("WeatherForecast.PleaseCheckYourInternetConnectionAndTryAgain"),
      );
      return;
    }

    if (!refreshing) {
      setLoading(true);
    }

    try {
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`,
      );
      const weatherData = await weatherResponse.json();

      if (weatherResponse.ok && weatherData) {
        if (customCityName) {
          setCurrentCityName(customCityName);
        } else {
          const resolved = await getCityNameFromCoords(lat, lon);
          setCurrentCityName(resolved || weatherData.name);
        }

        setWeatherData(weatherData);

        setSuggestions([]);
        setNoResultsFound(false);
        if (clearSearch) {
          setSearchQuery("");
        }

        const forecastResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`,
        );
        const forecastData = await forecastResponse.json();

        if (forecastResponse.ok && forecastData.list) {
          setForecastData(forecastData.list);
        } else {
          setForecastData([]);
          Alert.alert(t("WeatherForecast.NoForecastDataAvailable"));
        }
      } else {
        setWeatherData(null);
        Alert.alert(t("WeatherForecast.LocationNotFound"));
      }
    } catch (error) {
      console.error("Error fetching weather data:", error);
      Alert.alert(t("WeatherForecast.AnErrorOccurredWhileFetchingWeatherData"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchSuggestions = async (query: string) => {
    const trimmed = query.trim();
    if (trimmed.length < 3) {
      setSuggestions([]);
      setNoResultsFound(false);
      return;
    }

    try {
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(trimmed)}&limit=5&appid=${apiKey}`,
      );
      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        setSuggestions(data);
        setNoResultsFound(false);
        return;
      }

      // Fallback to OSM Nominatim if OpenWeather didn't find the location
      const osmRes = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(trimmed)}&format=json&limit=5`,
        {
          headers: { "User-Agent": "Plantcare-Mobile-App" },
          timeout: 4000,
        },
      );
      if (Array.isArray(osmRes.data) && osmRes.data.length > 0) {
        const mapped = osmRes.data.map((item: any) => ({
          name: item.name || item.display_name.split(",")[0].trim(),
          state: item.display_name.split(",").slice(1, 3).join(",").trim(),
          country: "LK",
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon),
        }));
        setSuggestions(mapped);
        setNoResultsFound(false);
        return;
      }

      setSuggestions([]);
      setNoResultsFound(true);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
      setNoResultsFound(false);
    }
  };

  const debouncedFetchSuggestions = useCallback(
    debounce(fetchSuggestions, 500),
    [],
  );

  const handleSuggestionPress = async (
    lat: number,
    lon: number,
    name: string,
  ) => {
    setSuggestions([]);
    setNoResultsFound(false);
    setSearchQuery("");

    await fetchWeather(lat, lon, true, name);

    try {
      await AsyncStorage.setItem("lastSearchedCity", name);
      await AsyncStorage.setItem("lastSearchedLat", lat.toString());
      await AsyncStorage.setItem("lastSearchedLon", lon.toString());
    } catch (error) {
      console.error("Error storing city name in local storage:", error);
    }
  };

  const handleDirectSearch = async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setLoading(true);
    setSuggestions([]);
    setNoResultsFound(false);

    try {
      // 1. Try OpenWeather Direct Geocoding
      const geoRes = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(trimmed)}&limit=5&appid=${apiKey}`,
      );
      const geoData = await geoRes.json();

      if (Array.isArray(geoData) && geoData.length > 0) {
        const topResult = geoData[0];
        const selectedName = topResult.name || trimmed;
        await fetchWeather(topResult.lat, topResult.lon, true, selectedName);
        await AsyncStorage.setItem("lastSearchedCity", selectedName);
        await AsyncStorage.setItem("lastSearchedLat", topResult.lat.toString());
        await AsyncStorage.setItem("lastSearchedLon", topResult.lon.toString());
        return;
      }

      // 2. Fallback to Nominatim OSM Search
      const osmRes = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(trimmed)}&format=json&limit=5`,
        {
          headers: { "User-Agent": "Plantcare-Mobile-App" },
          timeout: 5000,
        },
      );
      if (Array.isArray(osmRes.data) && osmRes.data.length > 0) {
        const topResult = osmRes.data[0];
        const lat = parseFloat(topResult.lat);
        const lon = parseFloat(topResult.lon);
        const selectedName = topResult.name || trimmed;
        await fetchWeather(lat, lon, true, selectedName);
        await AsyncStorage.setItem("lastSearchedCity", selectedName);
        await AsyncStorage.setItem("lastSearchedLat", lat.toString());
        await AsyncStorage.setItem("lastSearchedLon", lon.toString());
        return;
      }

      Alert.alert(t("WeatherForecast.LocationNotFound"));
    } catch (error) {
      console.error("Error in direct search:", error);
      Alert.alert(t("WeatherForecast.LocationNotFound"));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (text: string) => {
    setSearchQuery(text);

    if (text.length < 3) {
      setSuggestions([]);
      setNoResultsFound(false);
      return;
    }

    debouncedFetchSuggestions(text);
  };

  const handleLocationIconPress = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== "granted") {
        setShowLocationAccess(true);
        return;
      }

      setHasLocationPermission(true);
      setShowLocationAccess(false);
      setSearchQuery("");
      setSuggestions([]);
      setNoResultsFound(false);
      setLoading(true);

      const location = await getDeviceLocation();
      if (location?.coords) {
        const cityName = await getCityNameFromCoords(
          location.coords.latitude,
          location.coords.longitude,
        );

        await fetchWeather(
          location.coords.latitude,
          location.coords.longitude,
          true,
          cityName || undefined,
        );

        if (cityName) {
          try {
            await AsyncStorage.setItem("lastSearchedCity", cityName);
            await AsyncStorage.setItem(
              "lastSearchedLat",
              location.coords.latitude.toString(),
            );
            await AsyncStorage.setItem(
              "lastSearchedLon",
              location.coords.longitude.toString(),
            );
          } catch (error) {
            console.error("Error storing city name in local storage:", error);
          }
        }
      }
    } catch (error) {
      console.error("Error getting current location:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentTimeDate = (): string => {
    const now = new Date();
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const month = t(`Months.${months[now.getMonth()]}`);
    const dayName = t(`RequestHistory.Days.${days[now.getDay()]}`);
    const dd = now.getDate();
    let hours = now.getHours();
    let mins: any = now.getMinutes();

    if (mins < 10) mins = "0" + mins;
    let hh = hours < 10 ? "0" + hours : hours;

    return `${hh}:${mins} ${month} ${dd < 10 ? "0" + dd : dd}`;
  };

  const getWeatherImage = (id: number, icon: string): any => {
    const iconString = typeof icon === "string" ? icon : "";
    const isDayTime = iconString.includes("d");

    try {
      if (id === 800) {
        return isDayTime
          ? require("../../assets/images/weather icons/daytime/sunny.webp")
          : require("../../assets/images/weather icons/night-time/night-clear sky.webp");
      } else if (id >= 800 && id <= 804) {
        return isDayTime
          ? require("../../assets/images/weather icons/daytime/partly cloudy.webp")
          : require("../../assets/images/weather icons/night-time/Partly Cloudy - night.webp");
      } else if (id >= 200 && id <= 232) {
        return isDayTime
          ? require("../../assets/images/weather icons/daytime/thunderclouds.webp")
          : require("../../assets/images/weather icons/night-time/night-thunderclouds.webp");
      } else if (id >= 500 && id <= 531) {
        return isDayTime
          ? require("../../assets/images/weather icons/daytime/heavy rain.webp")
          : require("../../assets/images/weather icons/night-time/night-heavy rain.webp");
      } else if (id === 701) {
        return isDayTime
          ? require("../../assets/images/weather icons/daytime/mist.webp")
          : require("../../assets/images/weather icons/night-time/mist-nightsky.webp");
      } else if (id >= 600 && id <= 622) {
        return require("../../assets/images/weather icons/daytime/snow.webp");
      }
    } catch (error) {
      console.error("Error loading image:", error);
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
        if (
          id === 502 ||
          id === 504 ||
          id === 503 ||
          id === 522 ||
          id === 511
        ) {
          return t("WeatherNames.HeavyRain");
        } else {
          return t("WeatherNames.LightRain");
        }
      } else if (id === 701) {
        return t("WeatherNames.Mist");
      } else if (id >= 600 && id <= 622) {
        return t("WeatherNames.Snow");
      } else {
        return isDayTime
          ? t("WeatherNames.Place")
          : t("WeatherNames.NightPlace");
      }
    } catch (error) {
      console.error("Error getting weather name:", error);
      return t("WeatherNames.Unknown");
    }
  };

  const formatForecastTime = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setSearchQuery("");
    setSuggestions([]);
    setNoResultsFound(false);

    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== "granted") {
        setShowLocationAccess(true);
        setRefreshing(false);
        return;
      }

      const location = await getDeviceLocation();
      if (location?.coords) {
        const cityName = await getCityNameFromCoords(
          location.coords.latitude,
          location.coords.longitude,
        );

        await fetchWeather(
          location.coords.latitude,
          location.coords.longitude,
          true,
          cityName || undefined,
        );

        if (cityName) {
          await AsyncStorage.setItem("lastSearchedCity", cityName);
          await AsyncStorage.setItem(
            "lastSearchedLat",
            location.coords.latitude.toString(),
          );
          await AsyncStorage.setItem(
            "lastSearchedLon",
            location.coords.longitude.toString(),
          );
        }
      }
    } catch (error) {
      console.error("Error refreshing with current location:", error);
      Alert.alert(
        t("Main.Error"),
        t("WeatherForecast.UnableToFetchCurrentLocation"),
      );
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View style={{ flex: 1 }} className="bg-white">
      <View className="flex-1">
        <View className="relative w-full">
          <View className="flex-row items-center justify-between mt-1 px-2">
            <View>
              <TouchableOpacity
                className="p-2"
                onPress={() => navigation.navigate("Dashboard")}
              >
                <Entypo
                  name="chevron-left"
                  size={24}
                  color={"black"}
                  style={{
                    backgroundColor: "#F6F6F6CC",
                    borderRadius: 50,
                    padding: 10,
                  }}
                />
              </TouchableOpacity>
            </View>

            <View className="relative flex-1 items-center">
              <View className="flex-row items-center bg-[#F6F6F6CC] rounded-3xl max-w-[300px] h-[40px]">
                <TextInput
                  placeholder={t("WeatherForecast.SearchLocation")}
                  placeholderTextColor="#999"
                  value={searchQuery}
                  onChangeText={handleInputChange}
                  returnKeyType="search"
                  onSubmitEditing={() => handleDirectSearch(searchQuery)}
                  style={{
                    flex: 1,
                    marginLeft: 8,
                    fontSize: 16,
                    height: 50,
                    paddingVertical: 0,
                    includeFontPadding: false,
                  }}
                />
                <TouchableOpacity
                  className="mr-4"
                  onPress={() => handleDirectSearch(searchQuery)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name="search"
                    size={24}
                    color="black"
                    className="ml-2"
                  />
                </TouchableOpacity>
              </View>

              {(suggestions.length > 0 ||
                (noResultsFound && searchQuery.length >= 3)) && (
                <View
                  style={[styles.suggestionsContainer]}
                  className="absolute top-12 left-0 right-0 bg-white shadow-lg rounded-lg"
                >
                  {suggestions.length > 0 ? (
                    <FlatList
                      data={suggestions}
                      keyExtractor={(item) =>
                        `${item.lat}-${item.lon}-${item.name}`
                      }
                      renderItem={({ item }) => (
                        <TouchableWithoutFeedback
                          onPress={() =>
                            handleSuggestionPress(
                              item.lat,
                              item.lon,
                              item.name,
                            )
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
                  ) : (
                    <View className="px-4 py-3">
                      <Text className="text-base text-gray-500">
                        {t("WeatherForecast.NoResultsFound") ||
                          "No results found for your search"}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>

            <TouchableOpacity
              className="bg-transparent ml-2 h-[40px] w-[40px] items-center justify-center"
              onPress={handleLocationIconPress}
            >
              <View className="bg-[#F8F8F8] rounded-xl w-[40px] h-[40px] items-center justify-center">
                <AntDesign name="aim" size={20} color="#000502" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {loading || !weatherData ? (
          <View className="flex-1 justify-center items-center">
            <LoadingPage fullScreen backgroundColor="#FFFFFF" />
          </View>
        ) : (
          <ScrollView
            className="mt-6"
            contentContainerStyle={{ flexGrow: 1, zIndex: 1 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            }
          >
            <View className="p-1 pt-0 mt-0 pb-4">
              {weatherData && (
                <View className="items-center">
                  <Image
                    source={getWeatherImage(
                      weatherData.weather[0].id,
                      weatherData.weather[0].icon,
                    )}
                    className="w-40 h-32"
                    resizeMode="contain"
                  />
                  <Text className="text-6xl font-bold mt-4">
                    {weatherData.main.temp}°C
                  </Text>
                  <Text className="text-lg text-gray-400 mb-4">
                    {getWeatherName(
                      weatherData.weather[0].id,
                      weatherData.weather[0].icon,
                    )}
                  </Text>

                  <View className="flex-row gap-1 items-baseline">
                    <Entypo
                      name="location-pin"
                      size={18}
                      color="black"
                      className="ml-2 mt-2"
                    />
                    <Text className="text-xl font-semibold">
                      {currentCityName || weatherData.name}, {weatherData.sys?.country}
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
                      <FontAwesome6
                        name="wind"
                        size={24}
                        color="#0075FF"
                        style={{ marginBottom: 8 }}
                      />
                      <Text className="text-l font-bold">
                        {weatherData.wind.speed} km/h
                      </Text>
                      <Text
                        style={{
                          fontSize: isSmallScreen ? 13 : 16,
                          color: "#666",
                        }}
                      >
                        {t("WeatherForecast.Wind")}
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
                      <FontAwesome6
                        name="water"
                        size={24}
                        color="#0075FF"
                        style={{ marginBottom: 8 }}
                      />
                      <Text className="text-l font-bold">
                        {weatherData.main.humidity}%
                      </Text>
                      <Text
                        style={{
                          fontSize: isSmallScreen ? 13 : 16,
                          color: "#666",
                        }}
                      >
                        {t("WeatherForecast.Humidity")}
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
                      <FontAwesome6
                        name="cloud-rain"
                        size={24}
                        color="#0075FF"
                        style={{ marginBottom: 8 }}
                      />
                      <Text className="text-l font-bold">
                        {`${
                          weatherData?.rain?.["1h"] ??
                          weatherData?.rain?.["3h"] ??
                          forecastData?.[0]?.rain?.["1h"] ??
                          forecastData?.[0]?.rain?.["3h"] ??
                          0
                        } mm`}
                      </Text>
                      <Text
                        style={{
                          fontSize: isSmallScreen ? 13 : 16,
                          color: "#666",
                        }}
                      >
                        {t("WeatherForecast.Rain")}
                      </Text>
                    </View>
                  </View>

                  <ScrollView className="mt-0 pt-0">
                    <View className="flex-row justify-between items-center px-6 pt-0">
                      <Text className="text-l mb-2 font-semibold">
                        {t("WeatherForecast.Today")}
                      </Text>
                      <TouchableOpacity
                        className="p-2"
                        onPress={() => {
                          if (weatherData) {
                            navigation.navigate("FiveDayForecast");
                          } else {
                            Alert.alert(t("WeatherForecast.LocationNotFound"));
                          }
                        }}
                      >
                        <Text className="text-l mb-2 font-semibold -mr-3">
                          {t("WeatherForecast.5Days")}
                          <AntDesign
                            name="caret-right"
                            size={14}
                            color="black"
                          />
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
                          <View
                            className="bg-white p-4 rounded-lg shadow-lg mx-2 items-center mt-1 mb-2 min-w-28"
                            style={{
                              shadowColor: "gray",
                              shadowOffset: { width: 1, height: 1 },
                              shadowOpacity: 0.8,
                              shadowRadius: 2,
                              elevation: 4,
                            }}
                          >
                            <Image
                              source={getWeatherImage(
                                item.weather[0].id,
                                item.weather[0].icon,
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
                        {t("WeatherForecast.NoForecastDataAvailable")}
                      </Text>
                    )}
                  </ScrollView>
                </View>
              )}
            </View>
          </ScrollView>
        )}
      </View>

      {/* Location Access Full-Screen Modal (covers bottom tab bar) */}
      <Modal
        visible={showLocationAccess}
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => {
          // Block phone back navigation on the Location Access UI
        }}
      >
        <LocationAccess
          navigation={navigation as any}
          blockBackNavigation={true}
          onPermissionGranted={() => {
            setShowLocationAccess(false);
            setHasLocationPermission(true);
            loadCurrentLocationWeather();
          }}
          onNotNow={() => {
            setShowLocationAccess(false);
            navigation.navigate("Dashboard");
          }}
          onClose={() => {
            setShowLocationAccess(false);
            navigation.navigate("Dashboard");
          }}
          returnScreen="Dashboard"
        />
      </Modal>
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
