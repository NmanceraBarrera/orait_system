// Servicios para gestión de documentos
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  orderBy,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './config';
import { Document, DocumentStatus, DocumentType, UserRole } from '@/lib/types';

const BILLING_ACCOUNTS_COLLECTION = 'billing_accounts';
const CUENTAS_SUBCOLLECTION = 'cuentas';
const INCAPACIDADES_SUBCOLLECTION = 'incapacidades';

// Función auxiliar para mapear datos de documento
const mapDocumentData = (
  docSnapshot: any,
  uid: string,
  type: DocumentType
): Document => {
  const data = docSnapshot.data();
  const estado = data.estado || data.status;
  const statusMap: Record<string, DocumentStatus> = {
    'Pendiente': 'pending',
    'Aprobado': 'approved',
    'Rechazado': 'rejected',
    'pending': 'pending',
    'approved': 'approved',
    'rejected': 'rejected',
  };

  const mappedStatus = (statusMap[estado] || 'pending') as DocumentStatus;
  
  // Log para depuración
  if (estado === 'Aprobado' || estado === 'approved') {
    console.log(`🔍 Mapeando documento aprobado: ${docSnapshot.id}, estado original: "${estado}", mapeado: "${mappedStatus}"`);
  }
  
  // Log específico para documentos rechazados
  if (estado === 'Rechazado' || estado === 'rejected') {
    console.log(`🔴 [mapDocumentData] Documento RECHAZADO: ${docSnapshot.id}, estado original: "${estado}", mapeado: "${mappedStatus}", motivo: ${data.rechazoMotivo || data.rejectionReason || 'sin motivo'}`);
  }

  return {
    id: docSnapshot.id,
    userId: data.userId || uid,
    type,
    fileName: data.pdfFileName || data.fileName || '',
    fileUrl: data.pdfUrl || data.fileUrl || '',
    storagePath: data.storagePath || data.pdfUrl || '',
    status: mappedStatus,
    rejectionReason: data.rechazoMotivo || data.rejectionReason || null,
    locked: estado === 'Aprobado' || data.status === 'approved' || data.locked || false,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.revisadoEn?.toDate() || data.updatedAt?.toDate() || new Date(),
    reviewedBy: data.revisadoPor || data.reviewedBy,
    reviewedAt: data.revisadoEn?.toDate() || data.reviewedAt?.toDate(),
  } as Document;
};

