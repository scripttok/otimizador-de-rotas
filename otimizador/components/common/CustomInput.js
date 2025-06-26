import { useState, useCallback, useRef } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  FlatList,
  Text,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { debounce } from "lodash";
import Icon from "@expo/vector-icons/MaterialIcons";
import { startVoiceRecognition } from "../../services/voice";

export default function CustomInput({
  value,
  onChangeText,
  placeholder,
  userLocation,
  onFocus,
  enableVoice = false,
  isStopInput = false, // Nova prop para identificar campo de parada
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [inputNumber, setInputNumber] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState(null);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

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

  const handleTextChange = (text, coords) => {
    onChangeText(text, coords);
    debouncedFetchSuggestions(text);
  };

  const handleSuggestionPress = (suggestion) => {
    onChangeText(suggestion.display_name, {
      latitude: suggestion.latitude,
      longitude: suggestion.longitude,
      formattedAddress: suggestion.display_name,
    });
    setSuggestions([]);
    setHasSearched(false);
    setInputNumber("");
    setIsFocused(false);
    // Limpa o campo apenas se for o input de parada
    if (isStopInput) {
      onChangeText("");
    }
    inputRef.current.blur();
  };

  const handleVoiceInput = async () => {
    if (isListening) return;
    setIsListening(true);
    setVoiceError(null);

    try {
      const recognizedText = await startVoiceRecognition();
      if (recognizedText) {
        handleTextChange(recognizedText);
        setIsFocused(true);
        inputRef.current.focus();
      } else {
        setVoiceError("Nenhum texto reconhecido. Tente novamente.");
      }
    } catch (err) {
      setVoiceError("Erro ao usar reconhecimento de voz: " + err.message);
    } finally {
      setIsListening(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={value}
          onChangeText={handleTextChange}
          placeholder={placeholder}
          onFocus={() => {
            setIsFocused(true);
            onFocus();
          }}
          onBlur={() => {
            if (!value || suggestions.length === 0) {
              setIsFocused(false);
              setSuggestions([]);
              setHasSearched(false);
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
              setInputNumber("");
              setIsFocused(false);
            }}
          >
            <Text style={styles.clearButtonText}>X</Text>
          </TouchableOpacity>
        )}
        {enableVoice && (
          <TouchableOpacity onPress={handleVoiceInput} style={styles.micButton}>
            <Icon
              name={isListening ? "mic" : "mic-none"}
              size={24}
              color={isListening ? "#007AFF" : "#6B7280"}
            />
          </TouchableOpacity>
        )}
      </View>
      {voiceError && <Text style={styles.errorText}>{voiceError}</Text>}
      {isListening && <Text style={styles.listeningText}>Ouvindo...</Text>}
      {isFocused && (isLoading || hasSearched) && (
        <View style={styles.suggestionsContainer}>
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
              style={styles.suggestionsList}
              scrollEnabled={false}
            />
          )}
        </View>
      )}
    </View>
  );
}

const { height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
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
  micButton: {
    padding: 10,
  },
  suggestionsContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginTop: 4,
    maxHeight: 150,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  suggestionsList: {
    maxHeight: 150,
  },
  suggestion: {
    padding: 10,
    fontSize: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  noSuggestions: {
    padding: 10,
    fontSize: 14,
    color: "#6B7280",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
  listeningText: {
    color: "#007AFF",
    fontSize: 12,
    marginTop: 4,
  },
});
