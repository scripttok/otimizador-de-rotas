import { useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import CustomInput from "../components/common/CustomInput";
import CustomButton from "../components/common/CustomButton";
import { MAX_STOPS } from "../utils/constants";
import { getCurrentLocation } from "../services/geolocation";
import { reverseGeocode, geocodeAddress } from "../services/geocoding";

export default function RouteScreen({ navigation }) {
  const [start, setStart] = useState({
    address: "",
    latitude: null,
    longitude: null,
  });
  const [stop, setStop] = useState("");
  const [stops, setStops] = useState([]);
  const [end, setEnd] = useState({
    address: "",
    latitude: null,
    longitude: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const scrollViewRef = useRef(null);

  const handleUseLocation = async () => {
    setIsLoading(true);
    try {
      const { latitude, longitude } = await getCurrentLocation();
      console.log("Coordenadas obtidas:", { latitude, longitude });
      const address = await reverseGeocode(latitude, longitude);
      setStart({ address, latitude, longitude });
      setUserLocation({ latitude, longitude });
      console.log("Estado start após atualização:", {
        address,
        latitude,
        longitude,
      });
    } catch (error) {
      console.log("Erro ao usar localização:", error);
      Alert.alert("Erro", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const addStop = async () => {
    if (stop.trim()) {
      if (stops.length >= MAX_STOPS) {
        Alert.alert(
          "Limite Atingido",
          `Você pode adicionar até ${MAX_STOPS} paradas.`
        );
        return;
      }
      try {
        const result = await geocodeAddress(stop, userLocation);
        if (!result) {
          Alert.alert(
            "Erro",
            "Endereço não encontrado. Tente outro endereço ou selecione uma sugestão."
          );
          return;
        }
        if (
          result.latitude < -33.0 ||
          result.latitude > 5.0 ||
          result.longitude < -74.0 ||
          result.longitude > -34.0
        ) {
          Alert.alert("Erro", "O endereço retornado está fora do Brasil.");
          return;
        }
        setStops([
          ...stops,
          { id: Date.now().toString(), ...result, delivered: false },
        ]);
        setStop("");
      } catch (error) {
        Alert.alert("Erro", error.message);
      }
    }
  };

  const removeStop = (id) => {
    setStops(stops.filter((item) => item.id !== id));
  };

  const handleStartChange = (address, coords) => {
    console.log("handleStartChange chamado com:", { address, coords });
    if (coords) {
      if (
        coords.latitude < -33.0 ||
        coords.latitude > 5.0 ||
        coords.longitude < -74.0 ||
        coords.longitude > -34.0
      ) {
        Alert.alert("Erro", "O endereço selecionado está fora do Brasil.");
        return;
      }
      setStart({ address, ...coords });
    } else {
      setStart({ address, latitude: null, longitude: null });
      if (address.length >= 3) {
        geocodeAddress(address, userLocation).then((result) => {
          if (result) {
            if (
              result.latitude < -33.0 ||
              result.latitude > 5.0 ||
              result.longitude < -74.0 ||
              result.longitude > -34.0
            ) {
              Alert.alert("Erro", "O endereço retornado está fora do Brasil.");
              return;
            }
            setStart(result);
          }
        });
      }
    }
  };

  const handleEndChange = (address, coords) => {
    console.log("handleEndChange chamado com:", { address, coords });
    if (coords) {
      if (
        coords.latitude < -33.0 ||
        coords.latitude > 5.0 ||
        coords.longitude < -74.0 ||
        coords.longitude > -34.0
      ) {
        Alert.alert("Erro", "O endereço selecionado está fora do Brasil.");
        return;
      }
      setEnd({ address, ...coords });
    } else {
      setEnd({ address, latitude: null, longitude: null });
      if (address.length >= 3) {
        geocodeAddress(address, userLocation).then((result) => {
          if (result) {
            if (
              result.latitude < -33.0 ||
              result.latitude > 5.0 ||
              result.longitude < -74.0 ||
              result.longitude > -34.0
            ) {
              Alert.alert("Erro", "O endereço retornado está fora do Brasil.");
              return;
            }
            setEnd(result);
          }
        });
      }
    }
  };

  const handleStopChange = (address) => {
    setStop(address);
  };

  const handleCalculateRoute = () => {
    if (!start.address || !end.address) {
      Alert.alert("Erro", "Por favor, preencha o início e o destino final.");
      return;
    }
    if (!start.latitude || !end.latitude) {
      Alert.alert(
        "Erro",
        "Endereços inválidos. Selecione endereços válidos nas sugestões."
      );
      return;
    }
    navigation.navigate("RouteView", { start, stops, end });
  };

  // Função para rolar até o campo ativo
  const handleInputFocus = (yPosition) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: yPosition, animated: true });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.label}>Início</Text>
          <CustomInput
            value={start.address}
            onChangeText={handleStartChange}
            placeholder="Digite o endereço inicial"
            userLocation={userLocation}
            onFocus={() => handleInputFocus(0)}
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
            onChangeText={handleStopChange}
            placeholder="Digite uma parada"
            userLocation={userLocation}
            onFocus={() => handleInputFocus(200)}
          />
          <CustomButton title="Adicionar Parada" onPress={addStop} />
          <FlatList
            data={stops}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.stopItem}>
                <Text
                  style={styles.stopText}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {item.address}
                </Text>
                <CustomButton
                  title="Remover"
                  onPress={() => removeStop(item.id)}
                  style={styles.removeButton}
                  textStyle={styles.removeButtonText}
                />
              </View>
            )}
            style={styles.stopList}
            scrollEnabled={false}
          />
          <Text style={styles.label}>Destino Final</Text>
          <CustomInput
            value={end.address}
            onChangeText={handleEndChange}
            placeholder="Digite o destino final"
            userLocation={userLocation}
            onFocus={() => handleInputFocus(400)}
          />
          <CustomButton
            title="Calcular Rota"
            onPress={handleCalculateRoute}
            disabled={!start.address || !end.address}
            style={styles.calculateButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 60, // Aumentado para mais espaço no final
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
  stopText: {
    flex: 1,
    fontSize: 14,
    color: "#1F2937",
    marginRight: 10,
  },
  stopList: {
    marginVertical: 10,
    maxHeight: 150,
  },
  locationButton: {
    backgroundColor: "#10B981",
  },
  removeButton: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 80,
  },
  removeButtonText: {
    fontSize: 12,
    color: "#FFFFFF",
  },
  calculateButton: {
    marginTop: 20,
    marginBottom: 20,
    paddingVertical: 14,
    backgroundColor: "#1E3A8A",
    borderRadius: 8,
  },
});
