import React, { useState, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Swiper from 'react-native-swiper';
import { Ionicons } from '@expo/vector-icons';

interface ImageData {
  uri: string;
  url?: string;
  title?: string;
  description?: string;
  uploadedBy?: string;
  createdAt?: string;
}

interface ImageViewerModalProps {
  visible: boolean;
  images: ImageData[];
  initialIndex: number;
  onClose: () => void;
}

const { width, height } = Dimensions.get('window');

const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  visible,
  images,
  initialIndex,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const swiperRef = useRef<any>(null);

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

  // Check if we should show navigation arrows
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
      <StatusBar backgroundColor="white" barStyle="dark-content" />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.photoCount}>
              {images.length} Photo{images.length !== 1 ? 's' : ''}
            </Text>
            {images[currentIndex]?.uploadedBy && (
              <Text style={styles.uploadedBy}>
                Uploaded By : {images[currentIndex].uploadedBy}
              </Text>
            )}
          </View>
          
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Navigation Counter - Only show if multiple photos */}
        {showNavigation && (
          <View style={styles.navigationContainer}>
            {/* Left Arrow - Only show if not first photo */}
            <View style={styles.navButton}>
              {!isFirstPhoto ? (
                <TouchableOpacity 
                  onPress={() => {
                    const newIndex = currentIndex - 1;
                    goToSlide(newIndex);
                  }}
                //  style={styles.navButtonTouchable}
                >
                  <Ionicons 
                    name="chevron-back" 
                    size={20} 
                    color="#666" 
                  />
                </TouchableOpacity>
              ) : (
                <View  />
              )}
            </View>
            
            <View style={styles.counterContainer}>
              <Text style={styles.currentIndex}>{currentIndex + 1}</Text>
              <Text style={styles.separator}>out of</Text>
              <Text style={styles.totalCount}>{images.length}</Text>
            </View>
            
            {/* Right Arrow - Only show if not last photo */}
            <View style={styles.navButton}>
              {!isLastPhoto ? (
                <TouchableOpacity 
                  onPress={() => {
                    const newIndex = currentIndex + 1;
                    goToSlide(newIndex);
                  }}
                 // style={styles.navButtonTouchable}
                >
                  <Ionicons 
                    name="chevron-forward" 
                    size={20} 
                    color="#666" 
                  />
                </TouchableOpacity>
              ) : (
                <View  />
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
                    console.error('Image load error:', error);
                  }}
                />
              </View>
            ))}
          </Swiper>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: 'white',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  photoCount: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
  },
  uploadedBy: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#959292ff',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: 20,
    top: 15,
    marginTop: 40
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  navButton: {
    width: 32,
    height: 32,
  },
  // navButtonTouchable: {
  //   width: 32,
  //   height: 32,
  //   borderRadius: 16,
  //   backgroundColor: '#f8f8f8',
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   borderWidth: 1,
  //   borderColor: '#e0e0e0',
  // },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  currentIndex: {
    color: '#333',
    fontSize: 15,
    fontWeight: '600',
    marginRight: 4,
  },
  separator: {
    color: '#666',
    fontSize: 13,
    marginHorizontal: 4,
  },
  totalCount: {
    color: '#333',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 4,
  },
  swiperContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingBottom: 60,
  },
  image: {
    width: width - 20,
    height: height * 0.60,
    borderRadius: 20,
  },
  pagination: {
    bottom: 20,
  },
});

export default ImageViewerModal;