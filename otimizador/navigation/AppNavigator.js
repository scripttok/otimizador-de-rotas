import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "../screens/HomeScreen";
import RouteScreen from "../screens/RouteScreen";
import RouteViewScreen from "../screens/RouteViewScreen";
import HistoryScreen from "../screens/HistoryScreen";

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "Route Planner" }}
      />
      <Stack.Screen
        name="Route"
        component={RouteScreen}
        options={{ title: "Criar Rota" }}
      />
      <Stack.Screen
        name="RouteView"
        component={RouteViewScreen}
        options={{ title: "Sua Rota" }}
      />
      <Stack.Screen
        name="History"
        component={HistoryScreen}
        options={{ title: "Histórico" }}
      />
    </Stack.Navigator>
  );
}
