# store/

Un archivo por recurso que necesite estado de cliente compartido entre componentes
(no todo lo necesita: un server component que solo lee no pasa por acá). Marcados con
`"use client"`, como `connection.store.ts`.

Pendientes según haga falta: `meeting.store.ts`, `event.store.ts`,
`availability.store.ts`, `notification.store.ts`.
