import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import { RootStackParamList } from "./types";
import { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import NavigationBar from "@/Items/NavigationBar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { environment } from "@/environment/environment";
import { useTranslation } from "react-i18next";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

type AddAssetNavigationProp = StackNavigationProp<
  RootStackParamList,
  "AddAsset"
>;

interface AddAssetProps {
  navigation: AddAssetNavigationProp;
}

const AddAssetScreen: React.FC<AddAssetProps> = ({ navigation }) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedAsset, setSelectedAsset] = useState("");
  const [brands, setBrands] = useState<string[]>([]);
  const [brand, setBrand] = useState("");
  const [batchNum, setBatchNum] = useState("");
  const [volume, setVolume] = useState("");
  const [unit, setUnit] = useState("ml");
  const [numberOfUnits, setNumberOfUnits] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [totalPrice, setTotalPrice] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [expireDate, setExpireDate] = useState("");
  const [warranty, setWarranty] = useState("");
  //const [status, setStatus] = useState("Expired");
  const [showPurchaseDatePicker, setShowPurchaseDatePicker] = useState(false);
  const [showExpireDatePicker, setShowExpireDatePicker] = useState(false);
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const [customCategory, setCustomCategory] = useState("");
  const [customAsset, setCustomAsset] = useState("");

  const [status, setStatus] = useState(t("CurrentAssets.expired"));

  const statusMapping = {
    [t("CurrentAssets.expired")]: "Expired",
    [t("CurrentAssets.stillvalide")]: "Still valid",
  };

  useEffect(() => {
    setLoading(true);
    try {
      const data = require("../asset.json");
      setCategories(Object.keys(data));
    } catch (error) {
      // console.error("Error loading categories", error);
      // Alert.alert(t("CurrentAssets.error"), "Unable to load categories");
      Alert.alert(t("Main.error"), t("Main.somethingWentWrong"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (numberOfUnits && unitPrice) {
      const total = parseFloat(numberOfUnits) * parseFloat(unitPrice);
      setTotalPrice(total.toString());
    }
  }, [numberOfUnits, unitPrice]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);

    const assetsJson = require("../asset.json");
    const selectedAssets = assetsJson[category] || [];
    setAssets(selectedAssets);
    setSelectedAsset("");
    setBrand("");
    setBrands([]);
  };

  const handleAssetChange = (asset: string) => {
    setSelectedAsset(asset);

    const selected = assets.find((a) => a.asset === asset);

    if (selected) {
      setBrands(selected.brands || []);
      setBrand("");
    }
  };

  const handleDateChange = (
    event: any,
    selectedDate: any,
    type: "purchase" | "expire"
  ) => {
    const currentDate = selectedDate || new Date();
    const dateString = currentDate.toISOString().slice(0, 10);

    if (type === "purchase") {
      if (new Date(dateString) > new Date()) {
        Alert.alert(
          t("CurrentAssets.sorry"),
          t("CurrentAssets.futureDateError")
        );
        return;
      }
      setPurchaseDate(dateString);
      setShowPurchaseDatePicker(false);

      if (expireDate && new Date(dateString) > new Date(expireDate)) {
        Alert.alert(
          t("CurrentAssets.sorry"),
          t("CurrentAssets.expireBeforePurchase")
        );
        setExpireDate("");
        setWarranty("");
      } else if (expireDate) {
        calculateWarranty(dateString, expireDate);
      }
    } else if (type === "expire") {
      if (new Date(dateString) < new Date(purchaseDate)) {
        Alert.alert(
          t("CurrentAssets.sorry"),
          t("CurrentAssets.expireBeforePurchase")
        );
        return;
      }
      setExpireDate(dateString);
      setShowExpireDatePicker(false);

      setStatus(
        new Date(dateString) < new Date()
          ? t("CurrentAssets.expired")
          : t("CurrentAssets.stillvalide")
      );

      if (purchaseDate) {
        calculateWarranty(purchaseDate, dateString);
      }
    }
  };

  const calculateWarranty = (purchase: string, expire: string) => {
    const purchaseDate = new Date(purchase);
    const expireDate = new Date(expire);

    const diffTime = expireDate.getTime() - purchaseDate.getTime();
    const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30));

    setWarranty(diffMonths > 0 ? diffMonths.toString() : "0");
  };

  const handleAddAsset = async () => {
    if (
      !selectedCategory ||
      !selectedAsset ||
      !brand ||
      !batchNum ||
      !volume ||
      !unit ||
      !numberOfUnits ||
      !unitPrice ||
      !purchaseDate ||
      !expireDate ||
      !warranty ||
      !status
    ) {
      Alert.alert(
        t("CurrentAssets.sorry"),
        t("CurrentAssets.missingFields")
      );
      return;
    }

    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        // Alert.alert(t("CurrentAssets.error"), t("CurrentAssets.noTokenError"));
        Alert.alert(t("Main.error"), t("Main.somethingWentWrong"));
        return;
      }

      const backendStatus = statusMapping[status] || "Expired";

      const response = await axios.post(
        `${environment.API_BASE_URL}api/auth/currentAsset`,
        {
          category: selectedCategory,
          asset: selectedAsset,
          brand,
          batchNum,
          volume,
          unit,
          numberOfUnits,
          unitPrice,
          totalPrice,
          purchaseDate,
          expireDate,
          warranty,
          status: backendStatus,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // console.log("Asset added successfully:", response.data);
      Alert.alert(
        t("CurrentAssets.success"),
        t("CurrentAssets.addAssetSuccess")
      );
      navigation.goBack();
    } catch (error) {
      // console.error("Error adding asset:", error);
      // Alert.alert(t("CurrentAssets.error"), t("CurrentAssets.addAssetFailure"));
      Alert.alert(t("Main.error"), t("Main.somethingWentWrong"));
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#00ff00" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">

      <View
        className="flex-row justify-between "
        style={{ paddingHorizontal: wp(4), paddingVertical: hp(2) }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} className="">
          <AntDesign name="left" size={24} color="#000502" />
        </TouchableOpacity>
        <View className="flex-1 items-center">
          <Text className="text-lg font-bold">{t("FixedAssets.myAssets")}</Text>
        </View>
      </View>
      <View className="space-y-4 p-8">
        <View>
          <Text className="text-gray-600 mb-2">
            {t("CurrentAssets.selectcategory")}
          </Text>
          <View className="bg-gray-200 rounded-[30px]">
            <Picker
              selectedValue={selectedCategory}
              onValueChange={(value) => handleCategoryChange(value)}
              className="bg-gray-200 rounded"
            >
              <Picker.Item
                label={t("CurrentAssets.selectCategory")}
                value=""
              />
              {categories.map((cat, index) => (
                <Picker.Item
                  key={index}
                  label={t(`CurrentAssets.${cat}`)}
                  value={cat}
                />
              ))}
              <Picker.Item
                label={t("CurrentAssets.Otherconsumables")}
                value="Other consumables"
              />
            </Picker>
          </View>

          {selectedCategory === "Other consumables" ? (
            <>
              <Text className="text-gray-600 mt-4 mb-2">
                {t("CurrentAssets.asset")}
              </Text>
              <TextInput
                placeholder={t("CurrentAssets.selectasset")}
                value={selectedAsset}
                onChangeText={setSelectedAsset}
                className="bg-gray-100 p-2 rounded-[30px] h-[50px] mt-2"
              />

              <Text className="text-gray-600 mt-4 mb-2">
                {t("CurrentAssets.brand")}
              </Text>
              <TextInput
                placeholder={t("CurrentAssets.selectbrand")}
                value={brand}
                onChangeText={setBrand}
                className="bg-gray-100 p-2 rounded-[30px] h-[50px] mt-2"
              />
            </>
          ) : (
            <>
              <Text className="text-gray-600 mt-4 mb-2">
                {t("CurrentAssets.asset")}
              </Text>
              <View className="bg-gray-200 rounded-[30px]">
                <Picker
                  selectedValue={selectedAsset}
                  onValueChange={(value) => handleAssetChange(value)}
                  className="bg-gray-200 rounded"
                >
                  <Picker.Item
                    label={t("CurrentAssets.selectasset")}
                    value=""
                  />
                  {assets.map((asset, index) => (
                    <Picker.Item
                      key={index}
                      label={t(`CurrentAssets.${asset.asset}`)}
                      value={asset.asset}
                    />
                  ))}
                  <Picker.Item label={t("CurrentAssets.Other")} value="Other" />
                </Picker>
              </View>

              {selectedAsset === "Other" && (
                <>
                  <Text className="text-gray-600 mt-4 mb-2">
                    {t("CurrentAssets.mentionother")}
                  </Text>
                  <TextInput
                    placeholder={t("CurrentAssets.other")}
                    value={customAsset}
                    onChangeText={setCustomAsset}
                    className="bg-gray-100 p-2 rounded-[30px] h-[50px] mt-2"
                  />
                </>
              )}
            </>
          )}

          {selectedCategory !== "Other consumables" && (
            <>
              <Text className="text-gray-600 mt-4 mb-2">
                {t("CurrentAssets.brand")}
              </Text>
              <View className="bg-gray-200 rounded-[30px]">
                <Picker
                  selectedValue={brand}
                  onValueChange={setBrand}
                  className="bg-gray-200 p-2 rounded-[30px] h-[50px]"
                >
                  <Picker.Item
                    label={t("CurrentAssets.selectbrand")}
                    value=""
                  />
                  {brands.map((b, index) => (
                    <Picker.Item key={index} label={b} value={b} />
                  ))}
                </Picker>
              </View>
            </>
          )}
        </View>

        <Text className="text-gray-600">{t("CurrentAssets.batchnumber")}</Text>
        <TextInput
          placeholder={t("CurrentAssets.batchnumber")}
          value={batchNum}
          onChangeText={setBatchNum}
          className="bg-gray-200 p-2 pl-4 rounded-[30px] h-[50px]"
          keyboardType="numeric"
        />

        <Text className="text-gray-600 ">
          {t("CurrentAssets.unitvolume_weight")}
        </Text>
        <View className="flex-row items-center justify-between bg-white">
          <TextInput
            placeholder={t("CurrentAssets.unitvolume_weight")}
            value={volume}
            onChangeText={setVolume}
            keyboardType="decimal-pad"
            className="flex-[2] mr-2 py-2 px-4 h-[55px] bg-gray-200 rounded-[10px]"
          />

          <View className="bg-gray-200 rounded-[10px]  flex-1">
            <Picker
              selectedValue={unit}
              onValueChange={(itemValue) => setUnit(itemValue)}
              className="flex-1  "
              dropdownIconColor="gray"
            >
              <Picker.Item label={t("CurrentAssets.ml")} value="ml" />
              <Picker.Item label={t("CurrentAssets.kg")} value="kg" />
              <Picker.Item label={t("CurrentAssets.l")} value="l" />
            </Picker>
          </View>
        </View>

        <Text className="text-gray-600">
          {t("CurrentAssets.numberofunits")}
        </Text>
        <TextInput
          placeholder={t("CurrentAssets.numberofunits")}
          keyboardType="numeric"
          value={numberOfUnits}
          onChangeText={setNumberOfUnits}
          className="bg-gray-200 p-2 pl-4 rounded-[30px] h-[50px]"
        />

        <Text className="text-gray-600">{t("CurrentAssets.unitprice")}</Text>
        <TextInput
          placeholder={t("CurrentAssets.unitprice")}
          keyboardType="numeric"
          value={unitPrice}
          onChangeText={setUnitPrice}
          className="bg-gray-200 p-2 pl-4 rounded-[30px] h-[50px]"
        />

        <Text className="text-gray-600">{t("CurrentAssets.totalprice")}</Text>
        <TextInput
          placeholder={t("CurrentAssets.totalprice")}
          value={totalPrice}
          editable={false}
          className="bg-gray-200 p-2 pl-4 rounded-[30px] h-[50px]"
        />

        <Text className="text-gray-600">{t("CurrentAssets.purchasedate")}</Text>
        <TouchableOpacity
          onPress={() => setShowPurchaseDatePicker(true)}
          className="bg-gray-200 p-2 pl-4 rounded-[30px] h-[50px] justify-center"
          
        >
          <Text>
            {purchaseDate
              ? purchaseDate.toString()
              : t("CurrentAssets.purchasedate")}
          </Text>
        </TouchableOpacity>
        {showPurchaseDatePicker && (
          <DateTimePicker
            value={purchaseDate ? new Date(purchaseDate) : new Date()}
            mode="date"
            display="default"
            onChange={(event, date) =>
              handleDateChange(event, date, "purchase")
            }
          />
        )}

        <Text className="text-gray-600">{t("CurrentAssets.expiredate")}</Text>
        <TouchableOpacity
          onPress={() => setShowExpireDatePicker(true)}
          className="bg-gray-200 p-2 rounded-[30px] h-[50px] pl-4 justify-center"
        >
          <Text>
            {expireDate ? expireDate.toString() : t("CurrentAssets.expiredate")}
          </Text>
        </TouchableOpacity>
        {showExpireDatePicker && (
          <DateTimePicker
            value={expireDate ? new Date(expireDate) : new Date()}
            mode="date"
            display="default"
            onChange={(event, date) => handleDateChange(event, date, "expire")}
          />
        )}

        <Text className="text-gray-600">
          {t("CurrentAssets.warrentyinmonths")}
        </Text>
        <TextInput
          placeholder={t("CurrentAssets.warrentyinmonths")}
          value={warranty}
          onChangeText={setWarranty}
          keyboardType="numeric"
          className="bg-gray-200 p-2 pl-4 rounded-[30px] h-[50px]"
          editable={false}
        />

        <Text className="text-gray-600">{t("CurrentAssets.status")}</Text>
        {/* <View className="bg-gray-200 rounded-[30px]">
          <Picker
            selectedValue={status}
            onValueChange={setStatus}
            className="bg-gray-200 rounded"
            style={{ display: "none" }}
          >
            <Picker.Item label={t("CurrentAssets.expired")} value="Expired" />
            <Picker.Item
              label={t("CurrentAssets.stillvalide")}
              value="still valid"
            />
          </Picker>
        </View> */}
        <View className="bg-gray-200 rounded-[40px] p-2 items-center justify-center">
          <Text
            className={`text-lg font-bold ${
              status === t("CurrentAssets.expired")
                ? "text-red-500"
                : "text-green-500"
            }`}
          >
            {status === t("CurrentAssets.expired")
              ? t("CurrentAssets.expired")
              : t("CurrentAssets.stillvalide")}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleAddAsset}
          className="bg-green-400 rounded-[30px] p-3 mt-4"
        >
          <Text className="text-white text-center">
            {t("CurrentAssets.AddAsset")}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default AddAssetScreen;
