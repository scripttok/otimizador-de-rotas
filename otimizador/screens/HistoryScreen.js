import { View, Text, FlatList, StyleSheet } from "react-native";
import CustomButton from "../components/common/CustomButton";

const mockHistory = [
  {
    id: "1",
    date: "2025-05-10",
    start: "Rua A, 123",
    end: "Rua Z, 789",
    stops: 2,
  },
  {
    id: "2",
    date: "2025-05-09",
    start: "Rua B, 456",
    end: "Rua Y, 012",
    stops: 3,
  },
];

export default function HistoryScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <FlatList
        data={mockHistory}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.text}>Data: {item.date}</Text>
            <Text style={styles.text}>Início: {item.start}</Text>
            <Text style={styles.text}>Destino: {item.end}</Text>
            <Text style={styles.text}>Paradas: {item.stops}</Text>
            <View style={styles.buttonContainer}>
              <CustomButton
                title="Carregar"
                onPress={() => navigation.navigate("Route")}
                style={styles.button}
              />
              <CustomButton
                title="Excluir"
                onPress={() => alert("Excluir clicado")}
                style={[styles.button, styles.deleteButton]}
              />
            </View>
          </View>
        )}
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
  card: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 8,
    marginVertical: 5,
    elevation: 2,
  },
  text: {
    fontSize: 16,
    marginVertical: 2,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
  deleteButton: {
    backgroundColor: "#EF4444",
  },
});
