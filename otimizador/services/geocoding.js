let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000;

export const reverseGeocode = async (latitude, longitude) => {
  try {
    const now = Date.now();
    const timeSinceLast = now - lastRequestTime;
    if (timeSinceLast < MIN_REQUEST_INTERVAL) {
      await new Promise((resolve) =>
        setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLast)
      );
    }

    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=pt-BR`;
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
    console.log("Resposta Nominatim (reverse):", data);

    if (data.error) {
      throw new Error(`Erro da API: ${data.error}`);
    }

    const address = data.display_name || "Endereço desconhecido";
    lastRequestTime = Date.now();
    return address;
  } catch (error) {
    console.log("Erro completo (reverse):", error);
    return "Endereço temporário: Praça da Sé, São Paulo, SP, Brasil";
  }
};

export const geocodeAddress = async (address, userLocation) => {
  try {
    const now = Date.now();
    const timeSinceLast = now - lastRequestTime;
    if (timeSinceLast < MIN_REQUEST_INTERVAL) {
      await new Promise((resolve) =>
        setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLast)
      );
    }

    const encodedAddress = encodeURIComponent(address);
    const proximity = userLocation
      ? `&proximity=${userLocation.latitude},${userLocation.longitude}`
      : "";
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&addressdetails=1&limit=5&dedupe=1&countrycodes=br&viewbox=-47.2,-24.0,-46.0,-23.0&bounded=1${proximity}&accept-language=pt-BR`;
    console.log("Requisição Nominatim (geocode):", url);
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
    console.log("Resposta Nominatim (geocode):", data);

    if (!data || data.length === 0) {
      return null;
    }

    const filteredData = data.filter(
      (item) =>
        item.class === "highway" ||
        item.addresstype === "road" ||
        item.addresstype === "place" ||
        item.addresstype === "building"
    );
    console.log("Resultados filtrados (geocode):", filteredData);
    if (filteredData.length === 0) {
      return null;
    }

    const result = filteredData[0];
    const formattedAddress = formatAddress(result);
    console.log("Endereço formatado retornado:", formattedAddress);
    lastRequestTime = Date.now();
    return {
      address: formattedAddress,
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
    };
  } catch (error) {
    console.log("Erro completo (geocode):", error);
    return null;
  }
};

const formatAddress = (data) => {
  const address = data.address || {};
  const road = address.road || address.street || "Rua Desconhecida";
  const houseNumber = address.house_number || "S/N";
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
