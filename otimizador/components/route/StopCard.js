import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

const StopCard = ({
  address,
  delivered,
  isCurrentStop,
  onCheck,
  onNavigateGoogle,
  onNavigateWaze,
  onRemove,
  onEdit,
  onConfirmDelivery,
}) => {
  return (
    <View
      style={[
        styles.container,
        isCurrentStop ? styles.currentStop : null,
        delivered ? styles.delivered : null,
      ]}
    >
      <View style={styles.infoContainer}>
        <Text style={styles.address} numberOfLines={2} ellipsizeMode="tail">
          {address}
        </Text>
        <Text style={styles.status}>{delivered ? "Entregue" : "Pendente"}</Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={onNavigateGoogle} style={styles.iconButton}>
          <Icon name="navigation" size={24} color="#1E3A8A" />
          <Text style={styles.iconText}>Google Maps</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onNavigateWaze} style={styles.iconButton}>
          <Icon name="navigation" size={24} color="#1E3A8A" />
          <Text style={styles.iconText}>Waze</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onConfirmDelivery} style={styles.iconButton}>
          <Icon
            name="check-circle"
            size={24}
            color={delivered ? "#10B981" : "#1E3A8A"}
          />
          <Text style={styles.iconText}>Confirmar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onEdit} style={styles.iconButton}>
          <Icon name="edit" size={24} color="#1E3A8A" />
          <Text style={styles.iconText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onRemove} style={styles.iconButton}>
          <Icon name="delete" size={24} color="#EF4444" />
          <Text style={styles.iconText}>Remover</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 8,
    marginVertical: 5,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  currentStop: {
    borderLeftWidth: 4,
    borderLeftColor: "#1E3A8A",
  },
  delivered: {
    backgroundColor: "#E6F3EA",
  },
  infoContainer: {
    marginBottom: 10,
  },
  address: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
  },
  status: {
    fontSize: 14,
    color: "#6B7280",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  iconButton: {
    alignItems: "center",
    padding: 5,
    minWidth: 70,
  },
  iconText: {
    fontSize: 12,
    color: "#1E3A8A",
    marginTop: 2,
  },
});

export default StopCard;
