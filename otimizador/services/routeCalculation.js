import axios from "axios";
import polyline from "@mapbox/polyline";

const API_KEY = "5b3ce3597851110001cf62484fdfa13a2e614c7bb57d2da3dd3a06e0";
const BASE_URL = "https://api.openrouteservice.org/v2/directions/driving-car";

// Função para calcular distância euclidiana (em km)
const calculateDistance = (point1, point2) => {
  const toRad = (deg) => deg * (Math.PI / 180);
  const R = 6371; // Raio da Terra em km
  const dLat = toRad(point2.latitude - point1.latitude);
  const dLon = toRad(point2.longitude - point1.longitude);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.latitude)) *
      Math.cos(toRad(point2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Função para ordenar paradas por proximidade
export const sortStopsByProximity = (start, stops, end) => {
  if (!stops || stops.length === 0) return stops;

  // Copiar paradas para evitar mutação
  let remainingStops = [...stops];
  const orderedStops = [];
  let currentPoint = start;

  // Ordenar até não restarem paradas
  while (remainingStops.length > 0) {
    // Encontrar a parada mais próxima do ponto atual
    const nearestIndex = remainingStops.reduce((minIndex, stop, index, arr) => {
      const dist = calculateDistance(currentPoint, stop);
      const minDist = calculateDistance(currentPoint, arr[minIndex]);
      return dist < minDist ? index : minIndex;
    }, 0);

    // Adicionar a parada mais próxima à lista ordenada
    orderedStops.push(remainingStops[nearestIndex]);
    currentPoint = remainingStops[nearestIndex];
    remainingStops.splice(nearestIndex, 1);
  }

  // Garantir que a última parada seja a mais próxima do destino
  if (orderedStops.length > 1) {
    const lastStop = orderedStops[orderedStops.length - 1];
    const secondLastStop = orderedStops[orderedStops.length - 2];
    if (
      calculateDistance(lastStop, end) > calculateDistance(secondLastStop, end)
    ) {
      // Trocar as duas últimas paradas se necessário
      orderedStops[orderedStops.length - 1] = secondLastStop;
      orderedStops[orderedStops.length - 2] = lastStop;
    }
  }

  return orderedStops;
};

export const calculateRoute = async (start, stops, end) => {
  try {
    if (
      !start.latitude ||
      !start.longitude ||
      !end.latitude ||
      !end.longitude
    ) {
      throw new Error("Coordenadas de início ou fim inválidas.");
    }
    if (stops.some((item) => !item.latitude || !item.longitude)) {
      throw new Error("Coordenadas de alguma parada inválidas.");
    }

    const coordinates = [
      [start.longitude, start.latitude],
      ...stops.map((stop) => [stop.longitude, stop.latitude]),
      [end.longitude, end.latitude],
    ];

    console.log("Coordenadas enviadas para OpenRouteService:", coordinates);

    const response = await axios.post(
      `${BASE_URL}`,
      {
        coordinates,
        instructions: false,
        geometry: true,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    );

    console.log("Resposta OpenRouteService:", response.data);

    if (!response.data.routes || response.data.routes.length === 0) {
      throw new Error("Nenhuma rota encontrada.");
    }

    const route = response.data.routes[0];
    const distance = route.summary.distance / 1000; // km
    const duration = route.summary.duration / 60; // minutos
    const geometry = route.geometry;

    const decodedPath = polyline.decode(geometry).map(([lat, lng]) => ({
      latitude: lat,
      longitude: lng,
    }));

    return {
      distance: distance.toFixed(1),
      duration: duration.toFixed(0),
      path: decodedPath,
    };
  } catch (error) {
    console.error("Erro ao calcular rota:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw new Error("Falha ao calcular a rota.");
  }
};
