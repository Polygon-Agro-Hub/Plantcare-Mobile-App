/**
 * Public API for app-update
 *
 * Import from this barrel:
 *   import { AppUpdateProvider, useAppUpdate } from '@/app-update';
 */

export { AppUpdateProvider, useAppUpdate } from "./AppUpdateProvider";
export { APP_UPDATE_CONFIG } from "./config";
export { UpdatePrompt } from "./UpdatePrompt";
export type {
  UpdatePolicy,
  PlatformPolicy,
  UpdateMessages,
  UpdateDecision,
  StorePlatform,
} from "./updatePolicy";
