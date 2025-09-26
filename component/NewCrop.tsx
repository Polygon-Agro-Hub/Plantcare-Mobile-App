import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  RefreshControl,
  Keyboard,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import axios from "axios";
import EvilIcons from "react-native-vector-icons/EvilIcons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";
import Modal from "react-native-modal";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "./types";
import { environment } from "@/environment/environment";
import { useTranslation } from "react-i18next";
import AntDesign from "react-native-vector-icons/AntDesign";
import CropItem from "@/Items/CropItem";
import CropVariety from "@/Items/CropVariety";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import ContentLoader, { Rect, Circle } from "react-content-loader/native";
import { useFocusEffect } from "@react-navigation/native";
import LottieView from "lottie-react-native"; 


type NewCropNavigationProps = StackNavigationProp<
  RootStackParamList,
  "NewCrop"
>;

interface NewCropProps {
  navigation: NewCropNavigationProps;
}

const NewCrop: React.FC<NewCropProps> = ({ navigation }) => {
  interface CropData {
    id: string;
    cropNameEnglish: string;
    cropNameSinhala: string;
    cropNameTamil: string;
    bgColor: string;
    image: string;
    selectedCrop: boolean;
    district: string;
  }

  interface VarietyData {
    cropGroupId: string;
    id: string;
    varietyNameEnglish: string;
    varietyNameSinhala: string;
    varietyNameTamil: string;
    bgColor: string;
    image: string;
  }

  const [crop, setCrop] = useState<CropData[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Vegetables");
    console.log("selected category", selectedCategory)
  const [isModalVisible, setModalVisible] = useState(false);
  const [showDistricts, setShowDistricts] = useState(false);
  const [language, setLanguage] = useState("en");
  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedCrop, setSelectedCrop] = useState<boolean>(false);
  const [selectedCropId, setSelectedCropId] = useState<string | null>(null);
  const [selectedVariety, setSelectedVariety] = useState<VarietyData[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchcrops, setSearchCrops] = useState(false);
  const [selectedVarietyId, setSelectedVarietyId] = useState(false)

  const distict = [
    { id: 1, name: t("District.Ampara"), value: "Ampara" },
    { id: 2, name: t("District.Anuradhapura"), value: "Anuradhapura" },
    { id: 3, name: t("District.Badulla"), value: "Badulla" },
    { id: 4, name: t("District.Batticaloa"), value: "Batticaloa" },
    { id: 5, name: t("District.Colombo"), value: "Colombo" },
    { id: 6, name: t("District.Galle"), value: "Galle" },
    { id: 7, name: t("District.Gampaha"), value: "Gampaha" },
    { id: 8, name: t("District.Hambantota"), value: "Hambantota" },
    { id: 9, name: t("District.Jaffna"), value: "Jaffna" },
    { id: 10, name: t("District.Kalutara"), value: "Kalutara" },
    { id: 11, name: t("District.Kandy"), value: "Kandy" },
    { id: 12, name: t("District.Kegalle"), value: "Kegalle" },
    { id: 13, name: t("District.Kilinochchi"), value: "Kilinochchi" },
    { id: 14, name: t("District.Kurunegala"), value: "Kurunegala" },
    { id: 15, name: t("District.Mannar"), value: "Mannar" },
    { id: 16, name: t("District.Matale"), value: "Matale" },
    { id: 17, name: t("District.Matara"), value: "Matara" },
    { id: 18, name: t("District.Monaragala"), value: "Monaragala" },
    { id: 19, name: t("District.Mullaitivu"), value: "Mullaitivu" },
    { id: 20, name: t("District.Nuwara Eliya"), value: "NuwaraEliya" },
    { id: 21, name: t("District.Polonnaruwa"), value: "Polonnaruwa" },
    { id: 22, name: t("District.Puttalam"), value: "Puttalam" },
    { id: 23, name: t("District.Rathnapura"), value: "Ratnapura" },
    { id: 24, name: t("District.Trincomalee"), value: "Trincomalee" },
    { id: 25, name: t("District.Vavuniya"), value: "Vavuniya" },
  ];
  const CheckDistrict = () => {
    return distict;
  };

  const fetchCrop = async () => {
    try {
      const selectedLanguage = t("NewCrop.LNG");
      setLanguage(selectedLanguage);

      const res = await axios.get<CropData[]>(
        `${environment.API_BASE_URL}api/crop/get-all-crop/${selectedCategory}`
      );
      // setCrop(res.data);
           const orderedCrops = res.data.sort((a, b) => {
      const aCropName =
        language === "si" ? a.cropNameSinhala :
        language === "ta" ? a.cropNameTamil :
        a.cropNameEnglish;

      const bCropName =
        language === "si" ? b.cropNameSinhala :
        language === "ta" ? b.cropNameTamil :
        b.cropNameEnglish;

      return aCropName.localeCompare(bCropName); // A-Z order
    });

    setCrop(orderedCrops); 
      setTimeout(() => {
        setLoading(false);
      }, 300);
    } catch (error) {
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchCrop();
  }, [selectedCategory]);

  const toggleDistrictSelection = async (district: string) => {
    setSelectedDistrict(district);
  };

  useEffect(() => {
    if (selectedDistrict) {
      setLoading(true);
      filteredCropsforDistrict();
    }
  }, [selectedDistrict]);

  const filteredCropsforDistrict = async () => {
    try {
      console.log(selectedDistrict);
      const res = await axios.get<CropData[]>(
        `${environment.API_BASE_URL}api/crop/get-all-crop-bydistrict/${selectedCategory}/${selectedDistrict}`
      );
      // setCrop(res.data);
       const orderedCrops = res.data.sort((a, b) => {
      const aCropName =
        language === "si" ? a.cropNameSinhala :
        language === "ta" ? a.cropNameTamil :
        a.cropNameEnglish;

      const bCropName =
        language === "si" ? b.cropNameSinhala :
        language === "ta" ? b.cropNameTamil :
        b.cropNameEnglish;

      return aCropName.localeCompare(bCropName); // A-Z order
    });

    setCrop(orderedCrops); 
    } catch (error) {
      console.error("Error fetching crop data:", error);
    } finally {
      setLoading(false);
    }
  };

  const inputRef = useRef<TextInput>(null);
  const handlePress = () => {
    inputRef.current?.focus();
  };

  const filteredCrops = crop.filter((item) => {
    const searchField =
      language === "si"
        ? item.cropNameSinhala
        : language === "ta"
        ? item.cropNameTamil
        : item.cropNameEnglish;
    return searchField.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filterdVareity = selectedVariety.filter((item) => {
    const searchField =
      language === "si"
        ? item.varietyNameSinhala
        : language === "ta"
        ? item.varietyNameTamil
        : item.varietyNameEnglish;
    return searchField.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const categories = [
    {
      name: "Vegetables",
      SinhalaName: "එළවළු",
      TamilName: "காய்கறிகள்",
      image: require("../assets/images/Vegitables.webp"),
    },
    {
      name: "Fruit",
      SinhalaName: "පළතුරු",
      TamilName: "பழங்கள்",
      image: require("../assets/images/Fruit.webp"),
    },
    {
      name: "Grain",
      SinhalaName: "ධාන්‍ය",
      TamilName: "தான்ய",
      image: require("../assets/images/Grains.webp"),
    },
    {
      name: "Mushrooms",
      SinhalaName: "බිම්මල්",
      TamilName: "காளான்கள்",
      image: require("../assets/images/Mushroom.webp"),
    },
  ];

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
    setShowDistricts(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        fetchCrop();
        setSearchQuery("");
        dismissKeyboard();
       setSelectedVariety([]);
        setSelectedCropId('');
        setModalVisible(false);
        setSelectedCrop(false)


        // setSelectedVariety([]);
        // navigation.addListener("beforeRemove", (e) => {
        //   if (e.data.action.type !== "GO_BACK") {
        //     return;
        //   }
        //   e.preventDefault();
        // });
        //     setSelectedCrop(false);
        // setSelectedCropId(null);
      };
    }, [])
  );

    const dismissKeyboard = () => {
      Keyboard.dismiss();
    };

  const handleCropSelect = (cropId: string) => {
    setSelectedCropId(cropId);
    setSelectedCrop(true);
  };

  useEffect(() => {
    setLoading(true);
    const fetchCrop = async () => {
      if (!selectedCropId) return;

      try {
        const selectedLanguage = t("NewCrop.LNG");
        setLanguage(selectedLanguage);

        const varietyResponse = await axios.get<VarietyData[]>(
          `${environment.API_BASE_URL}api/crop/get-crop-variety/${selectedCropId}`
        );
        // setSelectedVariety(varietyResponse.data);

      // Sort the varieties based on the selected language
              const orderedVarieties = varietyResponse.data.sort((a, b) => {
        const aVarietyName = 
          selectedLanguage === "si" ? a.varietyNameSinhala :
          selectedLanguage === "ta" ? a.varietyNameTamil :
          a.varietyNameEnglish;

        const bVarietyName = 
          selectedLanguage === "si" ? b.varietyNameSinhala :
          selectedLanguage === "ta" ? b.varietyNameTamil :
          b.varietyNameEnglish;

        return aVarietyName.localeCompare(bVarietyName); 
      });

      setSelectedVariety(orderedVarieties);
    
        setTimeout(() => {
          setLoading(false);
        }, 300);
      } catch (error) {
        console.error("Error fetching crop data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCrop();
  }, [selectedCropId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCrop();
    setRefreshing(false);
  };

  const SkeletonLoader = () => (
    <View style={{ marginTop: hp("2%"), paddingHorizontal: wp("5%") }}>
      <ContentLoader
        speed={2}
        width={wp("90%")}
        height={hp("80%")}
        viewBox={`0 0 ${wp("90%")} ${hp("80%")}`}
        backgroundColor="#ececec"
        foregroundColor="#fafafa"
      >
        <Rect
          x="2"
          y="10"
          rx="12"
          ry="12"
          width={wp("28%")}
          height={hp("15%")}
        />
        <Rect
          x={wp("31%")}
          y="10"
          rx="12"
          ry="12"
          width={wp("28%")}
          height={hp("15%")}
        />
        <Rect
          x={wp("62%")}
          y="10"
          rx="12"
          ry="12"
          width={wp("28%")}
          height={hp("15%")}
        />

        <Rect
          x="2"
          y={hp("18%")}
          rx="12"
          ry="12"
          width={wp("28%")}
          height={hp("15%")}
        />
        <Rect
          x={wp("31%")}
          y={hp("18%")}
          rx="12"
          ry="12"
          width={wp("28%")}
          height={hp("15%")}
        />
        <Rect
          x={wp("62%")}
          y={hp("18%")}
          rx="12"
          ry="12"
          width={wp("28%")}
          height={hp("15%")}
        />

        <Rect
          x="2"
          y={hp("35%")}
          rx="12"
          ry="12"
          width={wp("28%")}
          height={hp("15%")}
        />
        <Rect
          x={wp("31%")}
          y={hp("35%")}
          rx="12"
          ry="12"
          width={wp("28%")}
          height={hp("15%")}
        />
        <Rect
          x={wp("62%")}
          y={hp("35%")}
          rx="12"
          ry="12"
          width={wp("28%")}
          height={hp("15%")}
        />

        <Rect
          x="2"
          y={hp("52%")}
          rx="12"
          ry="12"
          width={wp("28%")}
          height={hp("15%")}
        />
        <Rect
          x={wp("31%")}
          y={hp("52%")}
          rx="12"
          ry="12"
          width={wp("28%")}
          height={hp("15%")}
        />
        <Rect
          x={wp("62%")}
          y={hp("52%")}
          rx="12"
          ry="12"
          width={wp("28%")}
          height={hp("15%")}
        />
      </ContentLoader>
    </View>
  );

  // return (
  //   <SafeAreaView className="flex-1 bg-white">
  //     <StatusBar style="dark" />

  //     <View className="flex-row items-center justify-between px-4 pt-4">
  //       <View>
  //         <TouchableOpacity
  //           onPress={() => navigation.navigate("Main", { screen: "Dashboard" })}
  //           hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
  //         >
  //           <AntDesign
  //             name="left"
  //             size={24}
  //             color="#000502"
  //             onPress={() => navigation.goBack()}
  //           />
  //         </TouchableOpacity>
  //       </View>
  //       <View className="flex-1 items-center">
  //         <Text className="text-black text-xl font-bold ">
  //           {t("NewCrop.NewCrop")}
  //         </Text>
  //       </View>
  //     </View>

  //     {/* <View className="flex-row ml-6 mr-12 mt-6 justify-between">  for filter*/}
  //     <View className="flex-row  mt-6 items-center ml-5 mr-5 ">
  //       <TouchableOpacity
  //         onPress={handlePress}
  //         className="flex-row justify-center "
  //         // className="flex-row justify-center mr-5" for filter

  //       >
  //         <View className="flex-row items-center bg-gray-100 rounded-lg p-2 w-full max-w-md">
  //           <EvilIcons name="search" size={24} color="gray" />
  //           <TextInput
  //             ref={inputRef}
  //             className="ml-2 mr-6 text-base flex-1"
  //             placeholder={t("NewCrop.Search")}
  //             placeholderTextColor="gray"
  //             style={{ textAlignVertical: "center" }}
  //             value={searchQuery}
  //             onChangeText={setSearchQuery}
  //           />
  //         </View>
  //       </TouchableOpacity>

  //       {/* <View className="flex justify-center items-center bg-slate-200 mr-4 rounded-lg pl-1 pr-1">
  //         <TouchableOpacity onPress={toggleModal}>
  //           <MaterialIcons name="tune" size={30} color="green" />
  //         </TouchableOpacity>
  //       </View> */}
  //     </View>

  //     <Modal
  //       isVisible={isModalVisible}
  //       onBackdropPress={toggleModal}
  //       animationIn="slideInRight"
  //       animationOut="slideOutRight"
  //       style={{
  //         margin: 0,
  //         justifyContent: "flex-start",
  //         alignItems: "flex-end",
  //       }}
  //     >
  //       <View
  //         className="bg-white p-4 h-full mt-[10%]  mr-4 rounded-[25px]"
  //         style={{ width: wp(50) }}
  //       >
  //         <View className=" flex items-start justify-start mb-2">
  //           <TouchableOpacity onPress={toggleModal}>
  //             <View>
  //               <FontAwesome6 name="arrow-right-long" size={25} color="gray" />
  //             </View>
  //           </TouchableOpacity>
  //         </View>
  //         <TouchableOpacity
  //           className="bg-slate-100"
  //           onPress={() => setShowDistricts(true)}
  //         >
  //           <Text className="text-base mb-2">{t("NewCrop.District")}</Text>
  //         </TouchableOpacity>
  //         <View className="border-t border-gray-400" />
  //         <TouchableOpacity className="bg-slate-100">
  //           <Text className="text-base">{t("NewCrop.Price")}</Text>
  //         </TouchableOpacity>

  //         {showDistricts && (
  //           <ScrollView className="mt-4 mb-4">
  //             {CheckDistrict().map((district, index) => (
  //               <TouchableOpacity
  //                 key={index}
  //                 onPress={() => toggleDistrictSelection(district.value)}
  //               >
  //                 <Text className="text-base mb-2">{district.name}</Text>
  //               </TouchableOpacity>
  //             ))}
  //           </ScrollView>
  //         )}
  //       </View>
  //     </Modal>

  //     <View className="flex-row pl-6 pr-6 mt-6 justify-between">
  //       {categories.map((category, index) => (
  //         <View key={index}>
  //           <TouchableOpacity
  //             onPress={() => {
  //               if (selectedCategory === category.name) return;
  //               setSelectedCategory(category.name);
  //               setCrop([]);
  //               setSelectedCrop(false);
  //               setSelectedVariety([]);
  //               setSelectedCropId(null);
  //             }}
  //             className={`${
  //               selectedCategory === category.name
  //                 ? "bg-green-300 border-2 border-green-500"
  //                 : "bg-gray-200"
  //             } rounded-full p-2`}
  //             style={{
  //               width: wp("20%"),
  //               height: wp("20%"),
  //             }}
  //           >
  //             <Image
  //               source={category.image}
  //               className="rounded-[35px] h-14 w-14 "
  //               style={{
  //                 width: wp("14%"),
  //                 height: wp("14%"),
  //               }}
  //               resizeMode="cover"
  //             />
  //           </TouchableOpacity>
  //           <Text className="text-center">
  //             {language === "si"
  //               ? category.SinhalaName
  //               : language === "ta"
  //               ? category.TamilName
  //               : category.name}
  //           </Text>
  //         </View>
  //       ))}
  //     </View>

  //     {loading ? (
  //       <View style={{ flex: 1, alignItems: "center" }}>
  //         <SkeletonLoader />
  //       </View>
  //     ) : (
  //       <>
  //         {selectedCrop === false && (
  //           <ScrollView
  //             contentContainerStyle={{ flexGrow: 1, zIndex: 1 }}
  //             refreshControl={
  //               <RefreshControl
  //                 refreshing={refreshing}
  //                 onRefresh={handleRefresh}
  //               />
  //             }
  //           >
  //             <CropItem
  //               data={filteredCrops}
  //               navigation={navigation}
  //               lang={language}
  //               selectedCrop={selectedCrop}
  //               setSelectedCrop={setSelectedCrop}
  //               onCropSelect={handleCropSelect}
  //             />
  //           </ScrollView>
  //         )}
  //         {selectedCrop === true && (
  //           <>
  //             <View className="flex-row items-center justify-between px-6 mt-8">
  //               <View>
  //                 <TouchableOpacity
  //                   onPress={() => {
  //                     setSelectedCrop(false);
  //                     setSelectedVariety([]);
  //                     setSelectedCropId(null);
  //                   }}
  //                   hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
  //                 >
  //                   <AntDesign
  //                     name="arrowleft"
  //                     size={24}
  //                     color="#000502"
  //                     onPress={() => {
  //                       setLoading(true);
  //                       setSelectedCrop(false);
  //                       setSelectedVariety([]);
  //                       setSelectedCropId(null);

  //                       setTimeout(() => {
  //                         setLoading(false);
  //                       }, 300);
  //                     }}
  //                   />
  //                 </TouchableOpacity>
  //               </View>
  //               <View className="flex-1 items-center">
  //                 <Text className="text-black text-xl  ">
  //                   {language === "en"
  //                     ? crop.find((c) => c.id === selectedCropId)
  //                         ?.cropNameEnglish
  //                     : language === "ta"
  //                     ? crop.find((c) => c.id === selectedCropId)?.cropNameTamil
  //                     : crop.find((c) => c.id === selectedCropId)
  //                         ?.cropNameSinhala} {t("TransactionList.Varieties")}
  //                 </Text>
  //               </View>
  //             </View>
  //             {loading ? (
  //               <View style={{ flex: 1, alignItems: "center" }}>
  //                 <SkeletonLoader />
  //               </View>
  //             ) : (
  //               <>
  //                 <ScrollView>
  //                   <CropVariety
  //                     data={filterdVareity}
  //                     navigation={navigation}
  //                     lang={language}
  //                     selectedCrop={selectedCrop}
  //                   />
  //                 </ScrollView>
  //               </>
  //             )}
  //           </>
  //         )}
  //       </>
  //     )}
  //   </SafeAreaView>
  // );
  return (
  <View className="flex-1 bg-white">
    <StatusBar style="dark" />

    <View className="flex-row items-center justify-between px-4 pt-4">
      <View>
        <TouchableOpacity
          onPress={() => navigation.navigate("Main", { screen: "Dashboard" })}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <AntDesign
            name="left"
            size={24}
            color="#000502"
            onPress={() => navigation.goBack()}
          />
        </TouchableOpacity>
      </View>
      <View className="flex-1 items-center">
        <Text className="text-black text-xl font-bold ">
          {t("NewCrop.NewCrop")}
        </Text>
      </View>
    </View>

    {/* <View className="flex-row ml-6 mr-12 mt-6 justify-between">  for filter*/}
    <View className="flex-row  mt-6 items-center ml-5 mr-5 ">
      <TouchableOpacity
        onPress={handlePress}
        className="flex-row justify-center "
        // className="flex-row justify-center mr-5" for filter

      >
        <View className="flex-row items-center bg-gray-100 rounded-lg p-2 w-full max-w-md">
          <EvilIcons name="search" size={24} color="gray" />
          <TextInput
            ref={inputRef}
            className="ml-2 mr-6 text-base flex-1"
            placeholder={t("NewCrop.Search")}
            placeholderTextColor="gray"
            style={{ textAlignVertical: "center" }}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </TouchableOpacity>

      {/* <View className="flex justify-center items-center bg-slate-200 mr-4 rounded-lg pl-1 pr-1">
        <TouchableOpacity onPress={toggleModal}>
          <MaterialIcons name="tune" size={30} color="green" />
        </TouchableOpacity>
      </View> */}
    </View>

    <Modal
      isVisible={isModalVisible}
      onBackdropPress={toggleModal}
      animationIn="slideInRight"
      animationOut="slideOutRight"
      style={{
        margin: 0,
        justifyContent: "flex-start",
        alignItems: "flex-end",
      }}
    >
      <View
        className="bg-white p-4 h-full mt-[10%]  mr-4 rounded-[25px]"
        style={{ width: wp(50) }}
      >
        <View className=" flex items-start justify-start mb-2">
          <TouchableOpacity onPress={toggleModal}>
            <View>
              <FontAwesome6 name="arrow-right-long" size={25} color="gray" />
            </View>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          className="bg-slate-100"
          onPress={() => setShowDistricts(true)}
        >
          <Text className="text-base mb-2">{t("NewCrop.District")}</Text>
        </TouchableOpacity>
        <View className="border-t border-gray-400" />
        <TouchableOpacity className="bg-slate-100">
          <Text className="text-base">{t("NewCrop.Price")}</Text>
        </TouchableOpacity>

        {showDistricts && (
          <ScrollView className="mt-4 mb-4">
            {CheckDistrict().map((district, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => toggleDistrictSelection(district.value)}
              >
                <Text className="text-base mb-2">{district.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    </Modal>

    <View className="flex-row pl-6 pr-6 mt-6 justify-between">
      {categories.map((category, index) => (
        <View key={index}>
          <TouchableOpacity
            onPress={() => {
              if (selectedCategory === category.name) return;
              setSelectedCategory(category.name);
              setCrop([]);
              setSelectedCrop(false);
              setSelectedVariety([]);
              setSelectedCropId(null);
            }}
            className={`${
              selectedCategory === category.name
                ? "bg-green-300 border-2 border-green-500"
                : "bg-gray-200"
            } rounded-full p-2`}
            style={{
              width: wp("20%"),
              height: wp("20%"),
            }}
          >
            <Image
              source={category.image}
              className="rounded-[35px] h-14 w-14 "
              style={{
                width: wp("14%"),
                height: wp("14%"),
              }}
              resizeMode="cover"
            />
          </TouchableOpacity>
          <Text className="text-center">
            {language === "si"
              ? category.SinhalaName
              : language === "ta"
              ? category.TamilName
              : category.name}
          </Text>
        </View>
      ))}
    </View>

    {loading ? (
      <View style={{ flex: 1, alignItems: "center" }}>
        <SkeletonLoader />
      </View>
    ) : (
      <>
        {selectedCrop === false && (
          <>
            {filteredCrops && filteredCrops.length > 0 ? (
              <ScrollView
                contentContainerStyle={{ flexGrow: 1, zIndex: 1 }}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                  />
                }
              >
                <CropItem
                  data={filteredCrops}
                  navigation={navigation}
                  lang={language}
                  selectedCrop={selectedCrop}
                  setSelectedCrop={setSelectedCrop}
                  onCropSelect={handleCropSelect}
                />
              </ScrollView>
            ) : (
              <View style={{ 
                flex: 1, 
                justifyContent: 'center', 
                alignItems: 'center',
                paddingHorizontal: 20 
              }}>
                <LottieView
                  source={require('../assets/jsons/NoComplaints.json')}
                  autoPlay
                  loop
                  style={{ width: 150, height: 150 }}
                />
                <Text style={{ 
                  fontSize: 18, 
                  color: '#666', 
                  textAlign: 'center',
                  marginTop: 20,
                  fontWeight: '500'
                }}>
                   {searchQuery ? 
                    t("NewCrop.No results found") : 
                    'No crops available'
                  }
                </Text>
                {searchQuery && (
                  <Text style={{ 
                    fontSize: 14, 
                    color: '#999', 
                    textAlign: 'center',
                    marginTop: 10
                  }}>
                 
                  </Text>
                )}
              </View>
            )}
          </>
        )}
        {selectedCrop === true && (
          <>
            <View className="flex-row items-center justify-between px-6 mt-8">
              <View>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedCrop(false);
                    setSelectedVariety([]);
                    setSelectedCropId(null);
                  }}
                  hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                >
                  <AntDesign
                    name="arrow-left"
                    size={24}
                    color="#000502"
                    onPress={() => {
                      setLoading(true);
                      setSelectedCrop(false);
                      setSelectedVariety([]);
                      setSelectedCropId(null);

                      setTimeout(() => {
                        setLoading(false);
                      }, 300);
                    }}
                  />
                </TouchableOpacity>
              </View>
              <View className="flex-1 items-center">
                <Text className="text-black text-xl  ">
                  {language === "en"
                    ? crop.find((c) => c.id === selectedCropId)
                        ?.cropNameEnglish
                    : language === "ta"
                    ? crop.find((c) => c.id === selectedCropId)?.cropNameTamil
                    : crop.find((c) => c.id === selectedCropId)
                        ?.cropNameSinhala} {t("TransactionList.Varieties")}
                </Text>
              </View>
            </View>
            {loading ? (
              <View style={{ flex: 1, alignItems: "center" }}>
                <SkeletonLoader />
              </View>
            ) : (
              <>
                {filterdVareity && filterdVareity.length > 0 ? (
                  <ScrollView>
                    <CropVariety
                      data={filterdVareity}
                      navigation={navigation}
                      lang={language}
                      selectedCrop={selectedCrop}
                    />
                  </ScrollView>
                ) : (
                  <View style={{ 
                    flex: 1, 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    paddingHorizontal: 20 
                  }}>
                    <LottieView
                      source={require('../assets/jsons/NoComplaints.json')}
                      autoPlay
                      loop
                      style={{ width: 150, height: 150 }}
                    />
                    <Text style={{ 
                      fontSize: 18, 
                      color: 'black', 
                      textAlign: 'center',
                      marginTop: 20
                   
                    }}>
                     {t("NewCrop.No results found")}
                    </Text>
                    <Text style={{ 
                      fontSize: 14, 
                      color: '#999', 
                      textAlign: 'center',
                      marginTop: 10
                    }}>
                  
                    </Text>
                  </View>
                )}
              </>
            )}
          </>
        )}
      </>
    )}
  </View>
);
};

export default NewCrop;
