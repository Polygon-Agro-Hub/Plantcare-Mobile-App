import React from 'react';
import { View } from 'react-native';
import ContentLoader, { Rect, Circle } from 'react-content-loader/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const DashboardSkeleton = () => {
  const rectWidth = wp('38%');
  const gapBetweenRects = wp('8%'); // Adjust as needed
  const totalWidth = 2 * rectWidth + gapBetweenRects;
  const startX = (wp('100%') - totalWidth) / 2;

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ContentLoader
        speed={1}
        width="100%"
        height="100%"
        backgroundColor="#f3f3f3"
        foregroundColor="#ecebeb"
      >

        <Rect x={startX} y={hp('74%')} rx="10" ry="10" width={rectWidth} height={hp('50%')} />

      </ContentLoader>
    </View>
  );
};

export default DashboardSkeleton;
