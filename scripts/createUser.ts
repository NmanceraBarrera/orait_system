/**
 * Script de utilidad para crear usuarios en Firestore
 * 
 * Uso:
 * 1. Configura las variables de entorno de Firebase
 * 2. Ejecuta: npx tsx scripts/createUser.ts
 * 
 * O crea usuarios manualmente desde la consola de Firebase:
 * - Authentication > Add user
 * - Firestore > users > Add document
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import * as readline from 'readline';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function createUser() {
  try {
    console.log('=== Crear Usuario en Firestore ===\n');
    
    const uid = await question('UID del usuario (de Firebase Authentication): ');
    const email = await question('Email: ');
    const displayName = await question('Nombre para mostrar (opcional): ');
    const role = await question('Rol (Rescatista/Supervisor): ');

    if (role !== 'Rescatista' && role !== 'Supervisor') {
      throw new Error('El rol debe ser "Rescatista" o "Supervisor"');
    }

    const userData = {
      email,
      displayName: displayName || null,
      role,
      createdAt: new Date(),
    };

    await setDoc(doc(db, 'usuarios', uid), userData);

    console.log('\n✅ Usuario creado exitosamente!');
    console.log(`UID: ${uid}`);
    console.log(`Email: ${email}`);
    console.log(`Rol: ${role}`);
  } catch (error) {
    console.error('❌ Error creando usuario:', error);
  } finally {
    rl.close();
  }
}

createUser();
