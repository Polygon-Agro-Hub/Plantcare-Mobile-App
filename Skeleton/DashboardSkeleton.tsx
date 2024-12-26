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
        <Circle cx={wp('15%')} cy={hp('8%')} r={hp('5%')} />
        <Rect x={wp('30%')} y={hp('5%')} rx="4" ry="4" width={wp('30%')} height={hp('1.5%')} />

        {/* Center the two rectangles */}
        <Rect x={startX} y={hp('74%')} rx="10" ry="10" width={rectWidth} height={hp('15%')} />
        <Rect
          x={startX + rectWidth + gapBetweenRects}
          y={hp('74%')}
          rx="10"
          ry="10"
          width={rectWidth}
          height={hp('15%')}
        />
      </ContentLoader>
    </View>
  );
};

export default DashboardSkeleton;
