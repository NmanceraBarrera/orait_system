import { Shield, Waves, Users, Sparkles, GraduationCap, Music, Dumbbell } from 'lucide-react';
import Image from 'next/image';
import imagen6 from '@/app/assets/6.png';
import imagen7 from '@/app/assets/7.png';

export default function ServiciosPage() {
  return (
    <div className="min-h-screen py-16 sm:py-24" style={{ backgroundColor: '#F0F9F7' }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4" style={{ color: '#2C3E50' }}>
              Servicios
            </h1>
            <div className="w-20 h-1 mx-auto rounded-full mb-6" style={{ backgroundColor: '#80D7C9' }}></div>
            <div className="relative w-full max-w-2xl mx-auto h-64 sm:h-80">
              <Image
                src={imagen6}
                alt="Servicios ORAIT"
                fill
                className="object-contain"
              />
            </div>
          </div>

          {/* Introducción */}
          <div className="mb-8 rounded-xl p-8 shadow-lg" style={{ backgroundColor: '#F0F9F7' }}>
            <p className="text-lg leading-8 text-center" style={{ color: '#34495E' }}>
              Prestamos servicios de <strong style={{ color: '#80D7C9' }}>rescate acuático</strong>, en hoteles, conjuntos residenciales, clubes, viviendas unifamiliares, fincas y demás lugares en donde existan aguas confinadas (piscinas), de la misma manera servicio de <strong style={{ color: '#80D7C9' }}>aseo y limpieza a piscinas</strong>, mantenimiento a equipos de piscina, igualmente el desarrollo de cualquier acto lícito de comercio, venta y comercialización de productos y elementos para la limpieza y tratamiento de piscinas, acorde con la <strong style={{ color: '#80D7C9' }}>ley 1209 de 2008</strong> y demás normas legales vigentes.
            </p>
          </div>

          {/* Imagen 7.png */}
          <div className="mb-16 relative w-full max-w-3xl mx-auto h-64 sm:h-80">
            <Image
              src={imagen7}
              alt="Nuestro Servicio Incluye"
              fill
              className="object-contain"
            />
          </div>

          {/* Servicios principales */}
          <div className="space-y-8">
            {/* Rescate Acuático Profesional */}
            <div className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-6" style={{ backgroundColor: '#B8E994' }}>
                  <Shield className="h-8 w-8" style={{ color: '#2C3E50' }} />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-4" style={{ color: '#2C3E50' }}>
                    RESCATE ACUÁTICO PROFESIONAL
                  </h2>
                  <p className="text-base leading-7" style={{ color: '#5A6C7D' }}>
                    Somos un grupo profesional de operarios de rescate acuático salvavidas; contamos con el <strong style={{ color: '#80D7C9' }}>certificado de mayor rango otorgado por el SENA</strong>, dando cumplimiento a los entes de control <strong style={{ color: '#80D7C9' }}>ONU, DANE, CCIT y DIAN</strong>.
                  </p>
                </div>
              </div>
            </div>

            {/* Mantenimiento de Piscinas */}
            <div className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-6" style={{ backgroundColor: '#FF6B6B' }}>
                  <Waves className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-4" style={{ color: '#2C3E50' }}>
                    MANTENIMIENTO DE PISCINAS
                  </h2>
                  <p className="text-base leading-7" style={{ color: '#5A6C7D' }}>
                    Realizamos labores de mantenimiento, orden y servicio al cliente, tanto en la piscina como en las zonas húmedas existentes. Cumpliendo con el <strong style={{ color: '#80D7C9' }}>Marco Normativo relacionado</strong> apoyando a la correcta gestión y protección de los intereses de las administraciones o propietarios de estas piscinas.
                  </p>
                </div>
              </div>
            </div>

            {/* Instructores y Recreación Dirigida */}
            <div className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-6" style={{ backgroundColor: '#4A90E2' }}>
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-4" style={{ color: '#2C3E50' }}>
                    INSTRUCTORES(AS) Y RECREACIÓN DIRIGIDA
                  </h2>
                  <p className="text-base leading-7 mb-6" style={{ color: '#5A6C7D' }}>
                    Nuestro equipo humano, disfruta de servir a todos nuestros clientes con cada uno de nuestros servicios especializados como valor agregado así:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-4 rounded-lg" style={{ backgroundColor: '#F0F9F7' }}>
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: '#80D7C9' }}>
                        <Sparkles className="h-5 w-5" style={{ color: '#2C3E50' }} />
                      </div>
                      <span className="font-semibold" style={{ color: '#2C3E50' }}>Instructores de Recreación</span>
                    </div>
                    <div className="flex items-center gap-3 p-4 rounded-lg" style={{ backgroundColor: '#F0F9F7' }}>
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: '#80D7C9' }}>
                        <GraduationCap className="h-5 w-5" style={{ color: '#2C3E50' }} />
                      </div>
                      <span className="font-semibold" style={{ color: '#2C3E50' }}>Instructores de Natación Básico</span>
                    </div>
                    <div className="flex items-center gap-3 p-4 rounded-lg" style={{ backgroundColor: '#F0F9F7' }}>
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: '#80D7C9' }}>
                        <Music className="h-5 w-5" style={{ color: '#2C3E50' }} />
                      </div>
                      <span className="font-semibold" style={{ color: '#2C3E50' }}>Rumbacuatic</span>
                    </div>
                    <div className="flex items-center gap-3 p-4 rounded-lg" style={{ backgroundColor: '#F0F9F7' }}>
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: '#80D7C9' }}>
                        <Dumbbell className="h-5 w-5" style={{ color: '#2C3E50' }} />
                      </div>
                      <span className="font-semibold" style={{ color: '#2C3E50' }}>Cardio Zumba</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
