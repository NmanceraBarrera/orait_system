import { Users, Target, Award } from 'lucide-react';

export default function QuienesSomosPage() {
  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            Quiénes Somos
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400">
            ORAIT S.A.S. - Especialistas en Rescate Acuático y Salvavidas Profesionales
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-4xl space-y-12">
          <div className="rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Misión</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  ORAIT S.A.S. se dedica a proporcionar servicios profesionales de rescate acuático 
                  y salvavidas para piscinas privadas, públicas y estanques. Nuestra plataforma 
                  tecnológica optimiza la gestión de documentos para nuestros equipos de salvavidas, 
                  facilitando procesos administrativos y mejorando la eficiencia operativa mediante 
                  herramientas modernas y seguras.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                <Award className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Visión</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Ser la empresa líder en servicios de rescate acuático y salvavidas en la región, 
                  reconocida por la excelencia profesional de nuestros equipos, la seguridad en 
                  piscinas y estanques, y por nuestra capacidad de innovar en la gestión de recursos 
                  humanos especializados en rescate acuático.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
                <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Valores</h2>
                <ul className="mt-4 space-y-2 text-gray-600 dark:text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-600 dark:bg-purple-400" />
                    <span>
                      <strong>Seguridad Acuática:</strong> Priorizamos la seguridad en piscinas y 
                      estanques, con salvavidas altamente capacitados y certificados.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-600 dark:bg-purple-400" />
                    <span>
                      <strong>Profesionalismo:</strong> Equipos de rescate acuático con certificación 
                      y experiencia en salvamento acuático.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-600 dark:bg-purple-400" />
                    <span>
                      <strong>Eficiencia:</strong> Optimización de procesos administrativos para 
                      que nuestros salvavidas se enfoquen en su labor de rescate.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-600 dark:bg-purple-400" />
                    <span>
                      <strong>Compromiso:</strong> Dedicación total a la seguridad acuática en 
                      piscinas privadas, públicas y estanques.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
