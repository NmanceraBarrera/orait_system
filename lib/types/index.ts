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

export interface Solicitud {
  id: string;
  nombre: string;
  telefono?: string;
  rut?: {
    fileName: string;
    fileUrl: string;
    storagePath: string;
  };
  fotocopiaCC?: {
    fileName: string;
    fileUrl: string;
    storagePath: string;
  };
  hojaVida?: {
    fileName: string;
    fileUrl: string;
    storagePath: string;
  };
  certificacionSalvavidas?: {
    fileName: string;
    fileUrl: string;
    storagePath: string;
  };
  certificacionEPS?: {
    fileName: string;
    fileUrl: string;
    storagePath: string;
  };
  createdAt: Date;
  status?: 'pendiente' | 'revisada' | 'aprobada' | 'rechazada';
  motivoValidacion?: string;
  validadoPor?: string;
  validadoEn?: Date;
}

export interface SolicitudFormData {
  nombre: string;
  telefono?: string;
  rut?: File;
  fotocopiaCC?: File;
  hojaVida?: File;
  certificacionSalvavidas?: File;
  certificacionEPS?: File;
}
