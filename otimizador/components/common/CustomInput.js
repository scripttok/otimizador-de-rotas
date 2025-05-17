import { useState, useCallback } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  FlatList,
  Text,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import Modal from "react-native-modal";
import { debounce } from "lodash";

export default function CustomInput({
  value,
  onChangeText,
  placeholder,
  userLocation,
  onFocus,
}) {
  const [isModalVisible, setModalVisible] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [inputNumber, setInputNumber] = useState("");

  const parseAddress = (input) => {
    const match = input.match(/^(.*?)(,\s*\d+)?$/);
    if (match) {
      return {
        street: match[1].trim(),
        number: match[2] ? match[2].replace(/,\s*/, "") : null,
      };
    }
    return { street: input.trim(), number: null };
  };

  const formatAddress = (data, userNumber) => {
    const address = data.address || {};
    const road = address.road || address.street || "Rua Desconhecida";
    const houseNumber = userNumber || address.house_number || "S/N";
    const neighbourhood =
      address.neighbourhood ||
      address.suburb ||
      address.city_district ||
      "Bairro Desconhecido";
    const city =
      address.city || address.town || address.village || "Cidade Desconhecida";
    const state = address.state || "SP";
    const postcode = address.postcode || "00000-000";
    return `${road}, ${houseNumber}, ${neighbourhood}, ${city}, ${state}, ${postcode}`;
  };

  const fetchSuggestions = async (query) => {
    if (query.length < 3) {
      setSuggestions([]);
      setHasSearched(false);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setHasSearched(true);
      const { street, number } = parseAddress(query);
      setInputNumber(number || "");
      const encodedQuery = encodeURIComponent(query);
      const proximity = userLocation
        ? `&proximity=${userLocation.latitude},${userLocation.longitude}`
        : "";
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&addressdetails=1&limit=5&dedupe=1&countrycodes=br&viewbox=-47.2,-24.0,-46.0,-23.0${proximity}&accept-language=pt-BR`;
      console.log("Requisição Nominatim (suggestions):", url);
      console.log("userLocation:", userLocation);
      const response = await fetch(url, {
        headers: {
          "User-Agent": "OtimizadorDeRotas/1.0 (contato@exemplo.com)",
        },
      });
      const data = await response.json();
      console.log("Resposta Nominatim:", data);
      if (!data || data.length === 0) {
        setSuggestions([]);
        setIsLoading(false);
        return;
      }
      const filteredData = data.filter(
        (item) =>
          item.class === "highway" ||
          item.addresstype === "road" ||
          item.addresstype === "street" ||
          item.addresstype === "place" ||
          item.addresstype === "building" ||
          item.addresstype === "residential"
      );
      console.log("Sugestões filtradas:", filteredData);
      if (filteredData.length === 0) {
        setSuggestions([]);
        setIsLoading(false);
        return;
      }
      const formattedSuggestions = filteredData.map((item) => ({
        place_id: item.place_id,
        display_name: formatAddress(item, number),
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
      }));
      console.log("Sugestões formatadas:", formattedSuggestions);
      setSuggestions(formattedSuggestions);
      setModalVisible(true);
      setIsLoading(false);
    } catch (error) {
      console.log("Erro ao buscar sugestões:", error);
      setSuggestions([]);
      setIsLoading(false);
    }
  };

  const debouncedFetchSuggestions = useCallback(
    debounce((text) => fetchSuggestions(text), 1200),
    [userLocation]
  );

  const handleTextChange = (text) => {
    onChangeText(text);
    debouncedFetchSuggestions(text);
  };

  const handleSuggestionPress = (suggestion) => {
    onChangeText(suggestion.display_name, {
      latitude: suggestion.latitude,
      longitude: suggestion.longitude,
      formattedAddress: suggestion.display_name, // Passar endereço formatado
    });
    setModalVisible(false);
    setSuggestions([]);
    setHasSearched(false);
    setInputNumber("");
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={handleTextChange}
          placeholder={placeholder}
          onFocus={() => {
            onFocus();
            if (suggestions.length > 0 || hasSearched) {
              setModalVisible(true);
            }
          }}
        />
        {value.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => {
              onChangeText("");
              setSuggestions([]);
              setHasSearched(false);
              setModalVisible(false);
              setInputNumber("");
            }}
          >
            <Text style={styles.clearButtonText}>X</Text>
          </TouchableOpacity>
        )}
      </View>
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={() => {
          setModalVisible(false);
          setSuggestions([]);
          setHasSearched(false);
        }}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          {isLoading ? (
            <Text style={styles.noSuggestions}>Buscando...</Text>
          ) : hasSearched && suggestions.length === 0 ? (
            <Text style={styles.noSuggestions}>
              {inputNumber
                ? `Endereço com número ${inputNumber} não encontrado. Mostrando ruas próximas.`
                : "Nenhum endereço encontrado. Tente ser mais específico."}
            </Text>
          ) : (
            <FlatList
              data={suggestions}
              keyExtractor={(item) => item.place_id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleSuggestionPress(item)}>
                  <Text style={styles.suggestion}>
                    <Text style={{ fontWeight: "bold" }}>
                      {item.display_name.split(", ")[0]}
                    </Text>
                    {`, ${item.display_name.split(", ").slice(1).join(", ")}`}
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                hasSearched && !isLoading ? (
                  <Text style={styles.noSuggestions}>
                    {inputNumber
                      ? `Endereço com número ${inputNumber} não encontrado. Mostrando ruas próximas.`
                      : "Nenhum endereço encontrado. Tente ser mais específico."}
                  </Text>
                ) : null
              }
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const { height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    marginVertical: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  clearButton: {
    padding: 10,
  },
  clearButtonText: {
    fontSize: 16,
    color: "#6B7280",
  },
  modal: {
    justifyContent: "flex-start",
    marginTop: height * 0.15,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 20,
    maxHeight: height * 0.35,
  },
  suggestion: {
    padding: 10,
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  noSuggestions: {
    padding: 10,
    fontSize: 16,
    color: "#6B7280",
  },
});
