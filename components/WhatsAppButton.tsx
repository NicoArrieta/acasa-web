"use client";

import React from "react";
import WhatsAppIcon from "./WhatsAppIcon";

export default function WhatsAppButton() {
  const phoneNumber = "5492616843330";
  const message = "Hola! Quisiera consultar sobre un producto de Acasa Tienda.";
  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      aria-label="Contactar por WhatsApp"
      className="fixed bottom-[2.5vh] right-[4vw] sm:right-[2vw] z-40 bg-[#25D366] text-white p-[3vw] sm:p-[0.8vw] min-p-[14px] rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center group"
    >
      <WhatsAppIcon className="w-[6.5vw] sm:w-[2.2vw] lg:w-[1.8vw] h-[6.5vw] sm:h-[2.2vw] lg:h-[1.8vw] min-w-[26px] min-h-[26px] text-white" />
      <span className="hidden sm:inline max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out px-0 group-hover:px-[0.6vw] text-[0.75vw] font-semibold">
        ¿Hablamos por WhatsApp?
      </span>
    </a>
  );
}
