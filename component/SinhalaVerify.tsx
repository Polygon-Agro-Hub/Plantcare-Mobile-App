import { View, Text, SafeAreaView, Image, TouchableOpacity } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Animated,{FadeIn,FadeInDown,FadeInUp,FadeOut} from 'react-native-reanimated'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import React from 'react'
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './types';

type SinhalaVerifyNavigationProps = StackNavigationProp<RootStackParamList,'SinhalaVerify'>

interface SinhalaVerifyProps{
    navigation:SinhalaVerifyNavigationProps
}

const SinhalaVerify:React.FC<SinhalaVerifyProps> = ({navigation}) => {
  return (
    <SafeAreaView className='flex-1 bg-white'>
      <StatusBar style='light' />
      <View>
      <Ionicons name="chevron-back-outline" size={30} color="gray" />
      </View>
      
     <View className="flex justify-center items-center mt-36">
      {/* Third Circle */}
      <Animated.View
        entering={FadeIn.delay(250).springify()}
        className="absolute w-28 h-28 bg-green-400 rounded-full flex justify-center items-center"
      >
        <AntDesign name="check" size={50} color="gray" />
      </Animated.View>

      {/* Second Circle */}
      <Animated.View
        entering={FadeIn.delay(500).springify()}
        className="absolute w-40 h-40 bg-green-200 rounded-full flex justify-center items-center"
      >
            <View className="absolute w-28 h-28 bg-green-400 rounded-full flex justify-center items-center">
                <AntDesign name="check" size={50} color="gray" />
            </View>
      </Animated.View>

      {/* First Circle */}
      <Animated.View
        entering={FadeIn.delay(750).springify()}
        className="w-52 h-52 bg-green-100 rounded-full flex justify-center items-center"
      >
        <View className="absolute w-40 h-40 bg-green-200 rounded-full flex justify-center items-center"
      >
            <View className="absolute w-28 h-28 bg-green-400 rounded-full flex justify-center items-center">
                <AntDesign name="check" size={50} color="gray" />
            </View>
      </View>
      </Animated.View>
    </View>



      <View className='flex justify-center items-center mt-8'>
        <Text style={{fontSize:(20)}} className='font-bold'>සාර්ථකව සත්‍යාපනය කර ඇත!</Text>
        <Text className='text-gray-300 mt-5' style={{fontSize:(16)}}>ඔබගේ අනන්‍යතාවය සාර්ථකව </Text>
        <Text className='text-gray-300' style={{fontSize:(16)}}>සත්‍යාපනය කර ඇත</Text>
      </View>

      <View className='mt-20'>
        <TouchableOpacity
            onPress={()=>navigation.navigate('SigninSinhalasc')}
            style={{height:hp(7),width:wp(80)}}
            className='bg-gray-900 flex items-center justify-center mx-auto rounded-full'    
        >
            <Text style={{fontSize:20}}className='text-white font-bold tracking-wide'>ඉදිරියට යන්න</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  )
}

export default SinhalaVerify
