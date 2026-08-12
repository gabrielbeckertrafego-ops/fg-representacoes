import { useEffect } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Segmentos from "./components/Segmentos";
import ComoFunciona from "./components/ComoFunciona";
import Numeros from "./components/Numeros";
import Estrutura from "./components/Estrutura";
import Equipe from "./components/Equipe";
import Parceiros from "./components/Parceiros";
import FAQ from "./components/FAQ";
import FormWhatsApp from "./components/FormWhatsApp";
import Footer from "./components/Footer";
import WhatsAppFloat from "./components/WhatsAppFloat";
import WhatsAppModal from "./components/WhatsAppModal";

// O site público. Fica separado do App para que Header (z-50), WhatsAppFloat (z-40)
// e o modal saiam da árvore quando a rota for /admin — senão eles ficam fixos por
// cima do painel.
export default function LandingPage() {
  useEffect(() => {
    document.documentElement.classList.add("js-ready");
  }, []);

  return (
    <>
      <Header />
      <main>
        <Hero />
        <Segmentos />
        <ComoFunciona />
        <Numeros />
        <Estrutura />
        <Equipe />
        <Parceiros />
        <FAQ />
        <FormWhatsApp />
      </main>
      <Footer />
      <WhatsAppFloat />
      <WhatsAppModal />
    </>
  );
}
