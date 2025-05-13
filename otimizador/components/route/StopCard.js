import {
  View,
  Text,
  CheckBox,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function StopCard({
  address,
  delivered,
  onCheck,
  onNavigateGoogle,
  onNavigateWaze,
}) {
  return (
    <View style={styles.card}>
      <CheckBox value={delivered} onValueChange={onCheck} />
      <Text style={[styles.text, delivered && styles.delivered]}>
        {address}
      </Text>
      <View style={styles.icons}>
        <TouchableOpacity onPress={onNavigateGoogle}>
          <Ionicons name="map" size={24} color="#1E3A8A" style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onNavigateWaze}>
          <Ionicons name="navigate" size={24} color="#1E3A8A" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 8,
    marginVertical: 5,
    elevation: 2,
  },
  text: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
  },
  delivered: {
    textDecorationLine: "line-through",
    color: "#6B7280",
  },
  icons: {
    flexDirection: "row",
  },
  icon: {
    marginHorizontal: 5,
  },
});
