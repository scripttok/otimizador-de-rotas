import { View, Text, StyleSheet } from "react-native";
import CustomButton from "../components/commom/CustomButton";

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Route Planner</Text>
      <CustomButton
        title="Criar Nova Rota"
        onPress={() => navigation.navigate("Route")}
        style={styles.button}
      />
      <CustomButton
        title="Ver Histórico"
        onPress={() => navigation.navigate("History")}
        style={styles.secondaryButton}
      />
      <Text style={styles.version}>v1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E3A8A",
    marginBottom: 20,
  },
  button: {
    width: "80%",
  },
  secondaryButton: {
    backgroundColor: "#6B7280",
    width: "80%",
  },
  version: {
    position: "absolute",
    bottom: 20,
    color: "#6B7280",
  },
});
