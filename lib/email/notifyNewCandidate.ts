import { SOLICITUD_DOCUMENT_FIELDS } from '@/lib/constants/solicitudDocuments';

interface NotifyCandidateParams {
  nombre: string;
  telefono?: string;
  solicitudId: string;
}

export const notifyNewCandidate = async ({
  nombre,
  telefono,
  solicitudId,
}: NotifyCandidateParams): Promise<void> => {
  try {
    const response = await fetch('/api/solicitudes/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre,
        telefono,
        solicitudId,
        documentosRecibidos: SOLICITUD_DOCUMENT_FIELDS.map(({ label }) => label),
      }),
    });

    if (!response.ok) {
      console.error('Notificación por correo no enviada:', await response.text());
    }
  } catch (error) {
    console.error('Error al solicitar notificación por correo:', error);
  }
};
