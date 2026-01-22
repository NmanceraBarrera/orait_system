import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react';

export default function ContactoPage() {
  return (
    <div className="min-h-screen py-16 sm:py-24" style={{ backgroundColor: '#F0F9F7' }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4" style={{ color: '#2C3E50' }}>
              Contacto
            </h1>
            <div className="w-20 h-1 mx-auto rounded-full" style={{ backgroundColor: '#80D7C9' }}></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Columna izquierda: Secciones de contacto */}
            <div className="space-y-6">
              {/* Sección principal de contacto */}
              <div className="rounded-xl p-6 shadow-lg" style={{ backgroundColor: '#FFFFFF' }}>
                <div className="space-y-3 text-lg" style={{ color: '#34495E' }}>
                  <div className="flex items-center gap-3">
                    <MessageCircle className="h-5 w-5 shrink-0" style={{ color: '#80D7C9' }} />
                    <a 
                      href="https://wa.me/573008571105" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-semibold hover:underline"
                      style={{ color: '#80D7C9' }}
                    >
                      WhatsApp +57 (1) 3008571105
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 shrink-0" style={{ color: '#80D7C9' }} />
                    <a 
                      href="mailto:oraitsas600horas@gmail.com"
                      className="font-semibold hover:underline"
                      style={{ color: '#80D7C9' }}
                    >
                      oraitsas600horas@gmail.com
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 shrink-0" style={{ color: '#80D7C9' }} />
                    <a 
                      href="mailto:orait600horas@gmail.com"
                      className="font-semibold hover:underline"
                      style={{ color: '#80D7C9' }}
                    >
                      orait600horas@gmail.com
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 shrink-0" style={{ color: '#80D7C9' }} />
                    <span>Carrera 14 bis Sur # 95 - 120</span>
                  </div>
                </div>
              </div>

              {/* Mensaje motivacional */}
              <div className="rounded-xl p-6 shadow-lg" style={{ backgroundColor: '#FFFFFF' }}>
                <h3 className="text-xl font-bold mb-3" style={{ color: '#2C3E50' }}>
                  ¿Quieres calidad, seguridad y servicio?
                </h3>
                <p className="text-base leading-7" style={{ color: '#5A6C7D' }}>
                  Escríbenos o llámanos. Tenemos la mejor disposición para proveerte toda la información que necesites y ayudarte con cualquier pregunta que puedas tener.
                </p>
              </div>
            </div>

            {/* Columna derecha: Mapa */}
            <div className="rounded-xl overflow-hidden shadow-lg">
              <iframe
                src="https://www.google.com/maps?q=4.419104811954033,-75.17503741514065&hl=es&z=17&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '450px' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación ORAIT S.A.S - Carrera 14 bis Sur # 95 - 120, Ibagué, Tolima"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
