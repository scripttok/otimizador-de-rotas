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
import { geocodeAddress } from "../../services/geocoding";

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
      console.log("Buscando sugestões para:", query, { userLocation });
      const suggestions = await geocodeAddress(query, userLocation);
      console.log("Sugestões recebidas:", suggestions);
      setSuggestions(suggestions);
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
      formattedAddress: suggestion.display_name,
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
