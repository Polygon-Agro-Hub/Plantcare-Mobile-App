import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  StyleSheet,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface CustomDatePickerProps {
  visible: boolean;
  onClose: () => void;
  value: Date | null;
  onConfirm: (date: Date) => void;
  minimumDate?: Date;
  maximumDate?: Date;
  title: string;
  cancelText?: string;
  confirmText?: string;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  visible,
  onClose,
  value,
  onConfirm,
  minimumDate,
  maximumDate,
  title,
  cancelText,
  confirmText,
}) => {
  const today = useMemo(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }, []);

  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date>(today);

  // Update calendar view when modal opens or value changes
  useEffect(() => {
    if (visible) {
      let activeDate = value ? new Date(value) : today;
      if (minimumDate) {
        const minMidnight = new Date(
          minimumDate.getFullYear(),
          minimumDate.getMonth(),
          minimumDate.getDate(),
        );
        const activeMidnight = new Date(
          activeDate.getFullYear(),
          activeDate.getMonth(),
          activeDate.getDate(),
        );
        if (activeMidnight < minMidnight) {
          activeDate = minMidnight;
        }
      }
      if (maximumDate) {
        const maxMidnight = new Date(
          maximumDate.getFullYear(),
          maximumDate.getMonth(),
          maximumDate.getDate(),
        );
        const activeMidnight = new Date(
          activeDate.getFullYear(),
          activeDate.getMonth(),
          activeDate.getDate(),
        );
        if (activeMidnight > maxMidnight) {
          activeDate = maxMidnight;
        }
      }
      setCurrentMonth(activeDate.getMonth());
      setCurrentYear(activeDate.getFullYear());
      setSelectedDate(activeDate);
    }
  }, [visible, value, today, minimumDate, maximumDate]);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const daysGrid = useMemo(() => {
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const startDayOfWeek = startOfMonth.getDay(); // 0-6
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();

    const grid = [];
    // Empty slots for alignment
    for (let i = 0; i < startDayOfWeek; i++) {
      grid.push(null);
    }
    // Days of the month
    for (let day = 1; day <= totalDays; day++) {
      grid.push(new Date(currentYear, currentMonth, day));
    }
    return grid;
  }, [currentMonth, currentYear]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const isDayDisabled = (date: Date | null): boolean => {
    if (!date) return true;
    
    // Normalize compared date to midnight local time
    const compareTime = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

    if (minimumDate) {
      const minTime = new Date(minimumDate.getFullYear(), minimumDate.getMonth(), minimumDate.getDate()).getTime();
      if (compareTime < minTime) return true;
    }

    if (maximumDate) {
      const maxTime = new Date(maximumDate.getFullYear(), maximumDate.getMonth(), maximumDate.getDate()).getTime();
      if (compareTime > maxTime) return true;
    }

    return false;
  };

  const handleConfirm = () => {
    if (isDayDisabled(selectedDate)) return;
    onConfirm(selectedDate);
    onClose();
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={styles.backdrop}
      >
        <TouchableWithoutFeedback>
          <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>

            {/* Month Header Navigation */}
            <View style={styles.header}>
              <TouchableOpacity onPress={handlePrevMonth} style={styles.navButton}>
                <MaterialIcons name="chevron-left" size={24} color="#000" />
              </TouchableOpacity>
              <Text style={styles.headerText}>
                {monthNames[currentMonth]} {currentYear}
              </Text>
              <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
                <MaterialIcons name="chevron-right" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            {/* Weekdays Row */}
            <View style={styles.weekdaysRow}>
              {daysOfWeek.map((day, idx) => (
                <Text key={idx} style={styles.weekdayText}>
                  {day}
                </Text>
              ))}
            </View>

            {/* Days Grid */}
            <View style={styles.daysGrid}>
              {daysGrid.map((day, idx) => {
                if (!day) {
                  return <View key={`empty-${idx}`} style={styles.dayCell} />;
                }

                const disabled = isDayDisabled(day);
                const selected = isSameDay(day, selectedDate);

                return (
                  <TouchableOpacity
                    key={`day-${day.getDate()}`}
                    disabled={disabled}
                    onPress={() => setSelectedDate(day)}
                    style={styles.dayCell}
                  >
                    {selected ? (
                      <View style={styles.selectedCircle}>
                        <Text style={[styles.dayText, styles.selectedDayText]}>
                          {day.getDate()}
                        </Text>
                      </View>
                    ) : (
                      <Text style={[styles.dayText, disabled && styles.disabledDayText]}>
                        {day.getDate()}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Footer Buttons */}
            <View style={styles.footer}>
              <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
                <Text style={styles.cancelText}>{cancelText || "Cancel"}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirm}
                disabled={isDayDisabled(selectedDate)}
                style={[
                  styles.confirmButton,
                  isDayDisabled(selectedDate) && { opacity: 0.4 },
                ]}
              >
                <Text style={styles.confirmText}>{confirmText || "OK"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  container: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    width: "100%",
    maxWidth: 340,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    color: "#000000",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  navButton: {
    padding: 8,
  },
  headerText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
  weekdaysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  weekdayText: {
    width: "14.28%",
    textAlign: "center",
    color: "#8E8E93",
    fontWeight: "500",
    fontSize: 12,
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  dayCell: {
    width: "14.28%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#2AAD7A",
    justifyContent: "center",
    alignItems: "center",
  },
  dayText: {
    fontSize: 14,
    color: "#000000",
    textAlign: "center",
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  selectedDayText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  disabledDayText: {
    color: "#D1D1D6",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cancelText: {
    color: "#007AFF",
    fontWeight: "600",
    fontSize: 14,
  },
  confirmButton: {
    backgroundColor: "#2AAD7A",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 9999,
  },
  confirmText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
  },
});

export default CustomDatePicker;
