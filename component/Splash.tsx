import React, { useEffect, useState } from 'react';
import { View, ImageBackground, Image, Text } from 'react-native';
import * as Progress from 'react-native-progress';
import { useNavigation } from '@react-navigation/native';

const backgroundImage = require('../assets/images/SplashBackground.jpg');
const llogo = require('../assets/images/logo2White 1.png');
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';

// Define navigation prop type
type SplashNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Splash'>;

const Splash: React.FC = () => {
  const navigation = useNavigation<SplashNavigationProp>();

  // State to track the progress of the progress bar
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Timer to navigate after 3 seconds
    const timer = setTimeout(() => {
      navigation.navigate('Lanuage'); // route name 
    }, 5000);

    // Timer to update progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 1) {
          return prev + 0.1; // Increment progress by 0.1
        }
        clearInterval(progressInterval); // Stop the interval when progress reaches 1
        return prev;
      });
    }, 500); // Update every 500ms

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [navigation]);

  return (
    <ImageBackground source={backgroundImage} style={{ flex: 1 }}>
      <View style={{paddingBottom:300, flex: 1, justifyContent: 'center', alignItems: 'center', }}>
        <Image source={llogo} style={{marginBottom:0, width: 150, height: 150, resizeMode: 'contain' }} />
        <Text style={{ color: 'white', fontSize: 32, fontWeight: 'bold', marginTop: 20 }}>
          PLANT CARE
        </Text>
        <View style={{ width: '80%', marginTop: 20 }}>
          <Progress.Bar
            progress={progress}
            width={null} // Adjust to the parent container's width
            color="#ffffff"
            borderWidth={0}
            style={{ height: 10 }} // Adjust height if necessary
          />
        </View>
      </View>
    </ImageBackground>
  );
};

export default Splash;
