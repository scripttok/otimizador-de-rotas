import { useState, useRef, useEffect } from "react";
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
  const [stopCoords, setStopCoords] = useState(null);
  const [stops, setStops] = useState([]);
  const [end, setEnd] = useState({
    address: "",
    latitude: null,
    longitude: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    console.log("RouteScreen renderizada");
    handleUseLocation();
  }, []);

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

  const addStop = async (stopData = null) => {
    let result = stopData;
    if (!result && stop.trim()) {
      if (stops.length >= MAX_STOPS) {
        Alert.alert(
          "Limite Atingido",
          `Você pode adicionar até ${MAX_STOPS} paradas.`
        );
        return;
      }
      try {
        if (stopCoords && stopCoords.formattedAddress) {
          console.log(
            "Usando endereço da sugestão (parada):",
            stopCoords.formattedAddress
          );
          result = {
            address: stopCoords.formattedAddress,
            latitude: stopCoords.latitude,
            longitude: stopCoords.longitude,
          };
        } else {
          console.log("Chamando geocodeAddress para parada:", stop);
          result = await geocodeAddress(stop, userLocation);
        }

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
        if (stops.some((s) => s.address === result.address)) {
          Alert.alert("Erro", "Esta parada já foi adicionada.");
          return;
        }
        console.log("Adicionando parada:", result);
        setStops([
          ...stops,
          { id: Date.now().toString(), ...result, delivered: false },
        ]);
        setStop("");
        setStopCoords(null);
      } catch (error) {
        console.log("Erro ao adicionar parada:", error);
        Alert.alert("Erro", error.message);
      }
    } else if (result) {
      if (stops.length >= MAX_STOPS) {
        Alert.alert(
          "Limite Atingido",
          `Você pode adicionar até ${MAX_STOPS} paradas.`
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
      if (stops.some((s) => s.address === result.address)) {
        Alert.alert("Erro", "Esta parada já foi adicionada.");
        return;
      }
      console.log("Adicionando parada:", result);
      setStops([
        ...stops,
        { id: Date.now().toString(), ...result, delivered: false },
      ]);
      setStop("");
      setStopCoords(null);
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
      setStart({ address: coords.formattedAddress || address, ...coords });
    } else {
      setStart({ address, latitude: null, longitude: null });
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
      setEnd({ address: coords.formattedAddress || address, ...coords });
    } else {
      setEnd({ address, latitude: null, longitude: null });
    }
  };

  const handleStopChange = (address, coords) => {
    console.log("handleStopChange chamado com:", { address, coords });
    setStop(address);
    setStopCoords(coords);
    if (coords && coords.formattedAddress) {
      addStop({
        address: coords.formattedAddress,
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
    }
  };

  const handleCalculateRoute = () => {
    console.log("handleCalculateRoute chamado");
    console.log("Estado atual:", { start, stops, end });

    if (!start.address || !end.address) {
      console.log("Validação falhou: início ou destino final não preenchidos");
      Alert.alert("Erro", "Por favor, preencha o início e o destino final.");
      return;
    }
    if (!start.latitude || !end.latitude) {
      console.log(
        "Validação falhou: coordenadas inválidas para início ou destino"
      );
      Alert.alert(
        "Erro",
        "Endereços inválidos. Selecione endereços válidos nas sugestões."
      );
      return;
    }
    if (
      stops.length > 0 &&
      stops.some((stop) => !stop.latitude || !stop.longitude)
    ) {
      console.log("Validação falhou: alguma parada sem coordenadas válidas");
      Alert.alert(
        "Erro",
        "Uma ou mais paradas possuem coordenadas inválidas. Selecione endereços válidos."
      );
      return;
    }

    console.log("Navegando para RouteView com:", { start, stops, end });
    try {
      navigation.navigate("RouteView", { start, stops, end });
    } catch (error) {
      console.log("Erro na navegação:", error);
      Alert.alert("Erro", "Falha ao navegar para a tela de rota.");
    }
  };

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
            enableVoice={true}
            isStopInput={false}
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
            enableVoice={true}
            isStopInput={true}
          />
          <CustomButton title="Adicionar Parada" onPress={() => addStop()} />
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
            enableVoice={true}
            isStopInput={false}
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
    paddingBottom: 60,
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
