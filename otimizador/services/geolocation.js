import * as Location from "expo-location";

export const getCurrentLocation = async () => {
  try {
    // Verificar se os serviços de localização estão habilitados
    const isLocationAvailable = await Location.hasServicesEnabledAsync();
    if (!isLocationAvailable) {
      throw new Error(
        "Os serviços de localização estão desativados. Habilite o GPS no dispositivo."
      );
    }

    // Solicitar permissões
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      throw new Error(
        "Permissão de localização negada. Por favor, permita o acesso à localização."
      );
    }

    // Obter localização
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    throw new Error(error.message); // Passar a mensagem diretamente
  }
};
