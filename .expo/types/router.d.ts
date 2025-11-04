/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string | object = string> {
      hrefInputParams: { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/App`; params?: Router.UnknownInputParams; } | { pathname: `/../component/Certificate/Farmcertificate/CultivationEarnCertificate`; params?: Router.UnknownInputParams; } | { pathname: `/../component/Certificate/Farmcertificate/CultivationPaymentScreen`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; };
      hrefOutputParams: { pathname: Router.RelativePathString, params?: Router.UnknownOutputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownOutputParams } | { pathname: `/App`; params?: Router.UnknownOutputParams; } | { pathname: `/../component/Certificate/Farmcertificate/CultivationEarnCertificate`; params?: Router.UnknownOutputParams; } | { pathname: `/../component/Certificate/Farmcertificate/CultivationPaymentScreen`; params?: Router.UnknownOutputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownOutputParams; };
      href: Router.RelativePathString | Router.ExternalPathString | `/App${`?${string}` | `#${string}` | ''}` | `/../component/Certificate/Farmcertificate/CultivationEarnCertificate${`?${string}` | `#${string}` | ''}` | `/../component/Certificate/Farmcertificate/CultivationPaymentScreen${`?${string}` | `#${string}` | ''}` | `/_sitemap${`?${string}` | `#${string}` | ''}` | { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/App`; params?: Router.UnknownInputParams; } | { pathname: `/../component/Certificate/Farmcertificate/CultivationEarnCertificate`; params?: Router.UnknownInputParams; } | { pathname: `/../component/Certificate/Farmcertificate/CultivationPaymentScreen`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; };
    }
  }
}
