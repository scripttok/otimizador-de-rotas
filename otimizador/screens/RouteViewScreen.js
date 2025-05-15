import { View, Text, FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker } from "react-native-maps";
import StopCard from "../components/route/StopCard";
import CustomButton from "../components/common/CustomButton";

const mockStops = [
  {
    id: "1",
    address: "Rua A, 123",
    delivered: false,
    latitude: -23.5505,
    longitude: -46.6333,
  },
  {
    id: "2",
    address: "Rua B, 456",
    delivered: true,
    latitude: -23.5515,
    longitude: -46.6343,
  },
];

export default function RouteViewScreen() {
  const initialRegion = {
    latitude: -23.5505, // Centro de São Paulo
    longitude: -46.6333,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  return (
    <SafeAreaView style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={true}
      >
        {mockStops.map((stop) => (
          <Marker
            key={stop.id}
            coordinate={{ latitude: stop.latitude, longitude: stop.longitude }}
            title={stop.address}
            pinColor={stop.delivered ? "green" : "red"}
          />
        ))}
      </MapView>
      <Text style={styles.info}>Tempo Estimado: 45 min | Distância: 12 km</Text>
      <FlatList
        data={mockStops}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <StopCard
            address={item.address}
            delivered={item.delivered}
            isCurrentStop={index === 0 && !item.delivered}
            onCheck={() => alert("Checkbox clicado")}
            onNavigateGoogle={() => alert("Navegar com Google Maps")}
            onNavigateWaze={() => alert("Navegar com Waze")}
            onRemove={() => alert("Remover clicado")}
            onEdit={() => alert("Editar clicado")}
            onConfirmDelivery={() => alert("Confirmar Entrega clicado")}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 20,
  },
  map: {
    height: "50%",
    borderRadius: 8,
    marginBottom: 10,
  },
  info: {
    fontSize: 16,
    color: "#1E3A8A",
    marginVertical: 10,
  },
  stopList: {
    flex: 1,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
});
