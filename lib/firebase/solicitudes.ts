// Servicios para gestión de solicitudes de trabajo
import {
  collection,
  query,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  Timestamp,
  orderBy,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './config';
import { Solicitud, SolicitudFormData } from '@/lib/types';
import { SOLICITUD_DOCUMENT_FIELDS } from '@/lib/constants/solicitudDocuments';

const SOLICITUDES_COLLECTION = 'solicitudes';

// Subir un archivo a Storage y retornar la URL
const uploadFile = async (file: File, path: string): Promise<{ fileUrl: string; storagePath: string }> => {
  if (!storage) throw new Error('Firebase Storage no está inicializado');
  
  console.log('📤 Subiendo archivo:', {
    name: file.name,
    size: file.size,
    type: file.type,
    path
  });
  
  // Validar tamaño (máximo 10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error(`El archivo ${file.name} es demasiado grande. Máximo 10MB`);
  }
  
  const storageRef = ref(storage, path);
  
  // Metadata para asegurar el contentType correcto
  const metadata = {
    contentType: file.type || 'application/octet-stream',
    customMetadata: {
      originalName: file.name,
    },
  };
  
  try {
    await uploadBytes(storageRef, file, metadata);
    console.log('✅ Archivo subido exitosamente');
    const fileUrl = await getDownloadURL(storageRef);
    console.log('✅ URL obtenida:', fileUrl);
    return { fileUrl, storagePath: path };
  } catch (error: any) {
    console.error('❌ Error subiendo archivo:', error);
    console.error('Código:', error?.code);
    console.error('Mensaje:', error?.message);
    
    if (error?.code === 'storage/unauthorized') {
      throw new Error('No tienes permiso para subir este archivo. Verifica las reglas de Storage.');
    } else if (error?.code === 'storage/quota-exceeded') {
      throw new Error('Se ha excedido la cuota de almacenamiento.');
    }
    
    throw error;
  }
};

// Crear una nueva solicitud
export const createSolicitud = async (formData: SolicitudFormData): Promise<string> => {
  if (!db || !storage) throw new Error('Firebase no está inicializado');
  
  try {
    console.log('📤 Creando nueva solicitud:', formData.nombre);
    
    const timestamp = Date.now();
    const solicitudData: any = {
      nombre: formData.nombre,
      telefono: formData.telefono || null,
      createdAt: Timestamp.now(),
      status: 'pendiente',
    };

    // Subir archivos si existen
    for (const { key, storagePrefix } of SOLICITUD_DOCUMENT_FIELDS) {
      const file = formData[key];
      if (file) {
        const filePath = `solicitudes/${timestamp}/${storagePrefix}_${file.name}`;
        const uploaded = await uploadFile(file, filePath);
        solicitudData[key] = {
          fileName: file.name,
          fileUrl: uploaded.fileUrl,
          storagePath: uploaded.storagePath,
        };
      }
    }

    // Guardar en Firestore
    const docRef = await addDoc(collection(db, SOLICITUDES_COLLECTION), solicitudData);
    console.log('✅ Solicitud creada exitosamente:', docRef.id);
    
    return docRef.id;
  } catch (error: any) {
    console.error('❌ Error creando solicitud:', error);
    throw new Error(error.message || 'Error al crear la solicitud');
  }
};

// Obtener todas las solicitudes (para supervisores)
export const getAllSolicitudes = async (): Promise<Solicitud[]> => {
  if (!db) throw new Error('Firebase no está inicializado');
  
  try {
    let solicitudesQuery;
    try {
      solicitudesQuery = query(
        collection(db, SOLICITUDES_COLLECTION),
        orderBy('createdAt', 'desc')
      );
    } catch (error: any) {
      // Si falla por índice, obtener sin ordenar
      if (error?.code === 'failed-precondition') {
        solicitudesQuery = query(collection(db, SOLICITUDES_COLLECTION));
      } else {
        throw error;
      }
    }
    
    const querySnapshot = await getDocs(solicitudesQuery);
    const solicitudes: Solicitud[] = [];
    
    querySnapshot.docs.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      solicitudes.push({
        id: docSnapshot.id,
        nombre: data.nombre || '',
        telefono: data.telefono || undefined,
        hojaVida: data.hojaVida || undefined,
        certificacionSalvavidas: data.certificacionSalvavidas || undefined,
        certificacionPrimerosAuxilios: data.certificacionPrimerosAuxilios || undefined,
        certificacionEPS: data.certificacionEPS || undefined,
        fotocopiaCC: data.fotocopiaCC || undefined,
        rut: data.rut || undefined,
        certificadoAntecedentes: data.certificadoAntecedentes || undefined,
        certificadoBancario: data.certificadoBancario || undefined,
        createdAt: data.createdAt?.toDate() || new Date(),
        status: data.status || 'pendiente',
        motivoValidacion: data.motivoValidacion || undefined,
        validadoPor: data.validadoPor || undefined,
        validadoEn: data.validadoEn?.toDate() || undefined,
      });
    });
    
    // Si no se pudo ordenar con query, ordenar en memoria
    if (solicitudes.length > 0 && !solicitudesQuery) {
      solicitudes.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    
    return solicitudes;
  } catch (error) {
    console.error('Error obteniendo solicitudes:', error);
    throw error;
  }
};

// Validar una solicitud (aprobada o rechazada)
export const validarSolicitud = async (
  solicitudId: string,
  supervisorId: string,
  validada: boolean,
  motivo: string
): Promise<void> => {
  if (!db) throw new Error('Firebase no está inicializado');
  if (!motivo.trim()) {
    throw new Error('El motivo de validación es obligatorio');
  }
  
  try {
    const solicitudRef = doc(db, SOLICITUDES_COLLECTION, solicitudId);
    await updateDoc(solicitudRef, {
      status: validada ? 'aprobada' : 'rechazada',
      motivoValidacion: motivo.trim(),
      validadoPor: supervisorId,
      validadoEn: Timestamp.now(),
    });
    console.log('✅ Solicitud validada:', { solicitudId, validada, motivo });
  } catch (error) {
    console.error('Error validando solicitud:', error);
    throw error;
  }
};
