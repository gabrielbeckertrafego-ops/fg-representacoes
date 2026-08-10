import { useEffect, useState } from "react";
import { abrirFormulario } from "../lib/modal";
import { WhatsAppIcon } from "./Icons";

export default function WhatsAppFloat() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 500);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      onClick={() => abrirFormulario()}
      aria-label="Falar no WhatsApp"
      className={`fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full text-sm font-semibold text-white shadow-[0_14px_40px_-8px_rgba(37,211,102,0.7)] transition-all duration-300 sm:h-auto sm:w-auto sm:gap-2.5 sm:px-5 sm:py-3.5 ${
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
      }`}
      style={{ backgroundImage: "linear-gradient(135deg, #25d366 0%, #128c7e 100%)" }}
    >
      <span className="pointer-events-none absolute inset-0 -z-10 animate-ping rounded-full bg-[#25d366]/40" />
      <WhatsAppIcon className="h-6 w-6 flex-none" />
      <span className="hidden sm:inline">Fale conosco</span>
    </button>
  );
}
