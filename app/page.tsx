import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Shield, Users, FileText, Phone, Award, Sparkles, Heart, CheckCircle, Waves, Dumbbell, GraduationCap, Music } from 'lucide-react';
import imagen1 from '@/app/assets/1.png';
import imagen2 from '@/app/assets/2.png';
import imagen3 from '@/app/assets/3.png';
import imagen4 from '@/app/assets/4.png';
import imagen5 from '@/app/assets/5.png';
import logoImage from '@/app/assets/logo.png';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-24 sm:px-6 lg:px-8" style={{ backgroundColor: '#80D7C9' }}>
        <div className="container mx-auto">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-black sm:text-5xl md:text-6xl">
              Bienvenido a ORAIT S.A.S
            </h1>
            {/* Delfines negros */}
            <div className="mt-6 flex items-center justify-center">
              <div className="relative w-48 h-24 sm:w-64 sm:h-32">
                <Image
                  src={logoImage}
                  alt="Delfines ORAIT"
                  fill
                  className="object-contain"
                  style={{ filter: 'brightness(0)' }}
                />
              </div>
            </div>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-800">
              Somos una empresa innovadora con grandes sueños y proyectos por sacar adelante, 
              ofrecemos Servicios profesionales de Rescate Acuático y Salvamento, 
              autorizado en todo el territorio nacional.
            </p>
          </div>
        </div>
      </section>

      {/* Sobre Nosotros Section */}
      <section className="py-16 sm:py-24" style={{ backgroundColor: '#F0F9F7' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: '#2C3E50' }}>
                Sobre Nosotros
              </h2>
            </div>
            <div className="rounded-xl p-8 shadow-lg" style={{ backgroundColor: '#FFFFFF' }}>
              <p className="text-lg leading-8 mb-6" style={{ color: '#34495E' }}>
                Ofrecemos servicios profesionales de <strong style={{ color: '#80D7C9' }}>Rescate Acuático y Salvamento</strong>, 
                autorizado en todo el territorio nacional, en instalaciones de <strong style={{ color: '#80D7C9' }}>espacios confinados estanques (piscinas)</strong> 
                y <strong style={{ color: '#80D7C9' }}>espacios abiertos</strong>.
              </p>
              <p className="text-lg leading-8" style={{ color: '#34495E' }}>
                Nuestro equipo humano está compuesto por profesionales altamente calificados capacitados para dar respuesta 
                a la demanda de calidad necesaria en esta profesión, por ello contamos con <strong style={{ color: '#80D7C9' }}>rescatistas acuáticos profesionales 
                certificados por el SENA</strong> y otras entidades que cumplen los requisitos de seguridad en las aguas de espacios 
                cerrados y abiertos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Nuestro Servicio Incluye Section */}
      <section className="py-20 sm:py-28" style={{ background: 'linear-gradient(135deg, #F0F9F7 0%, #E8F5F3 100%)' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4" style={{ color: '#2C3E50' }}>
                Nuestro Servicio Incluye
              </h2>
              <div className="w-24 h-1 mx-auto rounded-full" style={{ backgroundColor: '#80D7C9' }}></div>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 transition-transform duration-300 group-hover:scale-150" style={{ backgroundColor: '#B8E994', transform: 'translate(30%, -30%)' }}></div>
                <div className="relative">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" style={{ backgroundColor: '#B8E994' }}>
                    <Shield className="h-8 w-8" style={{ color: '#2C3E50' }} />
                  </div>
                  <h3 className="text-2xl font-bold mb-3" style={{ color: '#2C3E50' }}>
                    Operarios de Rescate Acuático
                  </h3>
                  <p className="text-base leading-7" style={{ color: '#5A6C7D' }}>
                    Certificados por el <strong style={{ color: '#80D7C9' }}>SENA</strong> u/o otras entidades que cumplen los requisitos profesionales. 
                    Profesionales altamente capacitados para garantizar la seguridad en espacios acuáticos.
                  </p>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 transition-transform duration-300 group-hover:scale-150" style={{ backgroundColor: '#FF6B6B', transform: 'translate(30%, -30%)' }}></div>
                <div className="relative">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" style={{ backgroundColor: '#FF6B6B' }}>
                    <Waves className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3" style={{ color: '#2C3E50' }}>
                    Operarios de Mantenimiento de Piscinas
                  </h3>
                  <p className="text-base leading-7" style={{ color: '#5A6C7D' }}>
                    Certificados por el <strong style={{ color: '#80D7C9' }}>SENA</strong> en tratamientos de aguas confinadas, con manejo adecuado de químicos, 
                    control planillas y bitácora según exigencia <strong style={{ color: '#80D7C9' }}>Secretaría de Salud</strong> y otras entes de control.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Valor Agregado Section */}
      <section className="py-20 sm:py-28" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FDFC 100%)' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-3" style={{ color: '#2C3E50' }}>
                Valor Agregado
              </h2>
              <p className="text-lg" style={{ color: '#5A6C7D' }}>en Condominios y Conjuntos</p>
              <div className="w-20 h-1 mx-auto mt-4 rounded-full" style={{ backgroundColor: '#80D7C9' }}></div>
            </div>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {/* Clases de Natación - Imagen 1 */}
              <div className="group relative overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:scale-105">
                <div className="relative h-64 overflow-hidden bg-gray-100">
                  <Image
                    src={imagen1}
                    alt="Clases de Natación"
                    fill
                    className="object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2" style={{ color: '#2C3E50' }}>
                    Clases de Natación
                  </h3>
                  <p className="text-sm" style={{ color: '#7A8A9A' }}>
                    Para niños y adultos - Nivel Básico
                  </p>
                </div>
              </div>

              {/* RumbAcuatic - Imagen 2 */}
              <div className="group relative overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:scale-105">
                <div className="relative h-64 overflow-hidden bg-gray-100">
                  <Image
                    src={imagen2}
                    alt="RumbAcuatic"
                    fill
                    className="object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2" style={{ color: '#2C3E50' }}>
                    RumbAcuatic
                  </h3>
                  <p className="text-sm" style={{ color: '#7A8A9A' }}>
                    Música y diversión en el agua
                  </p>
                </div>
              </div>

              {/* Recreación Dirigida Acuática - Imagen 3 */}
              <div className="group relative overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:scale-105">
                <div className="relative h-64 overflow-hidden bg-gray-100">
                  <Image
                    src={imagen3}
                    alt="Recreación Dirigida Acuática"
                    fill
                    className="object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2" style={{ color: '#2C3E50' }}>
                    Recreación Dirigida Acuática
                  </h3>
                  <p className="text-sm" style={{ color: '#7A8A9A' }}>
                    Actividades recreativas en el agua
                  </p>
                </div>
              </div>

              {/* Cardio Zumba - Imagen 4 */}
              <div className="group relative overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:scale-105">
                <div className="relative h-64 overflow-hidden bg-gray-100">
                  <Image
                    src={imagen4}
                    alt="Cardio Zumba"
                    fill
                    className="object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2" style={{ color: '#2C3E50' }}>
                    Cardio Zumba
                  </h3>
                  <p className="text-sm" style={{ color: '#7A8A9A' }}>
                    Ejercicio dinámico y divertido
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Acróstico ORAIT Section */}
      <section className="py-20 sm:py-32 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #4A90E2 0%, #80D7C9 100%)' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl mb-4">
                Nuestros Valores
              </h2>
            </div>
            
            {/* Acróstico Diagonal ORAIT */}
            <div className="relative flex items-center justify-center min-h-[550px] sm:min-h-[650px]">
              <div className="acrostic-wrapper relative w-full flex flex-col lg:flex-row items-center justify-center gap-8 sm:gap-12">
                {/* Bloque translúcido con acróstico */}
                <div 
                  className="acrostic-block relative rounded-xl px-10 sm:px-14 py-12 sm:py-16 shadow-2xl"
                  style={{ 
                    backgroundColor: 'rgba(128, 215, 201, 0.9)',
                    width: '100%',
                    maxWidth: '420px',
                    border: '3px solid rgba(255, 255, 255, 0.4)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <div className="flex flex-col items-start justify-center space-y-2 sm:space-y-3 text-white">
                    <div className="acrostic-value value-1 text-xl sm:text-2xl font-bold leading-tight">
                      <span className="text-3xl sm:text-4xl font-black mr-2 inline-block">O</span>bediencia
                    </div>
                    <div className="acrostic-value value-2 text-xl sm:text-2xl font-bold leading-tight">
                      <span className="text-3xl sm:text-4xl font-black mr-2 inline-block">R</span>espeto
                    </div>
                    <div className="acrostic-value value-3 text-xl sm:text-2xl font-bold leading-tight">
                      <span className="text-3xl sm:text-4xl font-black mr-2 inline-block">A</span>utoridad
                    </div>
                    <div className="acrostic-value value-4 text-xl sm:text-2xl font-bold leading-tight">
                      <span className="text-3xl sm:text-4xl font-black mr-2 inline-block">I</span>ntegridad
                    </div>
                    <div className="acrostic-value value-5 text-xl sm:text-2xl font-bold leading-tight">
                      <span className="text-3xl sm:text-4xl font-black mr-2 inline-block">T</span>olerancia
                    </div>
                    <div className="acrostic-value value-6 text-xl sm:text-2xl font-bold leading-tight">
                      <span className="text-3xl sm:text-4xl font-black mr-2 inline-block">S</span>eguridad
                    </div>
                    <div className="acrostic-value value-7 text-xl sm:text-2xl font-bold leading-tight">
                      <span className="text-3xl sm:text-4xl font-black mr-2 inline-block">A</span>mor
                    </div>
                    <div className="acrostic-value value-8 text-xl sm:text-2xl font-bold leading-tight">
                      <span className="text-3xl sm:text-4xl font-black mr-2 inline-block">S</span>olución
                    </div>
                  </div>
                </div>
                
                {/* Imagen 5.png al lado del acróstico */}
                <div className="relative w-full max-w-md sm:max-w-lg h-auto flex-shrink-0 hidden lg:block">
                  <Image
                    src={imagen5}
                    alt="ORAIT"
                    width={600}
                    height={600}
                    className="object-contain w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
