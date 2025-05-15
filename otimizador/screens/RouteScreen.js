import { useState } from "react";
import { View, Text, FlatList, StyleSheet, Alert } from "react-native";
import CustomInput from "../components/common/CustomInput";
import CustomButton from "../components/common/CustomButton";
import { MAX_STOPS } from "../utils/constants";
import { getCurrentLocation } from "../services/geolocation";
import { reverseGeocode } from "../services/geocoding";

export default function RouteScreen({ navigation }) {
  const [start, setStart] = useState("");
  const [stop, setStop] = useState("");
  const [stops, setStops] = useState([]);
  const [end, setEnd] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleUseLocation = async () => {
    setIsLoading(true);
    try {
      const { latitude, longitude } = await getCurrentLocation();
      console.log("Coordenadas obtidas:", { latitude, longitude }); // Depuração
      const address = await reverseGeocode(latitude, longitude);
      setStart(address);
    } catch (error) {
      console.log("Erro ao usar localização:", error); // Depuração
      Alert.alert("Erro", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const addStop = () => {
    if (stop.trim()) {
      if (stops.length >= MAX_STOPS) {
        Alert.alert(
          "Limite Atingido",
          `Você pode adicionar até ${MAX_STOPS} paradas.`
        );
        return;
      }
      setStops([...stops, { id: Date.now().toString(), address: stop }]);
      setStop("");
    }
  };

  const removeStop = (id) => {
    setStops(stops.filter((item) => item.id !== id));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Início</Text>
      <CustomInput
        value={start}
        onChangeText={setStart}
        placeholder="Digite o endereço inicial"
        onMicPress={() => alert("Microfone clicado")}
      />
      <CustomButton
        title={isLoading ? "Carregando..." : "Usar Minha Localização"}
        onPress={handleUseLocation}
        disabled={isLoading}
        style={styles.locationButton}
      />
      <Text style={styles.label}>
        Paradas ({stops.length}/{MAX_STOPS})
      </Text>
      <CustomInput
        value={stop}
        onChangeText={setStop}
        placeholder="Digite uma parada"
        onMicPress={() => alert("Microfone clicado")}
      />
      <CustomButton title="Adicionar Parada" onPress={addStop} />
      <FlatList
        data={stops}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.stopItem}>
            <Text>{item.address}</Text>
            <CustomButton
              title="Remover"
              onPress={() => removeStop(item.id)}
              style={styles.removeButton}
            />
          </View>
        )}
        style={styles.stopList}
      />
      <Text style={styles.label}>Destino Final</Text>
      <CustomInput
        value={end}
        onChangeText={setEnd}
        placeholder="Digite o destino final"
        onMicPress={() => alert("Microfone clicado")}
      />
      <CustomButton
        title="Calcular Rota"
        onPress={() => navigation.navigate("RouteView")}
        disabled={!start || !end}
        style={styles.calculateButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    padding: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E3A8A",
    marginVertical: 10,
  },
  stopItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
  },
  stopList: {
    maxHeight: 200,
  },
  locationButton: {
    backgroundColor: "#10B981",
  },
  removeButton: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  calculateButton: {
    marginTop: 20,
  },
});