// Obtener documentos según el rol del usuario
export const getDocuments = async (
  userId: string,
  role: UserRole,
  type?: DocumentType,
  status?: DocumentStatus
): Promise<Document[]> => {
  if (!db) throw new Error('Firebase no está inicializado');
  const firestore = db; // Variable local para que TypeScript infiera el tipo correctamente
  try {
    const allDocuments: Document[] = [];

    // Rescatista solo ve sus propios documentos
    const userIdsToQuery = role === 'Rescatista' ? [userId] : [];

    // Si es supervisor, obtener todos los usuarios de billing_accounts
    if (role === 'Supervisor') {
      try {
        const billingAccountsSnapshot = await getDocs(collection(firestore, BILLING_ACCOUNTS_COLLECTION));
        const userIds = billingAccountsSnapshot.docs.map(doc => doc.id);
        console.log('📋 Usuarios encontrados en billing_accounts:', userIds.length, userIds);
        if (userIds.length === 0) {
          console.warn('⚠️ No se encontraron usuarios en billing_accounts');
        }
        userIdsToQuery.push(...userIds);
      } catch (error) {
        console.error('❌ Error obteniendo usuarios de billing_accounts:', error);
        throw error;
      }
    } else {
      userIdsToQuery.push(userId);
      console.log('📋 Rescatista - consultando solo su propio usuario:', userId);
    }

    console.log('🔍 Consultando documentos para usuarios:', userIdsToQuery);
    console.log('🔍 Filtros - tipo:', type, 'estado:', status);

    // Set para evitar duplicados (usando userId + id + type como clave única)
    const seenDocuments = new Set<string>();

    // Consultar subcolecciones para cada usuario
    for (const uid of userIdsToQuery) {
      console.log(`📂 Consultando documentos para usuario: ${uid}`);

      // Obtener cuentas de cobro
      if (!type || type === 'cuenta_cobro') {
        try {
          // Intentar obtener con orderBy, si falla obtener todos sin ordenar
          let cuentasSnapshot;
          try {
            let cuentasQuery = query(
              collection(firestore, BILLING_ACCOUNTS_COLLECTION, uid, CUENTAS_SUBCOLLECTION),
              orderBy('createdAt', 'desc')
            );
            cuentasSnapshot = await getDocs(cuentasQuery);
          } catch {
            // Si falla el orderBy, obtener todos sin ordenar
            cuentasSnapshot = await getDocs(
              collection(firestore, BILLING_ACCOUNTS_COLLECTION, uid, CUENTAS_SUBCOLLECTION)
            );
          }

          console.log(`✅ Encontradas ${cuentasSnapshot.docs.length} cuentas para usuario ${uid}`);
          
          cuentasSnapshot.docs.forEach((docSnapshot) => {
            const data = docSnapshot.data();
            const docUserId = data.userId || uid;
            
            // Usar la misma clave única en todo el proceso
            const uniqueKey = `${docUserId}_${docSnapshot.id}_cuenta_cobro`;
            
            // Verificar duplicados ANTES de procesar
            if (seenDocuments.has(uniqueKey)) {
              console.log(`⚠️ Documento duplicado ignorado (ya procesado): ${docSnapshot.id}`);
              return;
            }
            
            // Marcar como visto INMEDIATAMENTE para evitar procesarlo dos veces
            seenDocuments.add(uniqueKey);
            
            console.log(`📄 Datos del documento ${docSnapshot.id}:`, data);
            
            // Mapear campos de Firestore a la estructura del código
            const estado = data.estado || data.status;
            const statusMap: Record<string, DocumentStatus> = {
              'Pendiente': 'pending',
              'Aprobado': 'approved',
              'Rechazado': 'rejected',
              'pending': 'pending',
              'approved': 'approved',
              'rejected': 'rejected',
            };
            
            const mappedStatus = (statusMap[estado] || 'pending') as DocumentStatus;
            
            // Log específico para documentos rechazados
            if (estado === 'Rechazado' || estado === 'rejected') {
              console.log(`🔴 Documento RECHAZADO detectado:`, {
                id: docSnapshot.id,
                estadoOriginal: estado,
                estadoMapeado: mappedStatus,
                rechazoMotivo: data.rechazoMotivo || data.rejectionReason,
                filtroSolicitado: status
              });
            }
            
            const doc: Document = {
              id: docSnapshot.id,
              userId: docUserId,
              type: 'cuenta_cobro' as DocumentType,
              fileName: data.pdfFileName || data.fileName || '',
              fileUrl: data.pdfUrl || data.fileUrl || '',
              storagePath: data.storagePath || data.pdfUrl || '',
              status: mappedStatus,
              rejectionReason: data.rechazoMotivo || data.rejectionReason || null,
              locked: estado === 'Aprobado' || data.status === 'approved' || data.locked || false,
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.revisadoEn?.toDate() || data.updatedAt?.toDate() || new Date(),
              reviewedBy: data.revisadoPor || data.reviewedBy,
              reviewedAt: data.revisadoEn?.toDate() || data.reviewedAt?.toDate(),
            };
            
            console.log(`📝 Documento mapeado:`, {
              id: doc.id,
              userId: doc.userId,
              status: doc.status,
              fileName: doc.fileName,
              filtroStatus: status,
              pasaFiltro: !status || doc.status === status
            });
            
            // Filtrar por status si se especifica
            if (!status || doc.status === status) {
              allDocuments.push(doc);
              console.log(`✅ Documento agregado a la lista (total: ${allDocuments.length})`);
            } else {
              console.log(`❌ Documento filtrado por status: ${doc.status} !== ${status}`);
            }
          });
        } catch (error: any) {
          console.warn('Error obteniendo cuentas:', error);
          // Continuar con el siguiente usuario
        }
      }

      // Obtener incapacidades
      if (!type || type === 'incapacidad') {
        try {
          // Intentar obtener con orderBy, si falla obtener todos sin ordenar
          let incapacidadesSnapshot;
          try {
            let incapacidadesQuery = query(
              collection(firestore, BILLING_ACCOUNTS_COLLECTION, uid, INCAPACIDADES_SUBCOLLECTION),
              orderBy('createdAt', 'desc')
            );
            incapacidadesSnapshot = await getDocs(incapacidadesQuery);
          } catch {
            // Si falla el orderBy, obtener todos sin ordenar
            incapacidadesSnapshot = await getDocs(
              collection(firestore, BILLING_ACCOUNTS_COLLECTION, uid, INCAPACIDADES_SUBCOLLECTION)
            );
          }

          console.log(`✅ Encontradas ${incapacidadesSnapshot.docs.length} incapacidades para usuario ${uid}`);
          
          incapacidadesSnapshot.docs.forEach((docSnapshot) => {
            const data = docSnapshot.data();
            const docUserId = data.userId || uid;
            
            // Usar la misma clave única en todo el proceso
            const uniqueKey = `${docUserId}_${docSnapshot.id}_incapacidad`;
            
            // Verificar duplicados ANTES de procesar
            if (seenDocuments.has(uniqueKey)) {
              console.log(`⚠️ Documento duplicado ignorado (ya procesado): ${docSnapshot.id}`);
              return;
            }
            
            // Marcar como visto INMEDIATAMENTE para evitar procesarlo dos veces
            seenDocuments.add(uniqueKey);
            
            console.log(`📄 Datos del documento ${docSnapshot.id}:`, data);
            
            // Mapear campos de Firestore a la estructura del código
            const estado = data.estado || data.status;
            const statusMap: Record<string, DocumentStatus> = {
              'Pendiente': 'pending',
              'Aprobado': 'approved',
              'Rechazado': 'rejected',
              'pending': 'pending',
              'approved': 'approved',
              'rejected': 'rejected',
            };
            
            const mappedStatus = (statusMap[estado] || 'pending') as DocumentStatus;
            
            // Log específico para documentos rechazados
            if (estado === 'Rechazado' || estado === 'rejected') {
              console.log(`🔴 Documento RECHAZADO detectado:`, {
                id: docSnapshot.id,
                estadoOriginal: estado,
                estadoMapeado: mappedStatus,
                rechazoMotivo: data.rechazoMotivo || data.rejectionReason,
                filtroSolicitado: status
              });
            }
            
            const doc: Document = {
              id: docSnapshot.id,
              userId: docUserId,
              type: 'incapacidad' as DocumentType,
              fileName: data.pdfFileName || data.fileName || '',
              fileUrl: data.pdfUrl || data.fileUrl || '',
              storagePath: data.storagePath || data.pdfUrl || '',
              status: mappedStatus,
              rejectionReason: data.rechazoMotivo || data.rejectionReason || null,
              locked: estado === 'Aprobado' || data.status === 'approved' || data.locked || false,
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.revisadoEn?.toDate() || data.updatedAt?.toDate() || new Date(),
              reviewedBy: data.revisadoPor || data.reviewedBy,
              reviewedAt: data.revisadoEn?.toDate() || data.reviewedAt?.toDate(),
            };
            
            console.log(`📝 Documento mapeado:`, {
              id: doc.id,
              userId: doc.userId,
              status: doc.status,
              fileName: doc.fileName,
              filtroStatus: status,
              pasaFiltro: !status || doc.status === status
            });
            
            // Filtrar por status si se especifica
            if (!status || doc.status === status) {
              allDocuments.push(doc);
              console.log(`✅ Documento agregado a la lista (total: ${allDocuments.length})`);
            } else {
              console.log(`❌ Documento filtrado por status: ${doc.status} !== ${status}`);
            }
          });
        } catch (error: any) {
          console.warn('Error obteniendo incapacidades:', error);
          // Continuar con el siguiente usuario
        }
      }
    }

    // Ordenar todos los documentos por fecha (descendente)
    allDocuments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    console.log(`📊 Total de documentos encontrados: ${allDocuments.length}`);
    console.log('📋 Documentos finales:', allDocuments.map(d => ({
      id: d.id,
      userId: d.userId,
      type: d.type,
      status: d.status,
      fileName: d.fileName
    })));

    return allDocuments;
  } catch (error) {
    console.error('Error obteniendo documentos:', error);
    throw error;
  }
};

