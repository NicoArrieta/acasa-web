import React from "react";
import Link from "next/link";
import { MapPin, Phone, Mail, Instagram, CreditCard, Truck, ShieldCheck } from "lucide-react";
import WhatsAppIcon from "./WhatsAppIcon";

export default function Footer() {
  return (
    <footer id="sucursales" className="bg-[#141414] text-gray-300 pt-[6vh] pb-[5vh] border-t border-gray-800 w-full">
      <div className="w-[90%] mx-auto">
        {/* Value props */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[3vh] md:gap-[3vw] pb-[4vh] border-b border-gray-800 text-center md:text-left">
          <div className="flex items-center space-x-[3vw] md:space-x-[1vw] justify-center md:justify-start">
            <div className="w-[12vw] sm:w-[5vw] lg:w-[3vw] h-[12vw] sm:h-[5vw] lg:h-[3vw] min-w-[36px] min-h-[36px] rounded-full bg-white/10 flex items-center justify-center text-white flex-shrink-0">
              <Truck className="w-[5vw] sm:w-[2.2vw] lg:w-[1.4vw] min-w-[18px] min-h-[18px]" />
            </div>
            <div className="text-left">
              <h4 className="font-heading font-bold text-white text-[3.4vw] sm:text-[1.5vw] lg:text-[0.9vw] tracking-wider">
                ENVÍOS A TODO EL PAÍS
              </h4>
              <p className="text-[2.8vw] sm:text-[1.2vw] lg:text-[0.75vw] text-gray-400 mt-[0.2vh]">
                Envíos directos puerta a puerta y a sucursales en todo el país.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-[3vw] md:space-x-[1vw] justify-center md:justify-start">
            <div className="w-[12vw] sm:w-[5vw] lg:w-[3vw] h-[12vw] sm:h-[5vw] lg:h-[3vw] min-w-[36px] min-h-[36px] rounded-full bg-white/10 flex items-center justify-center text-white flex-shrink-0">
              <CreditCard className="w-[5vw] sm:w-[2.2vw] lg:w-[1.4vw] min-w-[18px] min-h-[18px]" />
            </div>
            <div className="text-left">
              <h4 className="font-heading font-bold text-white text-[3.4vw] sm:text-[1.5vw] lg:text-[0.9vw] tracking-wider">
                FACILIDADES DE PAGO
              </h4>
              <p className="text-[2.8vw] sm:text-[1.2vw] lg:text-[0.75vw] text-gray-400 mt-[0.2vh]">
                Hasta 6 cuotas sin interés y todas las facilidades con tarjetas.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-[3vw] md:space-x-[1vw] justify-center md:justify-start">
            <div className="w-[12vw] sm:w-[5vw] lg:w-[3vw] h-[12vw] sm:h-[5vw] lg:h-[3vw] min-w-[36px] min-h-[36px] rounded-full bg-white/10 flex items-center justify-center text-white flex-shrink-0">
              <ShieldCheck className="w-[5vw] sm:w-[2.2vw] lg:w-[1.4vw] min-w-[18px] min-h-[18px]" />
            </div>
            <div className="text-left">
              <h4 className="font-heading font-bold text-white text-[3.4vw] sm:text-[1.5vw] lg:text-[0.9vw] tracking-wider">
                CALIDAD GARANTIZADA
              </h4>
              <p className="text-[2.8vw] sm:text-[1.2vw] lg:text-[0.75vw] text-gray-400 mt-[0.2vh]">
                Maderas nobles, tapizados seleccionados y diseño duradero.
              </p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-[4vh] md:gap-[3vw] py-[4vh]">
          {/* Col 1: About */}
          <div className="space-y-[1.5vh]">
            <h3 className="font-heading font-bold text-white text-[4.5vw] sm:text-[2vw] lg:text-[1.2vw] tracking-widest">
              ACASA TIENDA
            </h3>
            <p className="text-[3vw] sm:text-[1.3vw] lg:text-[0.75vw] text-gray-400 leading-relaxed">
              Diseño que acompaña tu forma de vivir. Fabricación y curaduría de muebles de calidad superior para cada ambiente de tu hogar.
            </p>
            <div className="flex space-x-[2.5vw] sm:space-x-[1vw] lg:space-x-[0.8vw] pt-[1vh]">
              <a
                href="https://www.instagram.com/acasatienda/?hl=es-la"
                target="_blank"
                rel="noreferrer"
                className="w-[9vw] sm:w-[4vw] lg:w-[2.2vw] h-[9vw] sm:h-[4vw] lg:h-[2.2vw] min-w-[32px] min-h-[32px] rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all"
                aria-label="Instagram"
              >
                <Instagram className="w-[4.5vw] sm:w-[2vw] lg:w-[1.1vw] min-w-[16px] min-h-[16px]" />
              </a>
              <a
                href="https://wa.me/5492616843330"
                target="_blank"
                rel="noreferrer"
                className="w-[9vw] sm:w-[4vw] lg:w-[2.2vw] h-[9vw] sm:h-[4vw] lg:h-[2.2vw] min-w-[32px] min-h-[32px] rounded-full bg-white/10 flex items-center justify-center hover:bg-[#25D366] hover:text-white transition-all text-white"
                aria-label="WhatsApp"
              >
                <WhatsAppIcon className="w-[4.5vw] sm:w-[2vw] lg:w-[1.1vw] min-w-[16px] min-h-[16px]" />
              </a>
            </div>
          </div>

          {/* Col 2: Sucursales */}
          <div className="space-y-[1.5vh]">
            <Link
              href="/sucursales"
              className="font-heading font-semibold text-white text-[3.6vw] sm:text-[1.6vw] lg:text-[0.9vw] tracking-wider uppercase hover:text-[#f39200] transition-colors block"
            >
              Sucursales
            </Link>
            <div className="space-y-[1.2vh] text-[3vw] sm:text-[1.3vw] lg:text-[0.75vw]">
              <div>
                <p className="font-medium text-white flex items-center">
                  <MapPin className="w-[3.5vw] sm:w-[1.5vw] lg:w-[0.9vw] mr-[1vw] sm:mr-[0.3vw] text-[#f6ad55]" />
                  <span>Sucursal Ciudad · Compra fácil y estándar</span>
                </p>
                <p className="text-gray-400 pl-[4.5vw] sm:pl-[1.8vw] lg:pl-[1.2vw]">
                  Av. Bartolomé Mitre 1398, Ciudad de Mendoza
                </p>
                <p className="text-gray-500 pl-[4.5vw] sm:pl-[1.8vw] lg:pl-[1.2vw] text-[2.6vw] sm:text-[1.1vw] lg:text-[0.68vw]">
                  Lunes a Viernes: 9:00 a 13:00 / 16:30 a 20:30 · Sáb: 9:30 a 13:30
                </p>
              </div>
              <div className="pt-[0.5vh]">
                <p className="font-medium text-white flex items-center">
                  <MapPin className="w-[3.5vw] sm:w-[1.5vw] lg:w-[0.9vw] mr-[1vw] sm:mr-[0.3vw] text-[#a7f3d0]" />
                  <span>Sucursal Luján · Compra personalizada y de diseño</span>
                </p>
                <p className="text-gray-400 pl-[4.5vw] sm:pl-[1.8vw] lg:pl-[1.2vw]">
                  Circuito Alma Gardenia, Luján de Cuyo
                </p>
                <p className="text-gray-500 pl-[4.5vw] sm:pl-[1.8vw] lg:pl-[1.2vw] text-[2.6vw] sm:text-[1.1vw] lg:text-[0.68vw]">
                  Lunes a Sábado: 10:00 a 20:00 (Cita y asesoría)
                </p>
              </div>
            </div>
          </div>

          {/* Col 3: Líneas & Catálogo */}
          <div className="space-y-[1.5vh]">
            <h4 className="font-heading font-semibold text-white text-[3.6vw] sm:text-[1.6vw] lg:text-[0.9vw] tracking-wider uppercase">
              Líneas & Catálogo
            </h4>
            <ul className="space-y-[1vh] text-[3vw] sm:text-[1.3vw] lg:text-[0.75vw]">
              <li>
                <Link href="/compra-facil" className="text-[#f6ad55] hover:text-white transition-colors font-medium">
                  ⚡ Línea Compra fácil y estándar (48 hs)
                </Link>
              </li>
              <li>
                <Link href="/interiorismo" className="text-[#a7f3d0] hover:text-white transition-colors font-medium">
                  ✨ Compra personalizada y de diseño
                </Link>
              </li>
              <li>
                <Link href="/productos" className="hover:text-white transition-colors">
                  Todos los Productos
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Portal de Selección Inicial
                </Link>
              </li>
              <li>
                <Link href="/sucursales" className="hover:text-white transition-colors">
                  Nuestros Showrooms
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-gray-400 hover:text-white transition-colors">
                  Panel WooCommerce
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contacto */}
          <div className="space-y-[1.5vh]">
            <h4 className="font-heading font-semibold text-white text-[3.6vw] sm:text-[1.6vw] lg:text-[0.9vw] tracking-wider uppercase">
              Contacto
            </h4>
            <div className="space-y-[1.2vh] text-[3vw] sm:text-[1.3vw] lg:text-[0.75vw]">
              <a
                href="https://wa.me/5492616843330"
                target="_blank"
                rel="noreferrer"
                className="flex items-center hover:text-white transition-colors"
              >
                <Phone className="w-[3.5vw] sm:w-[1.5vw] lg:w-[0.9vw] mr-[1vw] sm:mr-[0.4vw] text-[#25D366]" />
                +54 9 261 684-3330
              </a>
              <div className="flex items-center text-gray-400">
                <Mail className="w-[3.5vw] sm:w-[1.5vw] lg:w-[0.9vw] mr-[1vw] sm:mr-[0.4vw] text-gray-400" />
                info@acasatienda.com.ar
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-[4vh] border-t border-gray-800 text-[2.8vw] sm:text-[1.2vw] lg:text-[0.7vw] text-gray-500 flex flex-col sm:flex-row justify-between items-center gap-[1.5vh]">
          <p>© {new Date().getFullYear()} ACASA TIENDA. Todos los derechos reservados.</p>
          <p className="tracking-widest uppercase">Mendoza, Argentina</p>
        </div>
      </div>
    </footer>
  );
}
