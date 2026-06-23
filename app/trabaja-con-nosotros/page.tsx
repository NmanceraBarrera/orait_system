'use client';

import { useState } from 'react';
import { createSolicitud } from '@/lib/firebase/solicitudes';
import { notifyNewCandidate } from '@/lib/email/notifyNewCandidate';
import FileUpload from '@/components/ui/FileUpload';
import toast from 'react-hot-toast';
import { Upload, FileText, User, Briefcase, CheckCircle, Phone } from 'lucide-react';
import {
  SOLICITUD_DOCUMENT_FIELDS,
  SolicitudDocumentField,
} from '@/lib/constants/solicitudDocuments';

const initialFiles = Object.fromEntries(
  SOLICITUD_DOCUMENT_FIELDS.map(({ key }) => [key, null])
) as Record<SolicitudDocumentField, File | null>;

export default function TrabajaConNosotrosPage() {
  const [loading, setLoading] = useState(false);
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [files, setFiles] = useState(initialFiles);

  const handleFileSelect = (field: SolicitudDocumentField) => (file: File | null) => {
    setFiles((prev) => ({ ...prev, [field]: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }

    const missingDocument = SOLICITUD_DOCUMENT_FIELDS.find(({ key, label }) => !files[key]);
    if (missingDocument) {
      toast.error(`Debes subir: ${missingDocument.label}`);
      return;
    }

    setLoading(true);
    try {
      const solicitudId = await createSolicitud({
        nombre: nombre.trim(),
        telefono: telefono.trim() || undefined,
        hojaVida: files.hojaVida || undefined,
        certificacionSalvavidas: files.certificacionSalvavidas || undefined,
        certificacionPrimerosAuxilios: files.certificacionPrimerosAuxilios || undefined,
        certificacionEPS: files.certificacionEPS || undefined,
        fotocopiaCC: files.fotocopiaCC || undefined,
        rut: files.rut || undefined,
        certificadoAntecedentes: files.certificadoAntecedentes || undefined,
        certificadoBancario: files.certificadoBancario || undefined,
      });

      await notifyNewCandidate({
        nombre: nombre.trim(),
        telefono: telefono.trim() || undefined,
        solicitudId,
      });

      toast.success('¡Solicitud enviada exitosamente! Nos pondremos en contacto contigo pronto.');

      setNombre('');
      setTelefono('');
      setFiles(initialFiles);

      const fileInputs = document.querySelectorAll('input[type="file"]');
      fileInputs.forEach((input) => {
        (input as HTMLInputElement).value = '';
      });
    } catch (error: unknown) {
      console.error('Error enviando solicitud:', error);
      const message = error instanceof Error ? error.message : 'Error al enviar la solicitud. Por favor, intenta nuevamente.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
              <Briefcase className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
              Presta servicios con Nosotros
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Únete a nuestro equipo de salvavidas profesionales. Envía tu solicitud con los 8 documentos requeridos.
            </p>
          </div>

          <div className="rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <User className="h-4 w-4" />
                  Nombre Completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  placeholder="Ingresa tu nombre completo"
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Phone className="h-4 w-4" />
                  Número de Contacto
                </label>
                <input
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  placeholder="Ej: 3001234567"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Número donde podemos contactarte
                </p>
              </div>

              <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                <h2 className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                  Documentos requeridos
                </h2>
                <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-blue-800 dark:text-blue-400">
                  {SOLICITUD_DOCUMENT_FIELDS.map(({ label }) => (
                    <li key={label}>{label}</li>
                  ))}
                </ol>
              </div>

              {SOLICITUD_DOCUMENT_FIELDS.map(({ key, label, uploadLabel, accept }, index) => (
                <div key={key}>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <FileText className="h-4 w-4" />
                    {index + 1}. {label} <span className="text-red-500">*</span>
                  </label>
                  <FileUpload
                    onFileSelect={handleFileSelect(key)}
                    accept={accept}
                    label={uploadLabel}
                    disabled={loading}
                  />
                </div>
              ))}

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

          <div className="mt-8 rounded-xl bg-blue-50 p-6 dark:bg-blue-900/20">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-300">
                  Información Importante
                </h3>
                <p className="mt-2 text-sm text-blue-800 dark:text-blue-400">
                  Una vez que envíes tu solicitud con los 8 documentos, nuestro equipo de supervisores la revisará.
                  Te contactaremos si tu perfil coincide con nuestras necesidades.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
