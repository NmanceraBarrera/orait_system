'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin, Briefcase } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Información de la empresa */}
          <div className="col-span-1 lg:col-span-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              EMPRESA OPERARIOS DE RESCATE ACUÁTICO IBAGUÉ TOLIMA S.A.S
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Apoyo Hotelero Empresarial, Clubes, Condominios, Conjuntos, Fincas hoteleras, 
              piscinas privadas y piscinas públicas
            </p>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p><strong className="text-gray-900 dark:text-white">NIT:</strong> 901318688-1</p>
              <p className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>Carrera 14 bis Sur # 95 - 120</span>
              </p>
            </div>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white mb-4">
              Contacto
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="tel:+573008571105"
                  className="flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  <Phone className="h-4 w-4" />
                  +57 (1) 300 857 11 05
                </a>
              </li>
              <li>
                <a
                  href="tel:+573196772262"
                  className="flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  <Phone className="h-4 w-4" />
                  3196772262
                </a>
              </li>
              <li>
                <a
                  href="mailto:oraitsas600horas@gmail.com"
                  className="flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  <Mail className="h-4 w-4" />
                  oraitsas600horas@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="mailto:orait600horas@gmail.com"
                  className="flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  <Mail className="h-4 w-4" />
                  orait600horas@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="mailto:contabilidad.oraitsas@gmail.com"
                  className="flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  <Mail className="h-4 w-4" />
                  contabilidad.oraitsas@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="mailto:sstoraitsas@gmail.com"
                  className="flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  <Mail className="h-4 w-4" />
                  sstoraitsas@gmail.com
                </a>
              </li>
            </ul>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white mb-4">
              Enlaces
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/servicios"
                  className="text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  Servicios
                </Link>
              </li>
              <li>
                <Link
                  href="/contacto"
                  className="text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  Contacto
                </Link>
              </li>
              <li>
                <Link
                  href="/trabaja-con-nosotros"
                  className="flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  <Briefcase className="h-4 w-4" />
                  Presta servicios con Nosotros
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-8 dark:border-gray-800">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} ORAIT S.A.S. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
