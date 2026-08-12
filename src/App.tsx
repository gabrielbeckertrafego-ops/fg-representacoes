import { lazy, Suspense } from "react";
import { useRota } from "./hooks/useRota";
import LandingPage from "./LandingPage";

// ÚNICA ponte permitida com src/admin. Nada mais fora de src/admin/ pode importar
// de lá — um import solto joga o CRM inteiro dentro do bundle da landing, que é
// destino de tráfego pago. Confira com:
//   grep -rn "admin/" src --include="*.tsx" --include="*.ts" | grep -v "^src/admin/" | grep -v "^src/App.tsx"
const PainelAdmin = lazy(() => import("./admin/AdminApp"));

export default function App() {
  const caminho = useRota();
  const ehAdmin = caminho === "/admin" || caminho.startsWith("/admin/");

  if (ehAdmin) {
    return (
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-ink">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-gold-500" />
          </div>
        }
      >
        <PainelAdmin />
      </Suspense>
    );
  }

  return <LandingPage />;
}