// Obtener solo documentos pendientes (optimizado para supervisor - consultas en paralelo)
export const getPendingDocuments = async (): Promise<Document[]> => {
  if (!db) throw new Error('Firebase no está inicializado');
  const firestore = db; // Variable local para que TypeScript infiera el tipo correctamente
  try {
    const allDocuments: Document[] = [];
    const seenDocuments = new Set<string>();
    
    // Obtener todos los rescatistas de la colección usuarios
    let userIds: string[] = [];
    try {
      const rescatistasQuery = query(
        collection(firestore, 'usuarios'),
        where('rol', '==', 'Rescatista')
      );
      const rescatistasSnapshot = await getDocs(rescatistasQuery);
      userIds = rescatistasSnapshot.docs.map(doc => {
        const data = doc.data();
        return data.uid || doc.id;
      });
    } catch (error: any) {
      // Si falla por índice, obtener todos y filtrar
      if (error?.code === 'failed-precondition') {
        const allUsers = await getDocs(collection(firestore, 'usuarios'));
        userIds = allUsers.docs
          .filter(doc => {
            const data = doc.data();
            return data.rol === 'Rescatista';
          })
          .map(doc => {
            const data = doc.data();
            return data.uid || doc.id;
          });
      } else {
        throw error;
      }
    }
    
    // También intentar obtener usuarios de billing_accounts como fallback
    try {
      const billingAccountsSnapshot = await getDocs(collection(firestore, BILLING_ACCOUNTS_COLLECTION));
      const billingUserIds = billingAccountsSnapshot.docs.map(doc => doc.id);
      billingUserIds.forEach(uid => {
        if (!userIds.includes(uid)) {
          userIds.push(uid);
        }
      });
    } catch (error) {
      // Ignorar error silenciosamente
    }

    // Ejecutar todas las consultas en paralelo
    const promises = userIds.map(async (uid) => {
      const userDocuments: Document[] = [];
      
      // Obtener cuentas pendientes
      try {
        let cuentasSnapshot;
        try {
          const cuentasQuery = query(
            collection(firestore, BILLING_ACCOUNTS_COLLECTION, uid, CUENTAS_SUBCOLLECTION),
            where('estado', '==', 'Pendiente')
          );
          cuentasSnapshot = await getDocs(cuentasQuery);
        } catch (queryError: any) {
          if (queryError?.code === 'failed-precondition') {
            // Si falla por índice, obtener todos y filtrar
            const allCuentas = await getDocs(
              collection(firestore, BILLING_ACCOUNTS_COLLECTION, uid, CUENTAS_SUBCOLLECTION)
            );
            cuentasSnapshot = allCuentas;
          } else {
            throw queryError;
          }
        }
        
        cuentasSnapshot.docs.forEach((docSnapshot) => {
          const uniqueKey = `${uid}_${docSnapshot.id}_cuenta_cobro`;
          if (!seenDocuments.has(uniqueKey)) {
            const doc = mapDocumentData(docSnapshot, uid, 'cuenta_cobro');
            if (doc.status === 'pending') {
              userDocuments.push(doc);
              seenDocuments.add(uniqueKey);
            }
          }
        });
      } catch (error) {
        // Continuar con el siguiente usuario
      }

      // Obtener incapacidades pendientes
      try {
        let incapacidadesSnapshot;
        try {
          const incapacidadesQuery = query(
            collection(firestore, BILLING_ACCOUNTS_COLLECTION, uid, INCAPACIDADES_SUBCOLLECTION),
            where('estado', '==', 'Pendiente')
          );
          incapacidadesSnapshot = await getDocs(incapacidadesQuery);
        } catch (queryError: any) {
          if (queryError?.code === 'failed-precondition') {
            // Si falla por índice, obtener todos y filtrar
            const allIncapacidades = await getDocs(
              collection(firestore, BILLING_ACCOUNTS_COLLECTION, uid, INCAPACIDADES_SUBCOLLECTION)
            );
            incapacidadesSnapshot = allIncapacidades;
          } else {
            throw queryError;
          }
        }
        
        incapacidadesSnapshot.docs.forEach((docSnapshot) => {
          const uniqueKey = `${uid}_${docSnapshot.id}_incapacidad`;
          if (!seenDocuments.has(uniqueKey)) {
            const doc = mapDocumentData(docSnapshot, uid, 'incapacidad');
            if (doc.status === 'pending') {
              userDocuments.push(doc);
              seenDocuments.add(uniqueKey);
            }
          }
        });
      } catch (error) {
        // Continuar con el siguiente usuario
      }
      
      return userDocuments;
    });

    // Esperar a que todas las consultas terminen
    const results = await Promise.all(promises);
    
    // Combinar todos los documentos
    results.forEach(userDocs => {
      allDocuments.push(...userDocs);
    });

    // Ordenar por fecha (más recientes primero)
    allDocuments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return allDocuments;
  } catch (error) {
    console.error('Error obteniendo documentos pendientes:', error);
    throw error;
  }
};

