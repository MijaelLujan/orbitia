"use client";

import { useConnectionStore } from "@/store/connection.store";

// Interfaz que usan los componentes para leer el estado de conexiones sin
// importar el store directamente.
export function useConnections() {
  const connected = useConnectionStore((state) => state.connected);
  const setConnected = useConnectionStore((state) => state.setConnected);
  return { connected, setConnected };
}
