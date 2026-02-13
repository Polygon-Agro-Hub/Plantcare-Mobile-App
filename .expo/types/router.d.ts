/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string | object = string> {
      hrefInputParams: { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/App`; params?: Router.UnknownInputParams; } | { pathname: `/../environment/environment`; params?: Router.UnknownInputParams; } | { pathname: `/../component/Bankdetails`; params?: Router.UnknownInputParams; } | { pathname: `/../component/GoviCapital/ProjectStatus`; params?: Router.UnknownInputParams; } | { pathname: `/../component/GoviCapital/RequestLetter`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; };
      hrefOutputParams: { pathname: Router.RelativePathString, params?: Router.UnknownOutputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownOutputParams } | { pathname: `/App`; params?: Router.UnknownOutputParams; } | { pathname: `/../environment/environment`; params?: Router.UnknownOutputParams; } | { pathname: `/../component/Bankdetails`; params?: Router.UnknownOutputParams; } | { pathname: `/../component/GoviCapital/ProjectStatus`; params?: Router.UnknownOutputParams; } | { pathname: `/../component/GoviCapital/RequestLetter`; params?: Router.UnknownOutputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownOutputParams; };
      href: Router.RelativePathString | Router.ExternalPathString | `/App${`?${string}` | `#${string}` | ''}` | `/../environment/environment${`?${string}` | `#${string}` | ''}` | `/../component/Bankdetails${`?${string}` | `#${string}` | ''}` | `/../component/GoviCapital/ProjectStatus${`?${string}` | `#${string}` | ''}` | `/../component/GoviCapital/RequestLetter${`?${string}` | `#${string}` | ''}` | `/_sitemap${`?${string}` | `#${string}` | ''}` | { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/App`; params?: Router.UnknownInputParams; } | { pathname: `/../environment/environment`; params?: Router.UnknownInputParams; } | { pathname: `/../component/Bankdetails`; params?: Router.UnknownInputParams; } | { pathname: `/../component/GoviCapital/ProjectStatus`; params?: Router.UnknownInputParams; } | { pathname: `/../component/GoviCapital/RequestLetter`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; };
    }
  }
}