// Obtener documentos de un usuario específico (histórico - todos los estados)
export const getUserDocuments = async (
  userId: string,
  type?: DocumentType
): Promise<Document[]> => {
  if (!db) throw new Error('Firebase no está inicializado');
  const firestore = db; // Variable local para que TypeScript infiera el tipo correctamente
  try {
    const allDocuments: Document[] = [];
    const seenDocuments = new Set<string>();

    console.log(`🔍 Obteniendo histórico de documentos para usuario: ${userId}`);

    // Obtener cuentas de cobro
    if (!type || type === 'cuenta_cobro') {
      try {
        let cuentasSnapshot;
        try {
          const cuentasQuery = query(
            collection(firestore, BILLING_ACCOUNTS_COLLECTION, userId, CUENTAS_SUBCOLLECTION),
            orderBy('createdAt', 'desc')
          );
          cuentasSnapshot = await getDocs(cuentasQuery);
        } catch (error: any) {
          if (error?.code === 'failed-precondition') {
            cuentasSnapshot = await getDocs(
              collection(firestore, BILLING_ACCOUNTS_COLLECTION, userId, CUENTAS_SUBCOLLECTION)
            );
          } else {
            throw error;
          }
        }
        
        console.log(`✅ Encontradas ${cuentasSnapshot.docs.length} cuentas para usuario ${userId}`);
        cuentasSnapshot.docs.forEach((docSnapshot) => {
          const doc = mapDocumentData(docSnapshot, userId, 'cuenta_cobro');
          const uniqueKey = `${userId}_${doc.id}_cuenta_cobro`;
          // Incluir TODOS los estados: pending, approved, rejected
          if (!seenDocuments.has(uniqueKey)) {
            allDocuments.push(doc);
            seenDocuments.add(uniqueKey);
            console.log(`✅ Documento agregado al histórico: ${doc.id} - ${doc.status}`);
          }
        });
      } catch (error: any) {
        console.warn(`Error obteniendo cuentas para usuario ${userId}:`, error);
      }
    }

    // Obtener incapacidades
    if (!type || type === 'incapacidad') {
      try {
        let incapacidadesSnapshot;
        try {
          const incapacidadesQuery = query(
            collection(firestore, BILLING_ACCOUNTS_COLLECTION, userId, INCAPACIDADES_SUBCOLLECTION),
            orderBy('createdAt', 'desc')
          );
          incapacidadesSnapshot = await getDocs(incapacidadesQuery);
        } catch (error: any) {
          if (error?.code === 'failed-precondition') {
            incapacidadesSnapshot = await getDocs(
              collection(firestore, BILLING_ACCOUNTS_COLLECTION, userId, INCAPACIDADES_SUBCOLLECTION)
            );
          } else {
            throw error;
          }
        }
        
        console.log(`✅ Encontradas ${incapacidadesSnapshot.docs.length} incapacidades para usuario ${userId}`);
        incapacidadesSnapshot.docs.forEach((docSnapshot) => {
          const doc = mapDocumentData(docSnapshot, userId, 'incapacidad');
          const uniqueKey = `${userId}_${doc.id}_incapacidad`;
          // Incluir TODOS los estados: pending, approved, rejected
          if (!seenDocuments.has(uniqueKey)) {
            allDocuments.push(doc);
            seenDocuments.add(uniqueKey);
            console.log(`✅ Documento agregado al histórico: ${doc.id} - ${doc.status}`);
          }
        });
      } catch (error: any) {
        console.warn(`Error obteniendo incapacidades para usuario ${userId}:`, error);
      }
    }

    console.log(`📊 Total de documentos en histórico: ${allDocuments.length}`);
    console.log(`📋 Estados encontrados:`, {
      pending: allDocuments.filter(d => d.status === 'pending').length,
      approved: allDocuments.filter(d => d.status === 'approved').length,
      rejected: allDocuments.filter(d => d.status === 'rejected').length
    });

    // Ordenar por fecha (más recientes primero)
    allDocuments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return allDocuments;
  } catch (error) {
    console.error('Error obteniendo documentos del usuario:', error);
    throw error;
  }
};

