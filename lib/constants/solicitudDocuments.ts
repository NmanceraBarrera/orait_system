export type SolicitudDocumentField =
  | 'hojaVida'
  | 'certificacionSalvavidas'
  | 'certificacionPrimerosAuxilios'
  | 'certificacionEPS'
  | 'fotocopiaCC'
  | 'rut'
  | 'certificadoAntecedentes'
  | 'certificadoBancario';

export const SOLICITUD_DOCUMENT_FIELDS: {
  key: SolicitudDocumentField;
  label: string;
  uploadLabel: string;
  accept: string;
  storagePrefix: string;
}[] = [
  {
    key: 'hojaVida',
    label: 'Hoja de vida actualizada',
    uploadLabel: 'Subir hoja de vida (PDF)',
    accept: '.pdf',
    storagePrefix: 'hoja_vida',
  },
  {
    key: 'certificacionSalvavidas',
    label: 'Certificado de salvavidas o de Operario de Rescate Acuático',
    uploadLabel: 'Subir certificado (PDF)',
    accept: '.pdf',
    storagePrefix: 'certificacion_salvavidas',
  },
  {
    key: 'certificacionPrimerosAuxilios',
    label: 'Certificado primeros Auxilios Básico',
    uploadLabel: 'Subir certificado (PDF)',
    accept: '.pdf',
    storagePrefix: 'certificacion_primeros_auxilios',
  },
  {
    key: 'certificacionEPS',
    label: 'Afiliación a EPS (régimen contributivo o subsidiado)',
    uploadLabel: 'Subir certificado EPS (PDF)',
    accept: '.pdf',
    storagePrefix: 'certificacion_eps',
  },
  {
    key: 'fotocopiaCC',
    label: 'Fotocopia de la cédula de ciudadanía',
    uploadLabel: 'Subir fotocopia CC (PDF)',
    accept: '.pdf',
    storagePrefix: 'fotocopia_cc',
  },
  {
    key: 'rut',
    label: 'Registro Único Tributario – RUT (persona natural)',
    uploadLabel: 'Subir RUT (PDF)',
    accept: '.pdf',
    storagePrefix: 'rut',
  },
  {
    key: 'certificadoAntecedentes',
    label: 'Certificado de antecedentes penales vigente',
    uploadLabel: 'Subir certificado (PDF)',
    accept: '.pdf',
    storagePrefix: 'certificado_antecedentes',
  },
  {
    key: 'certificadoBancario',
    label: 'Certificado bancario actualizado',
    uploadLabel: 'Subir certificado bancario (PDF)',
    accept: '.pdf',
    storagePrefix: 'certificado_bancario',
  },
];
