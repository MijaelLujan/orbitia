// Arma el bloque de conferenceData que Calendar necesita para generar la sala de Meet
// automáticamente al crear un evento. Se suma al payload que recibe createEvent().
export function withMeetLink<T extends Record<string, unknown>>(eventPayload: T) {
  return {
    ...eventPayload,
    conferenceData: {
      createRequest: {
        requestId: crypto.randomUUID(),
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    },
  };
}
