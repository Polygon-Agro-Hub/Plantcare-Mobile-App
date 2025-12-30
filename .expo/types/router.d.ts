/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string | object = string> {
      hrefInputParams: { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/App`; params?: Router.UnknownInputParams; } | { pathname: `/../component/GoviCapital/GoViCapitalRequests`; params?: Router.UnknownInputParams; } | { pathname: `/../component/GoviCapital/RequestReview`; params?: Router.UnknownInputParams; } | { pathname: `/../component/GoviCapital/ViewInvestmentRequestLetter`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; };
      hrefOutputParams: { pathname: Router.RelativePathString, params?: Router.UnknownOutputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownOutputParams } | { pathname: `/App`; params?: Router.UnknownOutputParams; } | { pathname: `/../component/GoviCapital/GoViCapitalRequests`; params?: Router.UnknownOutputParams; } | { pathname: `/../component/GoviCapital/RequestReview`; params?: Router.UnknownOutputParams; } | { pathname: `/../component/GoviCapital/ViewInvestmentRequestLetter`; params?: Router.UnknownOutputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownOutputParams; };
      href: Router.RelativePathString | Router.ExternalPathString | `/App${`?${string}` | `#${string}` | ''}` | `/../component/GoviCapital/GoViCapitalRequests${`?${string}` | `#${string}` | ''}` | `/../component/GoviCapital/RequestReview${`?${string}` | `#${string}` | ''}` | `/../component/GoviCapital/ViewInvestmentRequestLetter${`?${string}` | `#${string}` | ''}` | `/_sitemap${`?${string}` | `#${string}` | ''}` | { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/App`; params?: Router.UnknownInputParams; } | { pathname: `/../component/GoviCapital/GoViCapitalRequests`; params?: Router.UnknownInputParams; } | { pathname: `/../component/GoviCapital/RequestReview`; params?: Router.UnknownInputParams; } | { pathname: `/../component/GoviCapital/ViewInvestmentRequestLetter`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; };
    }
  }
}
