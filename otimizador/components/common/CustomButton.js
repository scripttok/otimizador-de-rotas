import { TouchableOpacity, Text, StyleSheet } from "react-native";

export default function CustomButton({ title, onPress, disabled, style }) {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#1E3A8A", // Azul escuro
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 10,
  },
  disabled: {
    backgroundColor: "#B0B0B0", // Cinza para desativado
  },
  text: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
