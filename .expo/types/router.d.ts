/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/..\Items\NavigationBar` | `/..\component\CropCalanderSinhala` | `/..\component\CropCalanderTamil` | `/..\component\CurrentAssetTamilForm` | `/..\component\Dashbord` | `/..\component\EngProfile` | `/..\component\FiveDayForecastEng` | `/..\component\FiveDayForecastTamil` | `/..\component\NewsSinhala` | `/..\component\NewsTamil` | `/..\component\PublicForum` | `/..\component\PublicForumPost` | `/..\component\PublicForumReplies` | `/..\component\SignupForum` | `/..\component\SinhalaMyCrop` | `/..\component\TamilMyCrop` | `/..\component\TamilNewCrop` | `/..\component\TamilVerify` | `/..\component\WeatherForecastSinhala` | `/..\environment\environment` | `/_sitemap`;
      DynamicRoutes: never;
      DynamicRouteTemplate: never;
    }
  }
}
