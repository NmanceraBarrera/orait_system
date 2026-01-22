'use client';

import { useState } from 'react';
import { createSolicitud } from '@/lib/firebase/solicitudes';
import FileUpload from '@/components/ui/FileUpload';
import toast from 'react-hot-toast';
import { Upload, FileText, User, Briefcase, CheckCircle, Phone } from 'lucide-react';

export default function TrabajaConNosotrosPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    rut: null as File | null,
    fotocopiaCC: null as File | null,
    hojaVida: null as File | null,
    certificacionSalvavidas: null as File | null,
    certificacionEPS: null as File | null,
  });

  const handleFileSelect = (field: string) => (file: File | null) => {
    setFormData((prev) => ({ ...prev, [field]: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }

    // Validar que al menos haya un archivo
    const hasFiles = formData.rut || formData.fotocopiaCC || formData.hojaVida || 
                     formData.certificacionSalvavidas || formData.certificacionEPS;
    
    if (!hasFiles) {
      toast.error('Debes subir al menos un documento');
      return;
    }

    setLoading(true);
    try {
      await createSolicitud({
        nombre: formData.nombre.trim(),
        telefono: formData.telefono.trim() || undefined,
        rut: formData.rut || undefined,
        fotocopiaCC: formData.fotocopiaCC || undefined,
        hojaVida: formData.hojaVida || undefined,
        certificacionSalvavidas: formData.certificacionSalvavidas || undefined,
        certificacionEPS: formData.certificacionEPS || undefined,
      });

      toast.success('¡Solicitud enviada exitosamente! Nos pondremos en contacto contigo pronto.');
      
      // Resetear formulario
      setFormData({
        nombre: '',
        telefono: '',
        rut: null,
        fotocopiaCC: null,
        hojaVida: null,
        certificacionSalvavidas: null,
        certificacionEPS: null,
      });
      
      // Resetear inputs de archivo
      const fileInputs = document.querySelectorAll('input[type="file"]');
      fileInputs.forEach((input) => {
        (input as HTMLInputElement).value = '';
      });
    } catch (error: any) {
      console.error('Error enviando solicitud:', error);
      toast.error(error.message || 'Error al enviar la solicitud. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
              <Briefcase className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
              Trabaja con Nosotros
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Únete a nuestro equipo de salvavidas profesionales. Envía tu solicitud con los documentos requeridos.
            </p>
          </div>

          {/* Formulario */}
          <div className="rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nombre */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <User className="h-4 w-4" />
                  Nombre Completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData((prev) => ({ ...prev, nombre: e.target.value }))}
                  required
                  className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  placeholder="Ingresa tu nombre completo"
                />
              </div>

              {/* Teléfono de Contacto */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Phone className="h-4 w-4" />
                  Número de Contacto
                </label>
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => setFormData((prev) => ({ ...prev, telefono: e.target.value }))}
                  className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  placeholder="Ej: 3001234567"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Número donde podemos contactarte
                </p>
              </div>

              {/* RUT */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <FileText className="h-4 w-4" />
                  RUT
                </label>
                <FileUpload
                  onFileSelect={handleFileSelect('rut')}
                  accept=".pdf,.jpg,.jpeg,.png"
                  label="Subir RUT (PDF o Imagen)"
                  disabled={loading}
                />
              </div>

              {/* Fotocopia CC */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <FileText className="h-4 w-4" />
                  Fotocopia Cédula de Ciudadanía
                </label>
                <FileUpload
                  onFileSelect={handleFileSelect('fotocopiaCC')}
                  accept=".pdf,.jpg,.jpeg,.png"
                  label="Subir Fotocopia CC (PDF o Imagen)"
                  disabled={loading}
                />
              </div>

              {/* Hoja de Vida */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <FileText className="h-4 w-4" />
                  Hoja de Vida
                </label>
                <FileUpload
                  onFileSelect={handleFileSelect('hojaVida')}
                  accept=".pdf,.doc,.docx"
                  label="Subir Hoja de Vida (PDF o Word)"
                  disabled={loading}
                />
              </div>

              {/* Certificación de Salvavidas */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <FileText className="h-4 w-4" />
                  Certificación de Salvavidas
                </label>
                <FileUpload
                  onFileSelect={handleFileSelect('certificacionSalvavidas')}
                  accept=".pdf,.jpg,.jpeg,.png"
                  label="Subir Certificación de Salvavidas (PDF o Imagen)"
                  disabled={loading}
                />
              </div>

              {/* Certificación EPS */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <FileText className="h-4 w-4" />
                  Certificación EPS
                </label>
                <FileUpload
                  onFileSelect={handleFileSelect('certificacionEPS')}
                  accept=".pdf,.jpg,.jpeg,.png"
                  label="Subir Certificación EPS (PDF o Imagen)"
                  disabled={loading}
                />
              </div>

              {/* Botón de envío */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5" />
                    Enviar Solicitud
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Información adicional */}
          <div className="mt-8 rounded-xl bg-blue-50 p-6 dark:bg-blue-900/20">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-300">
                  Información Importante
                </h3>
                <p className="mt-2 text-sm text-blue-800 dark:text-blue-400">
                  Una vez que envíes tu solicitud, nuestro equipo de supervisores la revisará. 
                  Te contactaremos a través del correo electrónico proporcionado si tu perfil 
                  coincide con nuestras necesidades.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
