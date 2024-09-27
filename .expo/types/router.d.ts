/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/..\Items\SinhalaCropItem` | `/..\Items\SinhalaCropSelectCard` | `/..\Items\SinhalaNavigationBar` | `/..\Items\SinhalaNewsSlideShow` | `/..\Items\TamilCropItem` | `/..\Items\TamilCropSelectCard` | `/..\Items\TamilNavigationBar` | `/..\Items\TamilNewsSlideShow` | `/..\component\AddAsset` | `/..\component\AddFixedAsset` | `/..\component\AssertsFixedView` | `/..\component\CropCalander` | `/..\component\CurrentAssert` | `/..\component\Dashbord` | `/..\component\EngEditProfile` | `/..\component\EngProfile` | `/..\component\EngQRcode` | `/..\component\FiveDayForecastEng` | `/..\component\FiveDayForecastSinhala` | `/..\component\FiveDayForecastTamil` | `/..\component\Lanuage` | `/..\component\MyCrop` | `/..\component\NewCrop` | `/..\component\News` | `/..\component\Otpverification` | `/..\component\RemoveAsset` | `/..\component\SelectCrop` | `/..\component\Selectedcrop` | `/..\component\Signin` | `/..\component\SigninSelection` | `/..\component\SignupForum` | `/..\component\Splash` | `/..\component\SuccessScreen` | `/..\component\Verify` | `/..\component\WeatherForecastEng` | `/..\component\WeatherForecastSinhala` | `/..\component\WeatherForecastTamil` | `/..\component\fixedDashboard` | `/..\component\types` | `/_sitemap`;
      DynamicRoutes: never;
      DynamicRouteTemplate: never;
    }
  }
}