// Obtener conteo de documentos por usuario (para badges)
export const getUserDocumentCount = async (userId: string): Promise<{
  approved: number;
  pending: number;
}> => {
  if (!db) throw new Error('Firebase no está inicializado');
  const firestore = db; // Variable local para que TypeScript infiera el tipo correctamente
  try {
    let approved = 0;
    let pending = 0;

    // Contar cuentas de cobro
    try {
      const cuentasSnapshot = await getDocs(
        collection(firestore, BILLING_ACCOUNTS_COLLECTION, userId, CUENTAS_SUBCOLLECTION)
      );
      cuentasSnapshot.docs.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        const estado = data.estado || data.status;
        if (estado === 'Aprobado' || estado === 'approved') {
          approved++;
        } else if (estado === 'Pendiente' || estado === 'pending') {
          pending++;
        }
      });
    } catch (error) {
      console.warn('Error contando cuentas:', error);
    }

    // Contar incapacidades
    try {
      const incapacidadesSnapshot = await getDocs(
        collection(firestore, BILLING_ACCOUNTS_COLLECTION, userId, INCAPACIDADES_SUBCOLLECTION)
      );
      incapacidadesSnapshot.docs.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        const estado = data.estado || data.status;
        if (estado === 'Aprobado' || estado === 'approved') {
          approved++;
        } else if (estado === 'Pendiente' || estado === 'pending') {
          pending++;
        }
      });
    } catch (error) {
      console.warn('Error contando incapacidades:', error);
    }

    return { approved, pending };
  } catch (error) {
    console.error('Error obteniendo conteo de documentos:', error);
    return { approved: 0, pending: 0 };
  }
};

