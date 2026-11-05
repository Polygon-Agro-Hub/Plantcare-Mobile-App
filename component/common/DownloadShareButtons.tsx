import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

interface DownloadShareButtonsProps {
  onDownload: () => void | Promise<void>;
  onShare: () => void | Promise<void>;
  downloadLabel?: string;
  shareLabel?: string;
  disabled?: boolean;
}

const DownloadShareButtons: React.FC<DownloadShareButtonsProps> = ({
  onDownload,
  onShare,
  downloadLabel,
  shareLabel,
  disabled = false,
}) => {
  const { t } = useTranslation();

  return (
    <View
      className="flex-row w-full px-8 pb-8 gap-4 max-w-[500px] mx-auto"
      style={{
        flexDirection: "row",
        width: "100%",
        paddingHorizontal: 32,
        paddingBottom: 32,
        gap: 16,
        maxWidth: 500,
        alignSelf: "center",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <TouchableOpacity
        className="bg-black rounded-lg items-center justify-center flex-1 py-3 h-[70px]"
        onPress={onDownload}
        disabled={disabled}
        activeOpacity={0.8}
        style={{
          backgroundColor: "#000000",
          borderRadius: 10,
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
          height: 70,
          shadowColor: "#000000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 10,
          elevation: 6,
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <View style={{ alignItems: "center", justifyContent: "center", gap: 6 }}>
          <MaterialIcons name="download" size={24} color="white" />
          <Text style={{ color: "white", fontSize: 16, fontWeight: "500" }}>
            {downloadLabel || t("QRcode.Download", "Download")}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        className="bg-black rounded-lg items-center justify-center flex-1 py-4 h-[70px]"
        onPress={onShare}
        disabled={disabled}
        activeOpacity={0.8}
        style={{
          backgroundColor: "#000000",
          borderRadius: 10,
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
          height: 70,
          shadowColor: "#000000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 10,
          elevation: 6,
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <View style={{ alignItems: "center", justifyContent: "center", gap: 6 }}>
          <MaterialIcons name="share" size={24} color="white" />
          <Text style={{ color: "white", fontSize: 16, fontWeight: "500" }}>
            {shareLabel || t("QRcode.Share", "Share")}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default DownloadShareButtons;
