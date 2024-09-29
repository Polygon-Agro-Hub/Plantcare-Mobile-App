/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/..\component\Dashbord` | `/..\component\PublicForum` | `/..\component\PublicForumPost` | `/..\component\PublicForumReplies` | `/..\component\RemoveAsset` | `/..\component\SelectCrop` | `/..\component\WeatherForecastEng` | `/..\component\types` | `/_sitemap`;
      DynamicRoutes: never;
      DynamicRouteTemplate: never;
    }
  }
}
