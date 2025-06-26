import axios from "axios";

const GOOGLE_API_KEY = "AIzaSyBTIAjgX1-V53kMe4q9rbpcP5Sw6gCe9sM"; // Substitua pela sua chave
const BASE_URL = "https://maps.googleapis.com/maps/api/geocode/json";

// Função para limitar requisições
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1500;

// Função para geocodificação reversa (coordenadas → endereço)
export const reverseGeocode = async (latitude, longitude) => {
  try {
    const now = Date.now();
    const timeSinceLast = now - lastRequestTime;
    if (timeSinceLast < MIN_REQUEST_INTERVAL) {
      await new Promise((resolve) =>
        setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLast)
      );
    }

    const url = `${BASE_URL}?latlng=${latitude},${longitude}&key=${GOOGLE_API_KEY}&language=pt-BR`;
    console.log("Requisição Google Maps (reverse):", url);
    const response = await axios.get(url);

    console.log("Resposta Google Maps (reverse):", response.data);

    if (response.data.status !== "OK") {
      throw new Error(
        `Erro da API: ${response.data.status} - ${
          response.data.error_message || "Sem mensagem"
        }`
      );
    }

    if (!response.data.results || response.data.results.length === 0) {
      throw new Error(
        "Nenhum endereço encontrado para as coordenadas fornecidas."
      );
    }

    const result = response.data.results[0];
    const address = formatGoogleAddress(result);
    lastRequestTime = Date.now();
    return address;
  } catch (error) {
    console.error("Erro ao realizar geocodificação reversa:", error.message);
    return "Endereço temporário: Praça da Sé, São Paulo, SP, Brasil";
  }
};

// Função para geocodificação direta (endereço → coordenadas)
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
    const bounds = "&components=country:BR";
    const locationBias = userLocation
      ? `&location=${userLocation.latitude},${userLocation.longitude}&radius=50000`
      : "";
    const url = `${BASE_URL}?address=${encodedAddress}${bounds}${locationBias}&key=${GOOGLE_API_KEY}&language=pt-BR`;
    console.log("Requisição Google Maps (geocode):", url);
    const response = await axios.get(url);

    console.log(
      "Resposta Google Maps (geocode):",
      JSON.stringify(response.data, null, 2)
    );

    if (response.data.status !== "OK") {
      throw new Error(
        `Erro da API: ${response.data.status} - ${
          response.data.error_message || "Sem mensagem"
        }`
      );
    }

    if (!response.data.results || response.data.results.length === 0) {
      return [];
    }

    const filteredData = response.data.results.filter((item) =>
      item.types.some((type) =>
        [
          "street_address",
          "route",
          "premise",
          "neighborhood",
          "sublocality",
          "point_of_interest",
          "locality",
          "political",
        ].includes(type)
      )
    );

    console.log(
      "Resultados filtrados (geocode):",
      JSON.stringify(filteredData, null, 2)
    );
    if (filteredData.length === 0) {
      return [];
    }

    const formattedSuggestions = filteredData.slice(0, 5).map((result) => {
      const formattedAddress = formatGoogleAddress(result);
      console.log("Endereço formatado para sugestão:", formattedAddress);
      return {
        place_id: result.place_id,
        display_name: formattedAddress,
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
      };
    });

    lastRequestTime = Date.now();
    return formattedSuggestions;
  } catch (error) {
    console.error("Erro ao realizar geocodificação:", error.message);
    return [];
  }
};

// Função para formatar endereço com base na resposta do Google Maps
const formatGoogleAddress = (result) => {
  let road = "";
  let houseNumber = "";
  let neighbourhood = "";
  let city = "";
  let state = "";
  let postcode = "";
  let name = "";

  console.log(
    "Componentes do endereço:",
    JSON.stringify(result.address_components, null, 2)
  );
  console.log("Tipos do resultado:", result.types);

  // Extrair componentes do endereço
  for (const component of result.address_components) {
    if (component.types.includes("route")) {
      road = component.long_name;
    } else if (component.types.includes("street_number")) {
      houseNumber = component.long_name;
    } else if (
      component.types.includes("sublocality") ||
      component.types.includes("neighborhood")
    ) {
      neighbourhood = component.long_name;
    } else if (
      component.types.includes("locality") ||
      component.types.includes("administrative_area_level_2")
    ) {
      if (!city || component.types.includes("locality")) {
        city = component.long_name;
      }
    } else if (component.types.includes("administrative_area_level_1")) {
      state = component.short_name;
    } else if (component.types.includes("postal_code")) {
      postcode = component.long_name.replace(/(\d{5})(\d{3})/, "$1-$2");
    } else if (
      component.types.includes("point_of_interest") ||
      component.types.includes("establishment")
    ) {
      name = component.long_name;
    }
  }

  // Lógica para formatar com base no tipo de resultado
  if (
    result.types.includes("point_of_interest") ||
    result.types.includes("establishment")
  ) {
    // Para pontos de interesse, usar nome e formatted_address
    const formatted = name || result.formatted_address.replace(", Brasil", "");
    console.log("Endereço formatado final (POI):", formatted);
    return formatted;
  } else if (
    result.types.includes("sublocality") ||
    result.types.includes("neighborhood") ||
    result.types.includes("locality") ||
    result.types.includes("political")
  ) {
    // Para bairros ou sublocalidades, usar formatted_address simplificado
    const formatted = result.formatted_address.replace(", Brasil", "");
    console.log("Endereço formatado final (sublocality):", formatted);
    return formatted;
  }

  // Formatação padrão para endereços completos
  road = road || name || "Rua Desconhecida";
  houseNumber = houseNumber || "S/N";
  neighbourhood = neighbourhood || "Bairro Desconhecido";
  city = city || "Cidade Desconhecida";
  state = state || "SP";
  postcode = postcode || "00000-000";

  const formattedAddress = `${road}, ${houseNumber}, ${neighbourhood}, ${city}, ${state}, ${postcode}`;
  console.log("Endereço formatado final (padrão):", formattedAddress);
  return formattedAddress;
};
