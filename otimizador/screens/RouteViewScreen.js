import { View, Text, FlatList, StyleSheet } from "react-native";
import StopCard from "../components/route/StopCard";
import CustomButton from "../components/common/CustomButton";

const mockStops = [
  { id: "1", address: "Rua A, 123", delivered: false },
  { id: "2", address: "Rua B, 456", delivered: true },
];

export default function RouteViewScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.mapPlaceholder}>
        <Text style={styles.placeholderText}>Mapa será exibido aqui</Text>
      </View>
      <Text style={styles.info}>Tempo Estimado: 45 min | Distância: 12 km</Text>
      <FlatList
        data={mockStops}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <StopCard
            address={item.address}
            delivered={item.delivered}
            onCheck={() => alert("Checkbox clicado")}
            onNavigateGoogle={() => alert("Navegar com Google Maps")}
            onNavigateWaze={() => alert("Navegar com Waze")}
          />
        )}
        style={styles.stopList}
      />
      <View style={styles.buttonContainer}>
        <CustomButton
          title="Reverter para Otimizada"
          onPress={() => alert("Reverter clicado")}
          style={styles.button}
        />
        <CustomButton
          title="Compartilhar Rota"
          onPress={() => alert("Compartilhar clicado")}
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    padding: 20,
  },
  mapPlaceholder: {
    height: "50%",
    backgroundColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginBottom: 10,
  },
  placeholderText: {
    color: "#6B7280",
    fontSize: 16,
  },
  info: {
    fontSize: 16,
    color: "#1E3A8A",
    marginVertical: 10,
  },
  stopList: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
});
