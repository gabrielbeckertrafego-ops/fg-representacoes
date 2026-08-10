import { useEffect } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Segmentos from "./components/Segmentos";
import ComoFunciona from "./components/ComoFunciona";
import Numeros from "./components/Numeros";
import Estrutura from "./components/Estrutura";
import Parceiros from "./components/Parceiros";
import FAQ from "./components/FAQ";
import FormWhatsApp from "./components/FormWhatsApp";
import Footer from "./components/Footer";
import WhatsAppFloat from "./components/WhatsAppFloat";
import WhatsAppModal from "./components/WhatsAppModal";

export default function App() {
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
