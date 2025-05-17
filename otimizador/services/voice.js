import Voice from "react-native-voice";
import { Platform } from "react-native";

export const startVoiceRecognition = async () => {
  try {
    if (!Voice) {
      throw new Error(
        "Módulo de reconhecimento de voz não disponível. Verifique a instalação."
      );
    }

    // Tentar inicializar o módulo
    try {
      await Voice.isAvailable();
    } catch (initError) {
      throw new Error(
        "Falha ao inicializar o módulo de voz: " + initError.message
      );
    }

    // Limpar listeners anteriores
    Voice.onSpeechResults = null;
    Voice.onSpeechError = null;

    // Iniciar reconhecimento
    await Voice.start("pt-BR");
    return new Promise((resolve, reject) => {
      Voice.onSpeechResults = (e) => {
        const result = e.value && e.value[0] ? e.value[0] : "";
        resolve(result);
        Voice.stop();
      };
      Voice.onSpeechError = (e) => {
        reject(
          new Error("Erro ao reconhecer voz: " + (e.error || "Desconhecido"))
        );
        Voice.stop();
      };
    });
  } catch (error) {
    console.log("Erro ao iniciar voz:", error);
    throw new Error(
      "Não foi possível iniciar o reconhecimento de voz: " + error.message
    );
  }
};

export const stopVoiceRecognition = async () => {
  try {
    if (Voice) {
      await Voice.stop();
    }
  } catch (error) {
    console.log("Erro ao parar reconhecimento:", error);
  }
};
