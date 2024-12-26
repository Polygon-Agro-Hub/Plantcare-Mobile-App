import React from 'react';
import ContentLoader, { Rect, Circle } from 'react-content-loader/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const FarmerQrSkeletonLoader: React.FC = () => (
  <ContentLoader
    speed={1}
    width="100%"
    height={hp('100%')}
    backgroundColor="#f3f3f3"
    foregroundColor="#ecebeb"
  >
    {/* Farmer Name */}
    <Rect x={wp('15%')} y={hp('10%')} rx="8" ry="8" width={wp('60%')} height={hp('3%')} />
    <Rect x={wp('25%')} y={hp('15%')} rx="8" ry="8" width={wp('40%')} height={hp('2%')} />

    {/* QR Code Placeholder */}
    <Rect x={wp('10%')} y={hp('20%')} rx="8" ry="8" width={wp('70%')} height={wp('70%')} />

    {/* Buttons */}
    <Rect x={wp('5%')} y={hp('60%')} rx="8" ry="8" width={wp('80%')} height={hp('6%')} />
    <Rect x={wp('5%')} y={hp('70%')} rx="8" ry="8" width={wp('80%')} height={hp('6%')} />

     {/* Buttons Section */}
          <Rect x={wp('10%')} y={hp('80%')} rx="10" ry="10" width={wp('25%')} height={hp('10%')} />
          <Rect x={wp('55%')} y={hp('80%')} rx="10" ry="10" width={wp('25%')} height={hp('10%')} />
  </ContentLoader>
);

export default FarmerQrSkeletonLoader;
