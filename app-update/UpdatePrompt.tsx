import React, { useEffect, useCallback } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  Dimensions,
  Keyboard,
  ScrollView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  TextInput,
} from "react-native";
import LottieView from "lottie-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import type { UpdateMessages } from "./updatePolicy";

const { width } = Dimensions.get("window");

const DEFAULT_TEXT: Required<UpdateMessages> = {
  softTitle: "New Version Available!",
  softMessage:
    "A new version of GoviCare is ready with improved features, faster performance, and bug fixes.",
  forceTitle: "Update Required",
  forceMessage:
    "Your current app version is out of date and no longer supported. Please update to continue using GoviCare.",
  updateButton: "Update Now",
  laterButton: "Update Later",
};

export interface UpdatePromptProps {
  visible: boolean;
  mode: "soft" | "force";
  installedVersion: string;
  latestVersion: string;
  messages?: UpdateMessages;
  onUpdate: () => void;
  onLater: () => void;
}

export function UpdatePrompt({
  visible,
  mode,
  installedVersion,
  latestVersion,
  messages,
  onUpdate,
  onLater,
}: UpdatePromptProps) {
  const text = { ...DEFAULT_TEXT, ...messages };
  const isForce = mode === "force";

  // White modal theme to match all other GoviCare modals
  const cardBg = "#FFFFFF";
  const primaryTextColor = "#181A20";
  const secondaryTextColor = "#64748B";
  const chipBg = "#F8FAFC";
  const chipBorder = "#E2E8F0";

  // Forcefully dismiss keyboard and blur any focused TextInput
  const dismissKeyboard = useCallback(() => {
    Keyboard.dismiss();
    try {
      const currentInput = TextInput.State.currentlyFocusedInput();
      if (currentInput) {
        TextInput.State.blurTextInput(currentInput);
      }
    } catch {
      // Safe fallback
    }
  }, []);

  // Dismiss keyboard immediately, upon intervals, and whenever keyboard tries to appear
  useEffect(() => {
    if (!visible) return;

    dismissKeyboard();

    const t1 = setTimeout(dismissKeyboard, 50);
    const t2 = setTimeout(dismissKeyboard, 150);
    const t3 = setTimeout(dismissKeyboard, 300);

    const sub1 = Keyboard.addListener("keyboardDidShow", dismissKeyboard);
    const sub2 = Keyboard.addListener("keyboardWillShow", dismissKeyboard);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      sub1.remove();
      sub2.remove();
    };
  }, [visible, dismissKeyboard]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onShow={dismissKeyboard}
      onRequestClose={isForce ? () => {} : onLater}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.keyboardAvoid}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              <View style={[styles.card, { backgroundColor: cardBg }]}>
                {/* Lottie Animation Header */}
                <View style={styles.lottieWrapper}>
                  <LottieView
                    source={require("@/assets/json/app-update/new-update.json")}
                    autoPlay
                    loop
                    style={styles.lottie}
                  />
                </View>

                {/* NEW RELEASE Tag / Badge */}
                <View style={styles.tagContainer}>
                  <Text style={styles.tagText}>NEW RELEASE</Text>
                </View>

                {/* Title & Description */}
                <View style={styles.textSection}>
                  <Text style={[styles.title, { color: primaryTextColor }]}>
                    {isForce ? text.forceTitle : text.softTitle}
                  </Text>

                  <Text
                    style={[styles.message, { color: secondaryTextColor }]}
                  >
                    {isForce ? text.forceMessage : text.softMessage}
                  </Text>
                </View>

                {/* Version Transition Chip */}
                <View
                  style={[
                    styles.versionRow,
                    { backgroundColor: chipBg, borderColor: chipBorder },
                  ]}
                >
                  <View style={styles.versionCol}>
                    <Text style={styles.versionLabel}>Current</Text>
                    <Text
                      style={[
                        styles.versionValue,
                        { color: secondaryTextColor },
                      ]}
                    >
                      v{installedVersion}
                    </Text>
                  </View>

                  <View style={styles.arrowContainer}>
                    <Ionicons name="arrow-forward" size={18} color="#0FC7B2" />
                  </View>

                  <View style={styles.versionCol}>
                    <Text style={styles.versionLabel}>Latest</Text>
                    <Text
                      style={[
                        styles.versionValueHighlight,
                        { color: "#0FC7B2" },
                      ]}
                    >
                      v{latestVersion}
                    </Text>
                  </View>
                </View>

                {/* Feature Highlights */}
                <View style={styles.featuresContainer}>
                  <View style={styles.featureItem}>
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color="#0FC7B2"
                    />
                    <Text
                      style={[
                        styles.featureText,
                        { color: secondaryTextColor },
                      ]}
                    >
                      Enhanced performance & crop monitoring
                    </Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color="#0FC7B2"
                    />
                    <Text
                      style={[
                        styles.featureText,
                        { color: secondaryTextColor },
                      ]}
                    >
                      Important bug fixes & system improvements
                    </Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionsContainer}>
                  {/* Primary Update Button */}
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                      Keyboard.dismiss();
                      onUpdate();
                    }}
                    style={({ pressed }) => [
                      styles.pressableWrapper,
                      { opacity: pressed ? 0.9 : 1 },
                    ]}
                  >
                    <LinearGradient
                      colors={["#0FA47F", "#0FC5B0"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.gradientButton}
                    >
                      <View style={styles.buttonContent}>
                        <FontAwesome5
                          name={
                            Platform.OS === "ios"
                              ? "app-store-ios"
                              : "google-play"
                          }
                          size={19}
                          color="#FFFFFF"
                        />
                        <Text style={styles.buttonText}>
                          {isForce ? "Update Now to Continue" : "Update Now"}
                        </Text>
                        <Ionicons
                          name="arrow-forward"
                          size={18}
                          color="#FFFFFF"
                        />
                      </View>
                    </LinearGradient>
                  </Pressable>

                  {/* Clickable Underlined Update Later Text */}
                  {!isForce && (
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => {
                        Keyboard.dismiss();
                        onLater();
                      }}
                      hitSlop={10}
                      style={({ pressed }) => [
                        styles.laterBtn,
                        { opacity: pressed ? 0.6 : 1 },
                      ]}
                      className="mt-4"
                    >
                      <Text style={styles.laterBtnText}>{text.laterButton}</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  keyboardAvoid: {
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  card: {
    width: "100%",
    maxWidth: Math.min(width - 32, 380),
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 26,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 14,
  },
  lottieWrapper: {
    width: 105,
    height: 105,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  lottie: {
    width: "100%",
    height: "100%",
  },
  tagContainer: {
    marginBottom: 8,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 8,
    overflow: "hidden",
    color: "#00BCA0",
    backgroundColor: "#E5FFFC",
  },
  textSection: {
    alignItems: "center",
    marginBottom: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.2,
    marginBottom: 6,
  },
  message: {
    fontSize: 13.5,
    lineHeight: 19,
    textAlign: "center",
    paddingHorizontal: 6,
  },
  versionRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  versionCol: {
    alignItems: "center",
  },
  versionLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  versionValue: {
    fontSize: 14,
    fontWeight: "700",
  },
  versionValueHighlight: {
    fontSize: 14,
    fontWeight: "800",
  },
  arrowContainer: {
    paddingHorizontal: 8,
  },
  featuresContainer: {
    width: "100%",
    gap: 8,
    marginBottom: 18,
    paddingHorizontal: 4,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  featureText: {
    fontSize: 12.5,
    fontWeight: "500",
  },
  actionsContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  pressableWrapper: {
    width: "100%",
    borderRadius: 9999,
    shadowColor: "#0FA47F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  gradientButton: {
    width: "100%",
    minHeight: 52,
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.2,
    textAlign: "center",
  },
  laterBtn: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  laterBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#494A65",
    textDecorationLine: "underline",
    textAlign: "center",
    letterSpacing: 0.2,
  },
});
