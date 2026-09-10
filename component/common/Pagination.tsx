import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";
import { useTranslation } from "react-i18next";
import { FontAwesome6 } from "@expo/vector-icons";

type PageItem = number | "dots";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  containerStyle?: StyleProp<ViewStyle>;
  activePageStyle?: StyleProp<ViewStyle>;
  activeTextStyle?: StyleProp<TextStyle>;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  containerStyle,
  activePageStyle,
  activeTextStyle,
}) => {
  const { t } = useTranslation();

  const getPageNumbers = (): PageItem[] => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const keep = new Set<number>([1, totalPages]);

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) keep.add(i);

    const sorted = Array.from(keep).sort((a, b) => a - b);

    const pages: PageItem[] = [];
    let prev = 0;
    for (const p of sorted) {
      if (p - prev > 1) pages.push("dots");
      pages.push(p);
      prev = p;
    }

    return pages;
  };

  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  const pages = getPageNumbers();

  return (
    <View style={[styles.container, containerStyle]}>
      <TouchableOpacity
        onPress={handlePrev}
        disabled={currentPage === 1}
        style={styles.arrowButton}
        accessibilityRole="button"
        accessibilityLabel={t("pagination.previous", "Previous page")}
      >
        <Text
          style={[styles.arrowText, currentPage === 1 && styles.disabledText]}
        >
          <FontAwesome6
            name="arrow-left"
            size={18}
            color="black"
            style={{ marginTop: 2 }}
          />
        </Text>
      </TouchableOpacity>

      {pages.map((page, index) =>
        page === "dots" ? (
          <View key={`dots-${index}`} style={styles.dotsContainer}>
            <Text style={styles.dotsText}>•••</Text>
          </View>
        ) : (
          <TouchableOpacity
            key={page}
            onPress={() => onPageChange(page)}
            style={[
              styles.pageButton,
              page === currentPage && [
                styles.activePageButton,
                activePageStyle,
              ],
            ]}
            accessibilityRole="button"
            accessibilityLabel={t("pagination.page", "Page {{page}}", { page })}
          >
            <Text
              style={[
                styles.pageText,
                page === currentPage && [
                  styles.activePageText,
                  activeTextStyle,
                ],
              ]}
            >
              {page}
            </Text>
          </TouchableOpacity>
        ),
      )}

      <TouchableOpacity
        onPress={handleNext}
        disabled={currentPage === totalPages}
        style={styles.arrowButton}
        accessibilityRole="button"
        accessibilityLabel={t("pagination.next", "Next page")}
      >
        <Text
          style={[
            styles.arrowText,
            currentPage === totalPages && styles.disabledText,
          ]}
        >
          <FontAwesome6
            name="arrow-right"
            size={18}
            color="black"
            style={{ marginTop: 2 }}
          />
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  arrowButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  arrowText: {
    fontSize: 18,
    color: "#1A1A1A",
  },
  disabledText: {
    color: "#C4C4C4",
  },
  pageButton: {
    minWidth: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
  },
  activePageButton: {
    backgroundColor: "#1A1A1A",
  },
  pageText: {
    fontSize: 15,
    color: "#1A1A1A",
    fontWeight: "500",
  },
  activePageText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  dotsContainer: {
    minWidth: 24,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 2,
  },
  dotsText: {
    fontSize: 14,
    color: "#9A9A9A",
    letterSpacing: 1,
  },
});

export default Pagination;
