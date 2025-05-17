import { View, Text, FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker } from "react-native-maps";
import StopCard from "../components/route/StopCard";
import CustomButton from "../components/common/CustomButton";
import { useRoute } from "@react-navigation/native";

export default function RouteViewScreen() {
  const route = useRoute();
  const { start, stops, end } = route.params || {};

  const initialRegion = start?.latitude
    ? {
        latitude: start.latitude,
        longitude: start.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }
    : {
        latitude: -23.5505, // Fallback: São Paulo
        longitude: -46.6333,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };

  const markers = [
    ...(start?.latitude
      ? [
          {
            id: "start",
            address: start.address,
            latitude: start.latitude,
            longitude: start.longitude,
            delivered: false,
          },
        ]
      : []),
    ...stops.map((stop) => ({ ...stop, delivered: false })),
    ...(end?.latitude
      ? [
          {
            id: "end",
            address: end.address,
            latitude: end.latitude,
            longitude: end.longitude,
            delivered: false,
          },
        ]
      : []),
  ];

  return (
    <SafeAreaView style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={true}
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={{
              latitude: marker.latitude,
              longitude: marker.longitude,
            }}
            title={marker.address}
            pinColor={marker.delivered ? "green" : "red"}
          />
        ))}
      </MapView>
      <Text style={styles.info}>Tempo Estimado: 45 min | Distância: 12 km</Text>
      <FlatList
        data={stops}
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
