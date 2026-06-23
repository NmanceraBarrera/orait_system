// Tipos principales del sistema

export type UserRole = 'Rescatista' | 'Supervisor';

export type DocumentStatus = 'pending' | 'approved' | 'rejected';

export type DocumentType = 'cuenta_cobro' | 'incapacidad';

export interface User {
  uid: string;
  correo: string;
  nombre?: string;
  rol: UserRole;
  status?: string;
  telefono?: string;
  direccion?: string;
  eps?: string;
  certificado?: string;
  nota?: string;
  fcmToken?: string;
  fecha_creacion?: Date;
  createdAt?: Date;
}

export interface Document {
  id: string;
  userId: string;
  type: DocumentType;
  fileName: string;
  fileUrl: string;
  storagePath: string;
  status: DocumentStatus;
  rejectionReason: string | null;
  locked: boolean;
  createdAt: Date;
  updatedAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
}

export interface DocumentFormData {
  type: DocumentType;
  file: File;
}

export interface SolicitudFile {
  fileName: string;
  fileUrl: string;
  storagePath: string;
}

export interface Solicitud {
  id: string;
  nombre: string;
  telefono?: string;
  hojaVida?: SolicitudFile;
  certificacionSalvavidas?: SolicitudFile;
  certificacionPrimerosAuxilios?: SolicitudFile;
  certificacionEPS?: SolicitudFile;
  fotocopiaCC?: SolicitudFile;
  rut?: SolicitudFile;
  certificadoAntecedentes?: SolicitudFile;
  certificadoBancario?: SolicitudFile;
  createdAt: Date;
  status?: 'pendiente' | 'revisada' | 'aprobada' | 'rechazada';
  motivoValidacion?: string;
  validadoPor?: string;
  validadoEn?: Date;
}

export interface SolicitudFormData {
  nombre: string;
  telefono?: string;
  hojaVida?: File;
  certificacionSalvavidas?: File;
  certificacionPrimerosAuxilios?: File;
  certificacionEPS?: File;
  fotocopiaCC?: File;
  rut?: File;
  certificadoAntecedentes?: File;
  certificadoBancario?: File;
}
