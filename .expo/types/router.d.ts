/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string | object = string> {
      hrefInputParams: { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/`; params?: Router.UnknownInputParams; } | { pathname: `/../component/Farm/PaymentGatewayView`; params?: Router.UnknownInputParams; } | { pathname: `/../store/packageSlice`; params?: Router.UnknownInputParams; } | { pathname: `/../services/reducxStore`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; };
      hrefOutputParams: { pathname: Router.RelativePathString, params?: Router.UnknownOutputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownOutputParams } | { pathname: `/`; params?: Router.UnknownOutputParams; } | { pathname: `/../component/Farm/PaymentGatewayView`; params?: Router.UnknownOutputParams; } | { pathname: `/../store/packageSlice`; params?: Router.UnknownOutputParams; } | { pathname: `/../services/reducxStore`; params?: Router.UnknownOutputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownOutputParams; };
      href: Router.RelativePathString | Router.ExternalPathString | `/${`?${string}` | `#${string}` | ''}` | `/../component/Farm/PaymentGatewayView${`?${string}` | `#${string}` | ''}` | `/../store/packageSlice${`?${string}` | `#${string}` | ''}` | `/../services/reducxStore${`?${string}` | `#${string}` | ''}` | `/_sitemap${`?${string}` | `#${string}` | ''}` | { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/`; params?: Router.UnknownInputParams; } | { pathname: `/../component/Farm/PaymentGatewayView`; params?: Router.UnknownInputParams; } | { pathname: `/../store/packageSlice`; params?: Router.UnknownInputParams; } | { pathname: `/../services/reducxStore`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; };
    }
  }
}
