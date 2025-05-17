import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function StopCard({
  address,
  delivered,
  onCheck,
  onNavigateGoogle,
  onNavigateWaze,
  onRemove,
  onEdit,
  onConfirmDelivery,
  isCurrentStop, // Indica se é a parada atual
}) {
  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={onCheck}>
        <Ionicons
          name={delivered ? "checkbox" : "square-outline"}
          size={24}
          color="#1E3A8A"
          style={styles.checkbox}
        />
      </TouchableOpacity>
      <Text style={[styles.text, delivered && styles.delivered]}>
        {address}
      </Text>
      <View style={styles.actions}>
        {isCurrentStop && !delivered && (
          <TouchableOpacity
            onPress={onConfirmDelivery}
            style={styles.confirmButton}
          >
            <Text style={styles.confirmText}>Confirmar Entrega</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
          <Ionicons name="pencil" size={20} color="#1E3A8A" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onRemove} style={styles.actionButton}>
          <Ionicons name="trash" size={20} color="#EF4444" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onNavigateGoogle}
          style={styles.actionButton}
        >
          <Ionicons name="map" size={20} color="#1E3A8A" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onNavigateWaze} style={styles.actionButton}>
          <Ionicons name="navigate" size={20} color="#1E3A8A" />
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
  checkbox: {
    marginRight: 10,
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
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    padding: 8,
  },
  confirmButton: {
    backgroundColor: "#10B981",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginRight: 8,
  },
  confirmText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
});
