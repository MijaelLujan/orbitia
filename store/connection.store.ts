"use client";

import { create } from "zustand";

type ConnectionState = {
  connected: Record<"google" | "github" | "linkedin", boolean>;
  setConnected: (provider: "google" | "github" | "linkedin", value: boolean) => void;
};

// Guarda qué proveedores están conectados, para que componentes como el botón de
// "agendar reunión" sepan si mostrarse habilitados o pedir primero conectar Google.
export const useConnectionStore = create<ConnectionState>((set) => ({
  connected: { google: false, github: false, linkedin: false },
  setConnected: (provider, value) =>
    set((state) => ({ connected: { ...state.connected, [provider]: value } })),
}));
