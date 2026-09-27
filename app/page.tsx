import { redirect } from "next/navigation";

// La raíz no muestra nada propio: redirige a login. Ajustar si más adelante hay
// landing pública separada del login.
export default function RootPage() {
  redirect("/login");
}
