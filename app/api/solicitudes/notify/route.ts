import { NextResponse } from 'next/server';
import { sendCandidateNotification } from '@/lib/email/candidateNotification';

interface NotifyRequestBody {
  nombre?: string;
  telefono?: string;
  solicitudId?: string;
  documentosRecibidos?: string[];
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as NotifyRequestBody;

    const nombre = body.nombre?.trim();
    const solicitudId = body.solicitudId?.trim();
    const telefono = body.telefono?.trim();
    const documentosRecibidos = body.documentosRecibidos?.filter(Boolean) ?? [];

    if (!nombre || !solicitudId) {
      return NextResponse.json(
        { error: 'Nombre y ID de solicitud son obligatorios' },
        { status: 400 }
      );
    }

    if (documentosRecibidos.length === 0) {
      return NextResponse.json(
        { error: 'Debe indicar al menos un documento recibido' },
        { status: 400 }
      );
    }

    await sendCandidateNotification({
      nombre,
      telefono,
      solicitudId,
      documentosRecibidos,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    const code =
      typeof error === 'object' && error !== null && 'code' in error
        ? String((error as { code: unknown }).code)
        : undefined;

    console.error('Error enviando notificación de candidato:', { message, code, error });

    return NextResponse.json(
      { error: 'No se pudo enviar la notificación por correo' },
      { status: 500 }
    );
  }
}
