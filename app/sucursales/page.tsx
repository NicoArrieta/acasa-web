"use client";

import React from "react";
import { MapPin } from "lucide-react";
import WhatsAppIcon from "@/components/WhatsAppIcon";

export default function SucursalesPage() {
  const whatsappUrl =
    "https://wa.me/5492616843330?text=Hola%20Acasa!%20estuve%20viendo%20la%20pagina%20web";

  return (
    <div className="w-full bg-white py-[5vh] sm:py-[10vh]">
      <div className="w-[90%] mx-auto space-y-[6vh] sm:space-y-[10vh]">
        {/* Page Title */}
        <div className="text-center sm:text-left mb-[2vh]">
          <h1 className="font-heading text-[6.5vw] sm:text-[3.8vw] lg:text-[2.5vw] font-bold uppercase tracking-wider text-black">
            Nuestros Showrooms
          </h1>
          <p className="text-[3.2vw] sm:text-[1.5vw] lg:text-[0.85vw] text-gray-500 mt-[0.5vh] uppercase tracking-widest">
            Vení a conocer la calidad de nuestros muebles en Mendoza
          </p>
        </div>

        {/* BLOQUE 1: SUCURSAL CIUDAD */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[4vh] lg:gap-[4vw] items-center pb-[5vh] border-b border-gray-100 last:border-b-0">
          {/* Mapa Ciudad */}
          <div className="w-full aspect-[16/11] rounded-[2.5vw] sm:rounded-[1.2vw] lg:rounded-[0.8vw] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-gray-200">
            <iframe
              loading="lazy"
              src="https://maps.google.com/maps?q=Av.%20Bartolome%20Mitre%201398%20Ciudad%20Mendoza.&t=m&z=15&output=embed&iwloc=near"
              title="Av. Bartolome Mitre 1398 Ciudad Mendoza"
              className="w-full h-full border-0"
            />
          </div>

          {/* Info Ciudad */}
          <div className="flex flex-col justify-center space-y-[2vh] sm:space-y-[2.5vh] pl-0 lg:pl-[2vw]">
            <div className="flex items-center space-x-[2vw] sm:space-x-[0.8vw]">
              <span className="text-[#FC7D00] flex-shrink-0">
                <MapPin className="w-[6vw] sm:w-[3vw] lg:w-[2vw] h-[6vw] sm:h-[3vw] lg:h-[2vw] min-w-[24px] min-h-[24px]" />
              </span>
              <h2 className="font-heading text-[5.5vw] sm:text-[3.2vw] lg:text-[2.2vw] font-normal tracking-wide text-black">
                Sucursal Ciudad
              </h2>
            </div>

            <p className="text-[3.4vw] sm:text-[1.8vw] lg:text-[1.1vw] text-gray-500 font-medium">
              Av. Bartolomé Mitre 1398, Ciudad de Mendoza
            </p>

            <p className="text-[3.4vw] sm:text-[1.8vw] lg:text-[1.1vw] text-gray-700 font-light leading-relaxed">
              Lunes a viernes de 10 a 19hs y sábados de 10 a 14hs
            </p>

            <div className="pt-[1vh]">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-[2vw] sm:space-x-[0.6vw] bg-[#25D366] hover:bg-[#20ba59] text-white px-[6vw] sm:px-[3vw] lg:px-[2vw] py-[1.8vh] sm:py-[1.4vh] rounded-[1.5vw] sm:rounded-[0.6vw] lg:rounded-[0.4vw] font-medium text-[3.6vw] sm:text-[1.5vw] lg:text-[0.9vw] transition-all shadow-sm hover:shadow-md"
              >
                <WhatsAppIcon className="w-[4.5vw] sm:w-[2vw] lg:w-[1.2vw] h-[4.5vw] sm:h-[2vw] lg:h-[1.2vw] min-w-[18px] min-h-[18px] text-white" />
                <span>Consultar por WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* BLOQUE 2: SUCURSAL LUJÁN */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[4vh] lg:gap-[4vw] items-center">
          {/* Info Luján */}
          <div className="order-2 lg:order-1 flex flex-col justify-center space-y-[2vh] sm:space-y-[2.5vh] pr-0 lg:pr-[2vw]">
            <div className="flex items-center space-x-[2vw] sm:space-x-[0.8vw]">
              <span className="text-[#FC7D00] flex-shrink-0">
                <MapPin className="w-[6vw] sm:w-[3vw] lg:w-[2vw] h-[6vw] sm:h-[3vw] lg:h-[2vw] min-w-[24px] min-h-[24px]" />
              </span>
              <h2 className="font-heading text-[5.5vw] sm:text-[3.2vw] lg:text-[2.2vw] font-normal tracking-wide text-black">
                Sucursal Luján
              </h2>
            </div>

            <p className="text-[3.4vw] sm:text-[1.8vw] lg:text-[1.1vw] text-gray-500 font-medium">
              Circuito Alma Gardenia, Luján de Cuyo
            </p>

            <p className="text-[3.4vw] sm:text-[1.8vw] lg:text-[1.1vw] text-gray-700 font-light leading-relaxed">
              Lunes a sábado de 10 a 21hs de corrido
            </p>

            <div className="pt-[1vh]">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-[2vw] sm:space-x-[0.6vw] bg-[#25D366] hover:bg-[#20ba59] text-white px-[6vw] sm:px-[3vw] lg:px-[2vw] py-[1.8vh] sm:py-[1.4vh] rounded-[1.5vw] sm:rounded-[0.6vw] lg:rounded-[0.4vw] font-medium text-[3.6vw] sm:text-[1.5vw] lg:text-[0.9vw] transition-all shadow-sm hover:shadow-md"
              >
                <WhatsAppIcon className="w-[4.5vw] sm:w-[2vw] lg:w-[1.2vw] h-[4.5vw] sm:h-[2vw] lg:h-[1.2vw] min-w-[18px] min-h-[18px] text-white" />
                <span>Consultar por WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Mapa Luján */}
          <div className="order-1 lg:order-2 w-full aspect-[16/11] rounded-[2.5vw] sm:rounded-[1.2vw] lg:rounded-[0.8vw] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-gray-200">
            <iframe
              loading="lazy"
              src="https://maps.google.com/maps?q=Circuito%20Alma%20Gardenia&t=m&z=15&output=embed&iwloc=near"
              title="Circuito Alma Gardenia"
              className="w-full h-full border-0"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
