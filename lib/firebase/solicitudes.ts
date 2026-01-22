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
    if (formData.rut) {
      const rutPath = `solicitudes/${timestamp}/rut_${formData.rut.name}`;
      const rutData = await uploadFile(formData.rut, rutPath);
      solicitudData.rut = {
        fileName: formData.rut.name,
        fileUrl: rutData.fileUrl,
        storagePath: rutData.storagePath,
      };
    }

    if (formData.fotocopiaCC) {
      const ccPath = `solicitudes/${timestamp}/fotocopia_cc_${formData.fotocopiaCC.name}`;
      const ccData = await uploadFile(formData.fotocopiaCC, ccPath);
      solicitudData.fotocopiaCC = {
        fileName: formData.fotocopiaCC.name,
        fileUrl: ccData.fileUrl,
        storagePath: ccData.storagePath,
      };
    }

    if (formData.hojaVida) {
      const hvPath = `solicitudes/${timestamp}/hoja_vida_${formData.hojaVida.name}`;
      const hvData = await uploadFile(formData.hojaVida, hvPath);
      solicitudData.hojaVida = {
        fileName: formData.hojaVida.name,
        fileUrl: hvData.fileUrl,
        storagePath: hvData.storagePath,
      };
    }

    if (formData.certificacionSalvavidas) {
      const certSalvPath = `solicitudes/${timestamp}/certificacion_salvavidas_${formData.certificacionSalvavidas.name}`;
      const certSalvData = await uploadFile(formData.certificacionSalvavidas, certSalvPath);
      solicitudData.certificacionSalvavidas = {
        fileName: formData.certificacionSalvavidas.name,
        fileUrl: certSalvData.fileUrl,
        storagePath: certSalvData.storagePath,
      };
    }

    if (formData.certificacionEPS) {
      const certEPSPath = `solicitudes/${timestamp}/certificacion_eps_${formData.certificacionEPS.name}`;
      const certEPSData = await uploadFile(formData.certificacionEPS, certEPSPath);
      solicitudData.certificacionEPS = {
        fileName: formData.certificacionEPS.name,
        fileUrl: certEPSData.fileUrl,
        storagePath: certEPSData.storagePath,
      };
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
        rut: data.rut || undefined,
        fotocopiaCC: data.fotocopiaCC || undefined,
        hojaVida: data.hojaVida || undefined,
        certificacionSalvavidas: data.certificacionSalvavidas || undefined,
        certificacionEPS: data.certificacionEPS || undefined,
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
