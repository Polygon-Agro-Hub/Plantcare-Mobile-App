/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/..\Skeleton\DashboardSkeleton` | `/..\Skeleton\FarmerQrSkeletonLoader` | `/..\Skeleton\MarcketPrice` | `/..\assets\jsons\branchData` | `/..\component\BankdetailsSignUp` | `/..\component\Skeleton\DashboardSkeleton` | `/..\component\Skeleton\FarmerQrSkeletonLoader` | `/_sitemap`;
      DynamicRoutes: never;
      DynamicRouteTemplate: never;
    }
  }
}
