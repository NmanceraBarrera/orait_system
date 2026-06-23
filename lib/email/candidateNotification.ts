import nodemailer from 'nodemailer';

const DEFAULT_NOTIFY_EMAIL = 'oraitsas600horas@gmail.com';

export interface CandidateNotificationData {
  nombre: string;
  telefono?: string;
  solicitudId: string;
  documentosRecibidos: string[];
}

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'America/Bogota',
  }).format(date);

const buildPlainText = (data: CandidateNotificationData, fecha: string) => `ORAIT S.A.S. – Nueva solicitud de candidato

Se ha registrado una nueva postulación a través del formulario "Presta servicios con Nosotros" en el sitio web oficial.

Datos del candidato
-------------------
Nombre completo: ${data.nombre}
Teléfono de contacto: ${data.telefono || 'No proporcionado'}
Fecha y hora de registro: ${fecha}
ID de solicitud: ${data.solicitudId}

Documentación recibida (${data.documentosRecibidos.length} archivos en PDF)
${data.documentosRecibidos.map((doc, i) => `${i + 1}. ${doc}`).join('\n')}

Los archivos fueron almacenados de forma segura en el sistema interno. Puede revisarlos desde el panel de supervisión.

---
Este es un mensaje automático generado por el sistema ORAIT. Por favor, no responda a este correo.
`;

const buildHtml = (data: CandidateNotificationData, fecha: string) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,Helvetica,sans-serif;color:#34495e;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f6f8;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.08);">
          <tr>
            <td style="background-color:#2c3e50;padding:28px 32px;">
              <p style="margin:0;font-size:13px;letter-spacing:1px;text-transform:uppercase;color:#80d7c9;">ORAIT S.A.S.</p>
              <h1 style="margin:12px 0 0;font-size:22px;line-height:1.4;color:#ffffff;font-weight:600;">
                Nueva solicitud de candidato
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#34495e;">
                Se ha presentado un nuevo candidato a través del formulario
                <strong>Presta servicios con Nosotros</strong> en la página web oficial de ORAIT S.A.S.
              </p>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f8fafb;border:1px solid #e8edf2;border-radius:8px;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 16px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#80d7c9;">
                      Datos del candidato
                    </p>
                    <p style="margin:0 0 10px;font-size:14px;line-height:1.5;">
                      <strong>Nombre completo:</strong> ${data.nombre}
                    </p>
                    <p style="margin:0 0 10px;font-size:14px;line-height:1.5;">
                      <strong>Teléfono de contacto:</strong> ${data.telefono || 'No proporcionado'}
                    </p>
                    <p style="margin:0 0 10px;font-size:14px;line-height:1.5;">
                      <strong>Fecha y hora:</strong> ${fecha}
                    </p>
                    <p style="margin:0;font-size:14px;line-height:1.5;">
                      <strong>Referencia interna:</strong> ${data.solicitudId}
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:#2c3e50;">
                Documentación recibida (${data.documentosRecibidos.length} archivos en PDF)
              </p>
              <ul style="margin:0 0 24px;padding-left:20px;font-size:14px;line-height:1.8;color:#34495e;">
                ${data.documentosRecibidos.map((doc) => `<li>${doc}</li>`).join('')}
              </ul>

              <p style="margin:0;font-size:14px;line-height:1.6;color:#5d6d7e;">
                Los documentos fueron cargados correctamente y están disponibles para su revisión
                en el <strong>panel de supervisión</strong> del sistema. Este correo no incluye adjuntos
                por motivos de seguridad y confidencialidad.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;background-color:#f8fafb;border-top:1px solid #e8edf2;">
              <p style="margin:0;font-size:12px;line-height:1.5;color:#95a5a6;text-align:center;">
                Mensaje automático generado por el sistema ORAIT S.A.S. · Rescate Acuático y Salvamento
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export const sendCandidateNotification = async (
  data: CandidateNotificationData
): Promise<void> => {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    throw new Error('Credenciales SMTP no configuradas (SMTP_USER / SMTP_PASS)');
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  const fecha = formatDate(new Date());
  const notifyTo = process.env.NOTIFY_EMAIL || DEFAULT_NOTIFY_EMAIL;
  const fromAddress = process.env.SMTP_FROM || smtpUser;

  await transporter.sendMail({
    from: `"ORAIT S.A.S." <${fromAddress}>`,
    to: notifyTo,
    subject: `Nueva solicitud de candidato – ${data.nombre}`,
    text: buildPlainText(data, fecha),
    html: buildHtml(data, fecha),
  });
};
