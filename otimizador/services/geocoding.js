let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 segundo

export const reverseGeocode = async (latitude, longitude) => {
  try {
    // Garantir intervalo mínimo entre requisições
    const now = Date.now();
    const timeSinceLast = now - lastRequestTime;
    if (timeSinceLast < MIN_REQUEST_INTERVAL) {
      await new Promise((resolve) =>
        setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLast)
      );
    }

    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`;
    console.log("Requisição Nominatim:", url);
    const response = await fetch(url, {
      headers: {
        "User-Agent": "OtimizadorDeRotas/1.0 (contato@exemplo.com)",
      },
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error(
          "Muitas requisições. Tente novamente em alguns segundos."
        );
      }
      throw new Error(`Erro HTTP: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(`Erro da API: ${data.error}`);
    }

    const address = data.display_name || "Endereço desconhecido";
    lastRequestTime = Date.now();
    return address;
  } catch (error) {
    console.log("Erro completo:", error);
    // Fallback para coordenadas padrão (Praça da Sé, São Paulo)
    return "Endereço temporário: Praça da Sé, São Paulo, SP, Brasil";
  }
};
