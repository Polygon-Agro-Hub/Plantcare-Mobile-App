# GoviCare — Smart Agriculture & Farm Management Mobile Client

Welcome to the mobile application for **GoviCare** (PlantCare), a comprehensive cross-platform mobile application designed for farmers, farm owners, managers, supervisors, and agricultural laborers. This app empowers agricultural stakeholders with real-time farm tracking, crop calendar task monitoring, GAP certification management, farm machinery & asset inventories, farm member management, agricultural calculators, and community forums.

Developed and maintained by **Polygon Holdings Private Limited**.

---

## 🚀 Features

*   **Multi-Role Authentication & Access Control**:
    *   Dedicated workflows for **Farm Owners**, **Managers**, **Supervisors**, and **Laborers**.
    *   Secure token management with AsyncStorage and automatic session validation.
*   **Farm Management & Multi-Farm Switching**:
    *   Add and configure multiple farms with location tracking and area mapping.
    *   Assign and manage farm members (Managers, Supervisors, and Laborers).
*   **Crop Cultivation & Crop Calendar**:
    *   Enroll and manage crop cultivation cycles with stage-by-stage task tracking.
    *   Photo proof submission with integrated camera capture and timestamp verification.
    *   Real-time notifications for upcoming and pending crop tasks.
*   **Fixed Asset Management (Inventory)**:
    *   Complete lifecycle tracking for **Land**, **Buildings & Infrastructure**, **Machinery & Equipment**, and **Tools**.
    *   Warranty coverage tracking, permit/lease fee management, valuation estimations, and condition reporting.
*   **GAP Certification & Farm Audits**:
    *   Certificate application and task checklist verification.
    *   Photo proof validation for agricultural compliance.
*   **Agricultural Calculators & Financial Tools**:
    *   Crop planning calculators, fertilizer estimators, and yield predictors.
    *   **Govi Capital** & **Govi Pension** integration for farmer financial planning.
*   **Public Community Forum**:
    *   Ask questions, share agricultural insights, and interact with fellow farmers.
*   **Multi-language Support**:
    *   Full native localization for **English**, **Sinhala (සිංහල)**, and **Tamil (தமிழ்)**.

---

## 🛠️ Technology Stack

*   **Framework**: Expo SDK 54 / React Native (v0.81.5) with TypeScript
*   **State Management**: Redux Toolkit & React Context
*   **Navigation**: React Navigation (Bottom Tabs & Stack Navigator) with Expo Router
*   **Styling**: TailwindCSS via NativeWind (v4)
*   **Networking**: Axios with request/response interceptors
*   **Internationalization**: i18next & react-i18next (English, Sinhala, Tamil)
*   **Hardware & Native Integrations**:
    *   `expo-camera` (crop proof photo captures & camera previews)
    *   `expo-location` (farm geo-location tagging)
    *   `expo-image-manipulator` (aspect-ratio preserved image optimization)
    *   `expo-notifications` (push notifications & task reminders)
    *   `@react-native-community/datetimepicker` (localized date pickers)
    *   `expo-file-system` & `expo-media-library`

---

## 📁 Project Structure

```
Plantcare-Mobile-App/
├── .expo/                # Expo development build files
├── app/                  # App entry points & root navigation
│   └── App.tsx           # Root navigation & app initialization
├── assets/               # Images, icons, and static assets
├── component/            # UI Components & Feature Screens
│   ├── auth/             # Authentication, profile, & role management
│   ├── certificates/     # GAP & Star certificate applications
│   ├── common/           # Custom headers, modals, date pickers, camera
│   ├── crop-cultivation/ # Crop enrollment, crop calendar & task tracking
│   ├── farm-cal/         # Agricultural & crop planning calculators
│   ├── farms/            # Farm creation, member management, details
│   ├── fixed-assets/     # Add, edit, & view fixed assets (Land, Machinery, Tools)
│   ├── govi-capital/     # Govi Capital investment requests
│   ├── govi-pensions/    # Farmer pension schemes
│   └── public-forum/     # Farmer community discussion forum
├── context/              # React Context Providers
├── environment/          # API Base URL & environment configurations
├── i18n/                 # Localization (english.json, sinhala.json, tamil.json)
├── store/                # Redux store & state slices
├── app.json              # Expo application manifest
├── eas.json              # EAS build profiles (APK, AAB, iOS)
├── package.json          # Dependency manifest & scripts
└── tsconfig.json         # TypeScript compiler configuration
```