// Subir un nuevo documento
export const uploadDocument = async (
  userId: string,
  type: DocumentType,
  file: File
): Promise<Document> => {
  if (!storage || !db) throw new Error('Firebase no está inicializado');
  const firestore = db; // Variable local para que TypeScript infiera el tipo correctamente
  try {
    console.log('📤 Iniciando subida de documento:', {
      userId,
      type,
      fileName: file.name,
      fileSize: file.size
    });

    // Validar tamaño del archivo (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('El archivo es demasiado grande. Máximo 10MB');
    }

    // Subir archivo a Storage
    const timestamp = Date.now();
    const fileName = `${type}_${userId}_${timestamp}_${file.name}`;
    const storagePath = `billing_accounts/${userId}/${type}/${fileName}`;
    const storageRef = ref(storage, storagePath);

    console.log('📤 Subiendo archivo a Storage:', storagePath);
    await uploadBytes(storageRef, file);
    console.log('✅ Archivo subido a Storage exitosamente');
    
    const fileUrl = await getDownloadURL(storageRef);
    console.log('✅ URL de descarga obtenida:', fileUrl);

    // Determinar la subcolección según el tipo
    const subcollection = type === 'cuenta_cobro' ? CUENTAS_SUBCOLLECTION : INCAPACIDADES_SUBCOLLECTION;
    console.log('📝 Creando documento en subcolección:', subcollection);

    // Crear documento en la subcolección correspondiente
    // Usar los nombres de campos que están en Firestore
    const docData = {
      pdfFileName: file.name,
      pdfUrl: fileUrl,
      estado: 'Pendiente',
      rechazoMotivo: null,
      userId: userId, // Agregar userId al documento
      createdAt: Timestamp.now(),
      // También guardar en formato inglés para compatibilidad
      fileName: file.name,
      fileUrl,
      storagePath,
      status: 'pending',
      rejectionReason: null,
      locked: false,
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(
      collection(firestore, BILLING_ACCOUNTS_COLLECTION, userId, subcollection),
      docData
    );

    console.log('✅ Documento creado en Firestore:', docRef.id);

    return {
      id: docRef.id,
      userId,
      type,
      ...docData,
      createdAt: docData.createdAt.toDate(),
      updatedAt: docData.updatedAt.toDate(),
    } as Document;
  } catch (error: any) {
    console.error('❌ Error subiendo documento:', error);
    console.error('Código del error:', error?.code);
    console.error('Mensaje del error:', error?.message);
    
    // Proporcionar mensajes de error más descriptivos
    if (error?.code === 'storage/unauthorized') {
      throw new Error('No tienes permiso para subir archivos. Verifica las reglas de Storage.');
    } else if (error?.code === 'storage/quota-exceeded') {
      throw new Error('Se ha excedido la cuota de almacenamiento.');
    } else if (error?.code === 'permission-denied') {
      throw new Error('No tienes permiso para crear documentos. Verifica las reglas de Firestore.');
    }
    
    throw error;
  }
};

