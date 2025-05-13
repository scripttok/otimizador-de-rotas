import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function CustomInput({
  value,
  onChangeText,
  placeholder,
  onMicPress,
}) {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#6B7280"
      />
      <TouchableOpacity style={styles.icon} onPress={onMicPress}>
        <Ionicons name="mic" size={24} color="#1E3A8A" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    marginVertical: 10,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  icon: {
    padding: 12,
  },
});
