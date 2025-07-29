import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import Swiper from 'react-native-swiper';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Type definitions
interface ImageData {
  uri: string;
  url?: string;
  title?: string;
  description?: string;
  uploadedBy?: string;
}

interface ImageViewerModalProps {
  visible: boolean;
  onClose: () => void;
  images: ImageData[];
  currentIndex?: number;
}

const ImageViewerModal: React.FC<ImageViewerModalProps> = ({ 
  visible, 
  onClose, 
  images, 
  currentIndex = 0 
}) => {
  const [activeIndex, setActiveIndex] = useState<number>(currentIndex);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <StatusBar backgroundColor="black" barStyle="light-content" />
      <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingVertical: 15,
          backgroundColor: 'rgba(0,0,0,0.8)'
        }}>
          <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
            {images?.length > 0 ? `${activeIndex + 1} of ${images.length}` : '0 Photos'}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={30} color="white" />
          </TouchableOpacity>
        </View>

        {/* Image Swiper */}
        <View style={{ flex: 1 }}>
          {images && images.length > 0 ? (
            <Swiper
              index={currentIndex}
              showsButtons={false}
              showsPagination={true}
              paginationStyle={{ bottom: 50 }}
              dotStyle={{
                backgroundColor: 'rgba(255,255,255,0.3)',
                width: 8,
                height: 8,
                borderRadius: 4,
                marginLeft: 3,
                marginRight: 3,
              }}
              activeDotStyle={{
                backgroundColor: 'white',
                width: 8,
                height: 8,
                borderRadius: 4,
                marginLeft: 3,
                marginRight: 3,
              }}
              onIndexChanged={(index: number) => setActiveIndex(index)}
            >
              {images.map((image: ImageData, index: number) => (
                <View key={index} style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'black'
                }}>
                  <Image
                    source={{ uri: image.uri || image.url || '' }}
                    style={{
                      width: width,
                      height: height * 0.7,
                      resizeMode: 'contain'
                    }}
                    onError={(error) => console.log('Image load error:', error)}
                  />
                  {/* Image metadata */}
                  {image.title && (
                    <View style={{
                      position: 'absolute',
                      bottom: 100,
                      left: 20,
                      right: 20,
                      backgroundColor: 'rgba(0,0,0,0.7)',
                      padding: 15,
                      borderRadius: 10
                    }}>
                      <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                        {image.title}
                      </Text>
                      {image.description && (
                        <Text style={{ color: 'white', fontSize: 14, marginTop: 5 }}>
                          {image.description}
                        </Text>
                      )}
                      {image.uploadedBy && (
                        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 5 }}>
                          Uploaded by: {image.uploadedBy}
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              ))}
            </Swiper>
          ) : (
            <View style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Text style={{ color: 'white', fontSize: 18 }}>No images available</Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default ImageViewerModal;