---

## ⚙️ Getting Started

### 1. Pre-requisites
Ensure you have the following installed on your developer machine:
*   [Node.js](https://nodejs.org/) (v18 or higher recommended)
*   [Expo Go](https://expo.dev/client) app installed on your physical device, or configured Android Emulator / iOS Simulator.
*   [EAS CLI](https://docs.expo.dev/eas-update/eas-cli/) (for cloud builds): `npm install -g eas-cli`

### 2. Installation
Clone the repository, navigate to the directory, and install dependencies:
```bash
npm install
```

### 3. API Base URL Configuration
Open [environment/environment.ts](environment/environment.ts) and configure the `API_BASE_URL` property to point to your running backend service:
```typescript
export const environment = {
  production: false,
  API_BASE_URL: "http://<YOUR_BACKEND_IP>:3000/"
};
```
*Note: If testing on a physical mobile device, use your machine's local IP address instead of `localhost`.*

### 4. Running the Development Server
Start the Metro bundler:
```bash
npm run start
```
Once the server starts:
*   Press **`a`** to open the app on an Android Emulator.
*   Press **`i`** to open the app on an iOS Simulator.
*   Scan the QR code in the terminal using the Expo Go app on a physical mobile device.

---

## 📦 Deployment & Building

---

### 1. EAS Cloud Build (Recommended)

Make sure you have EAS CLI installed and are logged into your Expo account:
```bash
npm install -g eas-cli
eas login
```

#### 📱 Build APK (Android Package for Testing / Direct Install)
Generates an `.apk` file for direct installation on physical Android test devices:
```bash
eas build --platform android --profile preview
```

#### 📦 Build AAB (Android App Bundle for Google Play Store)
Generates an `.aab` bundle ready for uploading to Google Play Console (includes ProGuard `mapping.txt` deobfuscation file):
```bash
eas build --platform android --profile production
```

#### 🍎 Build iOS (IPA for Apple App Store / TestFlight)
Generates an `.ipa` build for Apple TestFlight and App Store distribution:
```bash
eas build --platform ios --profile production
```

---

### 2. Local Gradle Build (On Your Machine)

#### 📱 Build APK Locally
```bash
npx expo prebuild --platform android
cd android
./gradlew assembleRelease
```
*Output path*: `android/app/build/outputs/apk/release/app-release.apk`

#### 📦 Build AAB Locally
```bash
npx expo prebuild --platform android
cd android
./gradlew bundleRelease
```
*Output path*: `android/app/build/outputs/bundle/release/app-release.aab`
*Mapping file (Deobfuscation)*: `android/app/build/outputs/mapping/release/mapping.txt`

---

## 🛡️ Deobfuscation File & Google Play Warning

If Google Play Console shows the warning:
> *There is no deobfuscation file associated with this App Bundle. If you use obfuscated code (R8/proguard), uploading a deobfuscation file will make crashes and ANRs easier to analyze and debug.*

1. **Automated Submission**: When deploying using `eas submit --platform android`, EAS automatically links and submits the `mapping.txt` file along with the AAB.
2. **Manual Upload**: If uploading the AAB manually to Google Play Console:
   - Go to **Google Play Console** > **App bundle explorer**.
   - Select the uploaded version.
   - Go to the **Downloads** tab > **Assets** / **Deobfuscation files**.
   - Upload the `mapping.txt` file generated during the build (available in the EAS Build dashboard artifacts or local `android/app/build/outputs/mapping/release/mapping.txt`).

---

## 📄 License

This project is licensed under the MIT License.

Copyright (c) 2026 **Polygon Holdings Private Limited**.
