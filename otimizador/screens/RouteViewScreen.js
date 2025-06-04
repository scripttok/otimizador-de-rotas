import { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, Alert, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker, Polyline } from "react-native-maps";
import StopCard from "../components/route/StopCard";
import CustomButton from "../components/common/CustomButton";
import { useRoute } from "@react-navigation/native";
import { calculateRoute } from "../services/routeCalculation";

export default function RouteViewScreen() {
  const route = useRoute();
  const { start, stops: initialStops, end } = route.params || {};
  const [routeInfo, setRouteInfo] = useState({
    distance: null,
    duration: null,
    path: [],
  });
  const [stops, setStops] = useState(initialStops || []);

  useEffect(() => {
    console.log("RouteViewScreen renderizada");
    console.log("initialStops:", initialStops);
    console.log("routeInfo:", routeInfo);
    console.log("stops:", stops);
    if (start && end) {
      fetchRoute();
    }
  }, [start, initialStops, end]);

  const fetchRoute = async () => {
    try {
      const result = await calculateRoute(start, stops, end);
      setRouteInfo({
        distance: result.distance,
        duration: result.duration,
        path: result.path,
      });
      if (result.optimizedOrder && stops.length > 0) {
        const orderedIndices = result.optimizedOrder.slice(1, -1);
        const reorderedStops = orderedIndices.map((index) => stops[index - 1]);
        setStops(reorderedStops);
      }
    } catch (error) {
      console.log("Erro ao carregar rota:", error);
      Alert.alert("Erro", error.message);
    }
  };

  const onNavigateGoogle = (address) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
      address
    )}`;
    Linking.openURL(url).catch((err) => {
      console.log("Erro ao abrir Google Maps:", err);
      Alert.alert("Erro", "Não foi possível abrir o Google Maps.");
    });
  };

  const onNavigateWaze = (address) => {
    const url = `https://waze.com/ul?q=${encodeURIComponent(address)}`;
    Linking.openURL(url).catch((err) => {
      console.log("Erro ao abrir Waze:", err);
      Alert.alert("Erro", "Não foi possível abrir o Waze.");
    });
  };

  const onConfirmDelivery = (stopId) => {
    setStops((prevStops) =>
      prevStops
        .map((stop) =>
          stop.id === stopId ? { ...stop, delivered: true } : stop
        )
        .filter((stop) => !stop.delivered)
    );
  };

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
    ...stops.map((stop) => ({ ...stop, delivered: stop.delivered || false })),
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
        {routeInfo.path.length > 0 && (
          <Polyline
            coordinates={routeInfo.path}
            strokeColor="#1E3A8A"
            strokeWidth={4}
          />
        )}
      </MapView>
      <Text style={styles.info}>
        Tempo Estimado: {routeInfo.duration || "--"} min | Distância:{" "}
        {routeInfo.distance || "--"} km
      </Text>
      <FlatList
        data={stops}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <StopCard
            address={item.address}
            delivered={item.delivered || false}
            isCurrentStop={index === 0 && !item.delivered}
            onCheck={() => alert("Checkbox clicado")}
            onNavigateGoogle={() => onNavigateGoogle(item.address)}
            onNavigateWaze={() => onNavigateWaze(item.address)}
            onRemove={() => alert("Remover clicado")}
            onEdit={() => alert("Editar clicado")}
            onConfirmDelivery={() => onConfirmDelivery(item.id)}
          />
        )}
        style={styles.stopList}
      />
      <View style={styles.buttonContainer}>
        <CustomButton
          title="Reverter para Otimizada"
          onPress={() => fetchRoute()}
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
