import React, { useState, useCallback } from 'react';
import { View, Text, Image, ScrollView, BackHandler, Dimensions } from 'react-native';
import axios from 'axios';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import CustomHeader from '../common/CustomHeader';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 400;

const API_KEY = '8561cb293616fe29259448fd098f654b';

type FiveDayForecastNavigationProp = StackNavigationProp<RootStackParamList, 'FiveDayForecast'>;

interface FiveDayForecastProps {
  navigation: FiveDayForecastNavigationProp;
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
    '3h': number;
  };
  dt_txt: string;
}

const getWeatherImage = (id: number, icon: string): any => {
  const iconString = typeof icon === 'string' ? icon : '';
  const isDayTime = iconString.includes('d');

  try {
    if (id === 800) {
      return isDayTime
        ? require('../../assets/images/weather icons/daytime/sunny.webp')
        : require('../../assets/images/weather icons/night-time/night-clear sky.webp');
    } else if (id >= 800 && id <= 804) {
      if (id === 801 || id === 802) {
        return isDayTime
          ? require('../../assets/images/weather icons/daytime/partly cloudy.webp')
          : require('../../assets/images/weather icons/night-time/Partly Cloudy - night.webp');
      } else {
        return isDayTime
          ? require('../../assets/images/weather icons/daytime/cloudy.webp')
          : require('../../assets/images/weather icons/night-time/cloudy-night.webp');
      }
    } else if (id >= 200 && id <= 232) {
      if (id === 210 || id === 211 || id === 212 || id === 221) {
        return isDayTime
          ? require('../../assets/images/weather icons/daytime/thunderclouds.webp')
          : require('../../assets/images/weather icons/night-time/night-thunderclouds.webp');
      } else {
        return isDayTime
          ? require('../../assets/images/weather icons/daytime/thunderstorms.webp')
          : require('../../assets/images/weather icons/night-time/night-thunderstorms.webp');
      }
    } else if (id >= 500 && id <= 531) {
      if (id === 502 || id === 504 || id === 503 || id === 522 || id === 511) {
        return isDayTime
          ? require('../../assets/images/weather icons/daytime/heavy rain.webp')
          : require('../../assets/images/weather icons/night-time/night-heavy rain.webp');
      } else {
        return isDayTime
          ? require('../../assets/images/weather icons/daytime/partly rainy.webp')
          : require('../../assets/images/weather icons/night-time/night-partly-rainy.webp');
      }
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

const FiveDayForecast: React.FC<FiveDayForecastProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [tomorrowWeather, setTomorrowWeather] = useState<any>({});
  const [weatherStats, setWeatherStats] = useState({
    wind: 0,
    humidity: 0,
    rain: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [name, setName] = useState('');

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

  const fetchWeather = async (name: string): Promise<void> => {
    setLoading(true);
    try {
      const response = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?q=${name}&appid=${API_KEY}`);

      const data = response.data;
      const tmrwWeather = data.list[1];

      const minTempCelsius = tmrwWeather.main.temp_min - 273.15;
      const maxTempCelsius = tmrwWeather.main.temp_max - 273.15;

      setTomorrowWeather({
        weatherId: tmrwWeather.weather[0].id,
        icon: tmrwWeather.weather[0].icon,
        minTemp: minTempCelsius,
        maxTemp: maxTempCelsius,
      });

      const firstEntry = data.list[0];
      setWeatherStats({
        wind: firstEntry.wind.speed,
        humidity: firstEntry.main.humidity,
        rain: firstEntry.rain ? firstEntry.rain['3h'] : 0,
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
      console.error('Error fetching weather data:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const handleBackPress = () => {
        navigation.navigate('WeatherForecast');
        return true;
      };

      const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
      return () => backHandler.remove();
    }, [navigation])
  );

  useFocusEffect(
    useCallback(() => {
      const loadLastSearchedCity = async () => {
        try {
          const storedCityName = await AsyncStorage.getItem('lastSearchedCity');
          if (storedCityName) {
            setName(storedCityName);
          }
        } catch (error) {
          console.error('Error loading city name from local storage:', error);
        }
      };

      loadLastSearchedCity();
      if (name) {
        fetchWeather(name);
      }
    }, [name])
  );

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <View className="flex-1 justify-center items-center">
          <LottieView source={require('../../assets/jsons/loader.json')} autoPlay loop style={{ width: 300, height: 300 }} />
        </View>
      </View>
    );
  }

  const twItem = tomorrowWeather as TomorrowWeather;

  return (
    <View className="flex-1 bg-white">
      <CustomHeader
        title={t('FiveDayForcast.Title')}
        showBackButton={true}
        navigation={navigation as any}
        onBackPress={() => navigation.navigate('WeatherForecast')}
      />

      <ScrollView contentContainerStyle={{ padding: 5 }} className="mb-10 mt-6">
        <View className="flex items-center justify-center mb-1">
          <View className="justify-between flex-row items-center">
            <Image
              source={getWeatherImage(twItem.weatherId, twItem.icon)}
              className="w-40 h-32"
              resizeMode="contain"
            />
            <View className="ml-2">
              <Text className="text-xl">{t('FiveDayForcast.Tomorrow')}</Text>
              <Text className="mt-3">
                <Text className="text-3xl font-bold">{Math.round(twItem.minTemp)}°C</Text>
                <Text className="text-base font-semibold text-gray-400"> / {Math.round(twItem.maxTemp)}°C</Text>
              </Text>
            </View>
          </View>
        </View>

        <View className="flex-row justify-between mb-1 p-5">
          <View className="bg-white p-4 rounded-xl shadow-lg flex-1 mx-2 items-center justify-center" style={{ shadowColor: 'grey', shadowOffset: { width: 1, height: 2 }, shadowOpacity: 0.9, shadowRadius: 4, elevation: 4 }}>
            <Image source={require('../../assets/images/weather icons/common/wind-image.webp')} className="w-6 h-6" />
            <Text className="text-l font-bold">{Math.round(weatherStats.wind)} km/h</Text>
            <Text style={{ fontSize: isSmallScreen ? 13 : 16, color: '#666' }}>{t('WeatherForecast.Wind')}</Text>
          </View>

          <View className="bg-white p-4 rounded-xl shadow-lg flex-1 mx-2 items-center justify-center" style={{ shadowColor: 'grey', shadowOffset: { width: 1, height: 2 }, shadowOpacity: 0.9, shadowRadius: 4, elevation: 4 }}>
            <Image source={require('../../assets/images/weather icons/common/water-image.webp')} className="w-8 h-8" />
            <Text className="text-l font-bold">{weatherStats.humidity}%</Text>
            <Text style={{ fontSize: isSmallScreen ? 13 : 16, color: '#666' }}>{t('WeatherForecast.Humidity')}</Text>
          </View>

          <View className="bg-white p-4 rounded-xl shadow-lg flex-1 mx-2 items-center justify-center" style={{ shadowColor: 'grey', shadowOffset: { width: 1, height: 2 }, shadowOpacity: 0.9, shadowRadius: 4, elevation: 4 }}>
            <Image source={require('../../assets/images/weather icons/common/rain-image.webp')} className="w-8 h-8" />
            <Text className="text-l font-bold">{weatherStats.rain} mm</Text>
            <Text style={{ fontSize: isSmallScreen ? 13 : 16, color: '#666' }}>{t('WeatherForecast.Rain')}</Text>
          </View>
        </View>

        {forecastData.map((item: ForecastItem, index: number) => {
          const date = new Date(item.dt_txt);
          const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
          const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
          
          const month = t(`Months.${months[date.getMonth()]}`);
          const dayName = t(`Days.${days[date.getDay()]}`);
          const dd = date.getDate();

          return (
            <View key={index} className="flex-row justify-between items-center p-4">
              <View className="items-center">
                <Text className="text-lg text-black font-bold">{month} {dd}</Text>
                <Text className="text-sm">{dayName}</Text>
              </View>
              <Image
                source={getWeatherImage(item.weather[0].id, item.weather[0].icon)}
                className="w-10 h-10"
                resizeMode="contain"
              />
              <Text className="text-base text-gray-500">{getWeatherName(item.weather[0].id, item.weather[0].icon)}</Text>
              <Text className="text-base font-bold text-gray-500">{Math.round(item.main.temp)}°C</Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default FiveDayForecast;
