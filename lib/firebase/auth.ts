// Servicios de autenticación
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { auth, db } from './config';
import { User, UserRole } from '@/lib/types';

export const signIn = async (email: string, password: string) => {
  if (!auth) throw new Error('Firebase no está inicializado');
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const signOut = async () => {
  if (!auth) throw new Error('Firebase no está inicializado');
  await firebaseSignOut(auth);
};

export const getUserRole = async (uid: string): Promise<UserRole | null> => {
  if (!db) {
    console.error('❌ Firebase db no está inicializado');
    throw new Error('Firebase no está inicializado');
  }
  
  try {
    console.log('🔍 Buscando rol para UID:', uid);
    
    let userDoc: any = null;
    
    // Método 1: Intentar buscar por campo uid usando query
    try {
      console.log('📋 Método 1: Búsqueda por campo uid (query)...');
      const usersQuery = query(collection(db, 'usuarios'), where('uid', '==', uid));
      const querySnapshot = await getDocs(usersQuery);
      
      console.log('✅ Query ejecutada. Resultados:', querySnapshot.size, 'documentos encontrados');
      
      if (!querySnapshot.empty) {
        userDoc = querySnapshot.docs[0];
        const data = userDoc.data();
        console.log('✅ Documento encontrado por campo uid:', { id: userDoc.id, uid: data.uid, rol: data.rol });
      } else {
        console.log('⚠️ No se encontraron documentos por campo uid');
      }
    } catch (queryError: any) {
      console.error('❌ Error en query por campo uid:', queryError);
      console.error('Código del error:', queryError?.code);
      console.error('Mensaje:', queryError?.message);
      
      if (queryError?.code === 'failed-precondition') {
        console.error('⚠️ Se requiere un índice. Usando método alternativo...');
      }
    }
    
    // Método 2: Buscar todos los documentos y filtrar (no requiere índice)
    if (!userDoc) {
      try {
        console.log('📋 Método 2: Búsqueda alternativa (todos los documentos)...');
        const allUsersQuery = query(collection(db, 'usuarios'));
        const allDocs = await getDocs(allUsersQuery);
        console.log('📊 Total de documentos en colección users:', allDocs.size);
        
        if (allDocs.size > 0) {
          const foundDoc = allDocs.docs.find(doc => {
            const data = doc.data();
            return data.uid === uid;
          });
          
          if (foundDoc) {
            userDoc = foundDoc;
            const data = foundDoc.data();
            console.log('✅ Documento encontrado en búsqueda alternativa:', { id: foundDoc.id, uid: data.uid, rol: data.rol });
          } else {
            console.log('⚠️ No se encontró documento con uid:', uid);
            console.log('📋 Primeros 3 documentos (para debug):');
            allDocs.docs.slice(0, 3).forEach((doc, index) => {
              const data = doc.data();
              console.log(`  ${index + 1}. ID: ${doc.id}, uid: ${data.uid || 'NO TIENE'}, rol: ${data.rol || 'NO TIENE'}`);
            });
          }
        }
      } catch (allError: any) {
        console.error('❌ Error en búsqueda alternativa:', allError);
      }
    }
    
    // Método 3: Buscar por ID del documento
    if (!userDoc) {
      try {
        console.log('📋 Método 3: Búsqueda por ID del documento...');
        const docById = await getDoc(doc(db, 'usuarios', uid));
        if (docById.exists()) {
          userDoc = docById;
          const data = docById.data();
          console.log('✅ Documento encontrado por ID:', { id: docById.id, uid: data.uid, rol: data.rol });
        }
      } catch (idError: any) {
        console.error('❌ Error buscando por ID:', idError);
      }
    }
    
    if (userDoc) {
      const data = userDoc.data();
      const rol = data.rol as UserRole;
      
      if (!rol) {
        console.error('❌ El documento existe pero no tiene el campo "rol"', data);
        return null;
      }
      
      return rol;
    }
    
    console.error(`❌ No se encontró documento para el UID: ${uid}`);
    return null;
  } catch (error: any) {
    console.error('❌ Error obteniendo rol del usuario:', error);
    return null;
  }
};

export const getUserData = async (firebaseUser: FirebaseUser): Promise<User | null> => {
  if (!db) {
    console.error('❌ Firebase db no está inicializado');
    throw new Error('Firebase no está inicializado');
  }
  
  try {
    const uid = firebaseUser.uid;
    console.log('🔍 [getUserData] Buscando datos del usuario con UID:', uid);
    console.log('🔍 [getUserData] Firebase db inicializado:', !!db);
    
    let userDoc: any = null;
    
    // Método 1: Intentar buscar por campo uid usando query
    try {
      console.log('📋 Método 1: Búsqueda por campo uid (query)...');
      const usersQuery = query(collection(db, 'usuarios'), where('uid', '==', uid));
      const querySnapshot = await getDocs(usersQuery);
      
      console.log('✅ Query ejecutada. Resultados:', querySnapshot.size, 'documentos encontrados');
      
      if (!querySnapshot.empty) {
        userDoc = querySnapshot.docs[0];
        console.log('✅ Documento encontrado por campo uid:', userDoc.id);
      } else {
        console.log('⚠️ No se encontraron documentos por campo uid');
      }
    } catch (queryError: any) {
      console.error('❌ Error en query por campo uid:', queryError);
      console.error('Código del error:', queryError?.code);
      console.error('Mensaje:', queryError?.message);
      
      if (queryError?.code === 'failed-precondition') {
        console.error('⚠️ Se requiere un índice. Ve a Firebase Console > Firestore > Indexes');
        console.error('Crea un índice para: Colección "usuarios", Campo "uid" (Ascending)');
        console.error('O usa el método alternativo que se ejecutará a continuación...');
      }
      
      if (queryError?.code === 'permission-denied') {
        console.error('⚠️ Permiso denegado. Verifica las reglas de seguridad de Firestore');
      }
    }
    
    // Método 2: Si no se encontró por query, buscar todos los documentos y filtrar
    // Este método funciona sin necesidad de índice
    if (!userDoc) {
      try {
        console.log('📋 Método 2: Búsqueda alternativa (todos los documentos)...');
        const allUsersQuery = query(collection(db, 'usuarios'));
        const allDocs = await getDocs(allUsersQuery);
        console.log('📊 Total de documentos en colección users:', allDocs.size);
        
        if (allDocs.size > 0) {
          console.log('🔍 Buscando documento con uid:', uid);
          
          const foundDoc = allDocs.docs.find(doc => {
            const data = doc.data();
            const docUid = data.uid;
            const matches = docUid === uid;
            
            if (matches) {
              console.log('✅ Documento encontrado:', {
                id: doc.id,
                uid: docUid,
                rol: data.rol,
                correo: data.correo
              });
            }
            
            return matches;
          });
          
          if (foundDoc) {
            userDoc = foundDoc;
            console.log('✅ Documento encontrado en búsqueda alternativa');
          } else {
            console.log('⚠️ No se encontró documento con uid:', uid);
            console.log('📋 Primeros 3 documentos encontrados (para debug):');
            allDocs.docs.slice(0, 3).forEach((doc, index) => {
              const data = doc.data();
              console.log(`  ${index + 1}. ID: ${doc.id}, uid: ${data.uid}, rol: ${data.rol}`);
            });
          }
        } else {
          console.log('⚠️ La colección users está vacía');
        }
      } catch (allError: any) {
        console.error('❌ Error en búsqueda alternativa:', allError);
        console.error('Código:', allError?.code);
        console.error('Mensaje:', allError?.message);
        if (allError?.code === 'permission-denied') {
          console.error('⚠️ No se puede leer toda la colección. Verifica las reglas de seguridad.');
        }
      }
    }
    
    // Método 3: Intentar buscar por ID del documento (fallback final)
    if (!userDoc) {
      try {
        console.log('📋 Método 3: Búsqueda por ID del documento (fallback)...');
        const docById = await getDoc(doc(db, 'usuarios', uid));
        if (docById.exists()) {
          userDoc = docById;
          console.log('✅ Documento encontrado por ID:', docById.id);
        } else {
          console.log('⚠️ No se encontró documento por ID');
        }
      } catch (idError: any) {
        console.error('❌ Error buscando por ID:', idError);
      }
    }
    
    if (userDoc && userDoc.exists()) {
      const data = userDoc.data();
      console.log('Datos del documento encontrado:', { id: userDoc.id, uid: data.uid, rol: data.rol, correo: data.correo });
      
      if (!data.rol) {
        console.error('El documento existe pero no tiene el campo "rol"', data);
        return null;
      }
      
      return {
        uid: data.uid || firebaseUser.uid,
        correo: data.correo || firebaseUser.email || '',
        nombre: data.nombre || firebaseUser.displayName,
        rol: data.rol as UserRole,
        status: data.status,
        telefono: data.telefono,
        direccion: data.direccion,
        eps: data.eps,
        certificado: data.certificado,
        nota: data.nota,
        fcmToken: data.fcmToken,
        fecha_creacion: data.fecha_creacion?.toDate(),
        createdAt: data.createdAt?.toDate() || data.fecha_creacion?.toDate(),
      };
    }
    
    console.error(`No se encontró documento para el UID: ${uid}`);
    console.error('Verifica que:');
    console.error('1. El documento exista en la colección "usuarios"');
    console.error('2. El documento tenga el campo "uid" con el valor:', uid);
    console.error('3. El documento tenga el campo "rol" con valor "Rescatista" o "Supervisor"');
    console.error('4. Las reglas de seguridad de Firestore permitan la lectura');
    console.error('5. Exista un índice compuesto para la query por campo "uid"');
    return null;
  } catch (error: any) {
    console.error('Error obteniendo datos del usuario:', error);
    console.error('Código del error:', error?.code);
    console.error('Mensaje del error:', error?.message);
    
    if (error?.code === 'permission-denied') {
      console.error('ERROR: Permiso denegado. Verifica las reglas de seguridad de Firestore.');
    }
    
    if (error?.code === 'failed-precondition') {
      console.error('ERROR: Se requiere un índice. Ve a Firebase Console > Firestore > Indexes y crea un índice para:');
      console.error('  - Colección: users');
      console.error('  - Campo: uid (Ascending)');
    }
    
    return null;
  }
};

// Obtener el status del usuario desde la colección recursos
export const getUserStatusFromRecursos = async (uid: string): Promise<string | null> => {
  if (!db) throw new Error('Firebase no está inicializado');
  try {
    console.log('🔍 Buscando status en colección recursos para UID:', uid);
    
    // Método 1: Buscar por campo uid usando query
    try {
      console.log('📋 Método 1: Búsqueda por campo uid en recursos...');
      const recursosQuery = query(collection(db, 'recursos'), where('uid', '==', uid));
      const querySnapshot = await getDocs(recursosQuery);
      
      console.log('✅ Query ejecutada en recursos. Resultados:', querySnapshot.size, 'documentos encontrados');
      
      if (!querySnapshot.empty) {
        const data = querySnapshot.docs[0].data();
        const status = data.status || data.estado || null;
        console.log('✅ Status encontrado en recursos:', status);
        return status;
      } else {
        console.warn('⚠️ No se encontró documento en recursos con uid:', uid);
      }
    } catch (queryError: any) {
      console.error('❌ Error en query de recursos por campo uid:', queryError);
      console.error('Código del error:', queryError?.code);
      console.error('Mensaje:', queryError?.message);
      
      if (queryError?.code === 'failed-precondition') {
        console.warn('⚠️ Query requiere índice. Usando método alternativo...');
      }
    }
    
    // Método 2: Si falla la query, obtener todos los documentos y filtrar
    try {
      console.log('📋 Método 2: Búsqueda alternativa (todos los documentos de recursos)...');
      const allRecursos = await getDocs(collection(db, 'recursos'));
      console.log('📊 Total de documentos en colección recursos:', allRecursos.size);
      
      if (allRecursos.size > 0) {
        const foundDoc = allRecursos.docs.find(doc => {
          const data = doc.data();
          return data.uid === uid;
        });
        
        if (foundDoc) {
          const data = foundDoc.data();
          const status = data.status || data.estado || null;
          console.log('✅ Status encontrado en recursos (método alternativo):', status);
          return status;
        } else {
          console.warn('⚠️ No se encontró documento en recursos con uid:', uid);
        }
      }
    } catch (allError: any) {
      console.error('❌ Error en búsqueda alternativa de recursos:', allError);
    }
    
    console.warn('⚠️ No se encontró status en recursos para UID:', uid);
    return null;
  } catch (error) {
    console.error('Error obteniendo status de recursos:', error);
    return null;
  }
};

// Obtener todos los rescatistas
export const getAllRescatistas = async () => {
  if (!db) throw new Error('Firebase no está inicializado');
  try {
    // Intentar query por rol
    try {
      const q = query(
        collection(db, 'usuarios'),
        where('rol', '==', 'Rescatista')
      );
      const querySnapshot = await getDocs(q);
      const rescatistas = querySnapshot.docs.map((docSnapshot) => {
        const data = docSnapshot.data();
        return {
          uid: data.uid || docSnapshot.id,
          correo: data.correo || '',
          nombre: data.nombre || '',
          rol: data.rol as 'Rescatista',
          status: data.status || '',
          telefono: data.telefono || '',
          direccion: data.direccion || '',
          eps: data.eps || '',
          certificado: data.certificado || '',
          nota: data.nota || '',
          cedula: data.cedula || '',
        };
      });
      return rescatistas;
    } catch (error: any) {
      // Si falla por índice, obtener todos y filtrar
      if (error?.code === 'failed-precondition') {
        console.warn('⚠️ Query requiere índice. Usando método alternativo...');
        const allUsers = await getDocs(collection(db, 'usuarios'));
        const rescatistas = allUsers.docs
          .map((docSnapshot) => {
            const data = docSnapshot.data();
            return {
              uid: data.uid || docSnapshot.id,
              correo: data.correo || '',
              nombre: data.nombre || '',
              rol: data.rol as 'Rescatista',
              status: data.status || '',
              telefono: data.telefono || '',
              direccion: data.direccion || '',
              eps: data.eps || '',
              certificado: data.certificado || '',
              nota: data.nota || '',
              cedula: data.cedula || '',
            };
          })
          .filter((user) => user.rol === 'Rescatista');
        return rescatistas;
      }
      throw error;
    }
  } catch (error) {
    console.error('Error obteniendo rescatistas:', error);
    throw error;
  }
};

// Actualizar la cédula de un usuario
export const updateUserCedula = async (userId: string, cedula: string): Promise<void> => {
  if (!db) throw new Error('Firebase no está inicializado');
  
  try {
    // Buscar el documento del usuario por uid
    const usersQuery = query(
      collection(db, 'usuarios'),
      where('uid', '==', userId)
    );
    const querySnapshot = await getDocs(usersQuery);
    
    if (querySnapshot.empty) {
      // Si no se encuentra por query, intentar por ID del documento
      const userDocRef = doc(db, 'usuarios', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        await updateDoc(userDocRef, { cedula: cedula.trim() });
        console.log('✅ Cédula actualizada por ID del documento');
        return;
      }
      
      throw new Error('Usuario no encontrado');
    }
    
    // Actualizar el primer documento encontrado
    const userDocRef = querySnapshot.docs[0].ref;
    await updateDoc(userDocRef, { cedula: cedula.trim() });
    console.log('✅ Cédula actualizada exitosamente');
  } catch (error: any) {
    console.error('Error actualizando cédula:', error);
    throw new Error(error.message || 'Error al actualizar la cédula');
  }
};
