import React, { useState, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  StyleSheet,
  StatusBar,
} from "react-native";
import Swiper from "react-native-swiper";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import CustomHeader from "./CustomHeader";

interface ImageData {
  uri: string;
  url?: string;
  title?: string;
  description?: string;
  uploadedBy?: string;
  createdAt?: string;
  from?: string;
}

interface ImageViewerModalProps {
  visible: boolean;
  images: ImageData[];
  initialIndex: number;
  onClose: () => void;
}

const { width, height } = Dimensions.get("window");

const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  visible,
  images,
  initialIndex,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const swiperRef = useRef<any>(null);
  const { t } = useTranslation();

  React.useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const onIndexChanged = (index: number) => {
    setCurrentIndex(index);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    if (swiperRef.current) {
      swiperRef.current.scrollBy(index - currentIndex);
    }
  };

  if (!visible || !images || images.length === 0) {
    return null;
  }

  const showNavigation = images.length > 1;
  const isFirstPhoto = currentIndex === 0;
  const isLastPhoto = currentIndex === images.length - 1;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      statusBarTranslucent
      onRequestClose={onClose}
      presentationStyle="fullScreen"
    >
      
      <View style={styles.container}>
        <CustomHeader
          title={
            images[currentIndex]?.from === "certificate"
              ? ""
              : `${images.length} ${
                  images.length !== 1
                    ? t("ImageViewerModal.Photos")
                    : t("ImageViewerModal.Photo")
                }`
          }
          showBackButton={false}
          headerStyle={{ paddingTop: 50 }}
          rightComponent={
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={25} color="black" />
            </TouchableOpacity>
          }
        />

        {images[currentIndex]?.uploadedBy && (
          <View style={styles.uploadedByContainer}>
            <Text style={styles.uploadedBy}>
              {t("ImageViewerModal.UploadedBy")}{" "}
              {images[currentIndex].uploadedBy === "You"
                ? t("ImageViewerModal.You")
                : images[currentIndex].uploadedBy}
            </Text>
          </View>
        )}

        {showNavigation && (
          <View style={styles.navigationContainer}>
            <View style={styles.navButton}>
              {!isFirstPhoto ? (
                <TouchableOpacity
                  onPress={() => {
                    const newIndex = currentIndex - 1;
                    goToSlide(newIndex);
                  }}
                >
                  <Ionicons name="chevron-back" size={20} color="#666" />
                </TouchableOpacity>
              ) : (
                <View />
              )}
            </View>

            <View style={styles.counterContainer}>
              <Text style={styles.currentIndex}>{currentIndex + 1}</Text>
              <Text style={styles.separator}>
                {t("ImageViewerModal.OutOf")}
              </Text>
              <Text style={styles.totalCount}>{images.length}</Text>
            </View>

            <View style={styles.navButton}>
              {!isLastPhoto ? (
                <TouchableOpacity
                  onPress={() => {
                    const newIndex = currentIndex + 1;
                    goToSlide(newIndex);
                  }}
                >
                  <Ionicons name="chevron-forward" size={20} color="#666" />
                </TouchableOpacity>
              ) : (
                <View />
              )}
            </View>
          </View>
        )}

        {/* Image Swiper */}
        <View style={styles.swiperContainer}>
          <Swiper
            ref={swiperRef}
            index={initialIndex}
            onIndexChanged={onIndexChanged}
            showsPagination={true}
            dotColor="rgba(0, 0, 0, 0.2)"
            activeDotColor="#333"
            paginationStyle={styles.pagination}
            loop={false}
            showsButtons={false}
          >
            {images.map((image, index) => (
              <View key={index} style={styles.slide}>
                <Image
                  source={{ uri: image.uri }}
                  style={styles.image}
                  resizeMode="cover"
                  onError={(error) => {
                    console.error("Image load error:", error);
                  }}
                />
              </View>
            ))}
          </Swiper>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  closeButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "#F6F6F6",
    justifyContent: "center",
    alignItems: "center",
  },
  uploadedBy: {
    color: "#666",
    fontSize: 15,
    textAlign: "center",
  },
  uploadedByContainer: {
    alignItems: "center",
    paddingBottom: 10,
    backgroundColor: "white",
  },
  navigationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 30,
    paddingVertical: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  navButton: {
    width: 32,
    height: 32,
  },
  counterContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  currentIndex: {
    color: "#333",
    fontSize: 15,
    fontWeight: "600",
    marginRight: 4,
  },
  separator: {
    color: "#666",
    fontSize: 13,
    marginHorizontal: 4,
  },
  totalCount: {
    color: "#333",
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 4,
  },
  swiperContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  slide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingBottom: 60,
  },
  image: {
    width: width - 20,
    height: height * 0.6,
    borderRadius: 20,
  },
  pagination: {
    bottom: 20,
  },
});

export default ImageViewerModal;