// Aprobar documento (solo supervisor)
export const approveDocument = async (
  document: Document,
  supervisorId: string
): Promise<void> => {
  if (!db) throw new Error('Firebase no está inicializado');
  const firestore = db; // Variable local para que TypeScript infiera el tipo correctamente
  try {
    const subcollection = document.type === 'cuenta_cobro' ? CUENTAS_SUBCOLLECTION : INCAPACIDADES_SUBCOLLECTION;
    const docRef = doc(
      db,
      BILLING_ACCOUNTS_COLLECTION,
      document.userId,
      subcollection,
      document.id
    );
    await updateDoc(docRef, {
      // Actualizar en formato español (el que usa Firestore)
      estado: 'Aprobado',
      revisadoPor: supervisorId,
      revisadoEn: Timestamp.now(),
      // También actualizar en formato inglés para compatibilidad
      status: 'approved',
      locked: true,
      reviewedBy: supervisorId,
      reviewedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error aprobando documento:', error);
    throw error;
  }
};

// Rechazar documento (solo supervisor) - Las rechazadas se guardan con motivo
export const rejectDocument = async (
  document: Document,
  supervisorId: string,
  rejectionReason: string
): Promise<void> => {
  if (!rejectionReason.trim()) {
    throw new Error('El motivo de rechazo es obligatorio');
  }
  if (!db) throw new Error('Firebase no está inicializado');
  const firestore = db; // Variable local para que TypeScript infiera el tipo correctamente
  try {
    const subcollection = document.type === 'cuenta_cobro' ? CUENTAS_SUBCOLLECTION : INCAPACIDADES_SUBCOLLECTION;
    const docRef = doc(
      db,
      BILLING_ACCOUNTS_COLLECTION,
      document.userId,
      subcollection,
      document.id
    );
    
    // Actualizar el documento con estado rechazado y motivo
    // NO eliminamos el archivo ni el documento - se mantiene para que el rescatista vea el motivo
    await updateDoc(docRef, {
      // Actualizar en formato español (el que usa Firestore)
      estado: 'Rechazado',
      rechazoMotivo: rejectionReason.trim(),
      revisadoPor: supervisorId,
      revisadoEn: Timestamp.now(),
      // También actualizar en formato inglés para compatibilidad
      status: 'rejected',
      rejectionReason: rejectionReason.trim(),
      locked: false, // Permite que el rescatista pueda eliminar y subir uno nuevo
      reviewedBy: supervisorId,
      reviewedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error rechazando documento:', error);
    throw error;
  }
};

// Eliminar documento (solo rescatista, solo si está rechazado)
export const deleteDocument = async (document: Document): Promise<void> => {
  if (document.locked) {
    throw new Error('No se puede eliminar un documento aprobado');
  }

  if (document.status !== 'rejected') {
    throw new Error('Solo se pueden eliminar documentos rechazados');
  }
  if (!storage || !db) throw new Error('Firebase no está inicializado');
  const firestore = db; // Variable local para que TypeScript infiera el tipo correctamente
  try {
    // Eliminar de Storage
    const storageRef = ref(storage, document.storagePath);
    await deleteObject(storageRef);

    // Determinar la subcolección según el tipo
    const subcollection = document.type === 'cuenta_cobro' ? CUENTAS_SUBCOLLECTION : INCAPACIDADES_SUBCOLLECTION;

    // Eliminar de Firestore (de la subcolección correspondiente)
    await deleteDoc(
      doc(firestore, BILLING_ACCOUNTS_COLLECTION, document.userId, subcollection, document.id)
    );
  } catch (error) {
    console.error('Error eliminando documento:', error);
    throw error;
  }
};
