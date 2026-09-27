// Pantalla de login: los tres botones de proveedor, sin formulario de usuario/contraseña.
// No pedimos ni guardamos contraseñas de las cuentas externas del usuario.
export default function LoginPage() {
  const providers = [
    { id: "google", label: "Continuar con Google" },
    { id: "github", label: "Continuar con GitHub" },
    { id: "linkedin", label: "Continuar con LinkedIn" },
  ];

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-100">
      <div className="w-full max-w-sm space-y-6 p-8">
        <div>
          <h1 className="text-2xl font-semibold">Centraliza tu semana</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Conectá una cuenta para entrar. No pedimos ni guardamos contraseñas.
          </p>
        </div>

        <div className="space-y-3">
          {providers.map((provider) => (
            <a
              key={provider.id}
              href={`/api/auth/${provider.id}`}
              className="block w-full text-center rounded-md border border-neutral-700 py-2.5 hover:bg-neutral-900"
            >
              {provider.label}
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
