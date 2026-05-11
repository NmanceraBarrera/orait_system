'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn, signOut } from '@/lib/firebase/auth';
import { getUserRole, getUserData, getUserStatusFromRecursos } from '@/lib/firebase/auth';
import toast from 'react-hot-toast';
import { LogIn, Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await signIn(email, password);
      console.log('Usuario autenticado, UID:', user.uid);
      
      // Obtener datos completos del usuario
      const userData = await getUserData(user);
      
      // Validar que el usuario exista
      if (!userData) {
        console.error('❌ No se encontraron datos para el usuario:', user.uid);
        toast.error('No se pudo obtener la información del usuario. Verifica que el documento exista en Firestore.');
        // Cerrar sesión si no se encontraron datos
        await signOut();
        return;
      }

      // Validar que el usuario tenga status "Activo" desde la colección recursos
      const userStatus = await getUserStatusFromRecursos(user.uid);
      console.log('📋 Status del usuario desde recursos:', userStatus);
      
      if (!userStatus || userStatus !== 'Activo') {
        const statusMessage = userStatus === 'Inactivo' 
          ? 'Tu cuenta está inactiva. Contacta al administrador para activarla.'
          : userStatus 
            ? `Tu cuenta tiene un estado inválido (${userStatus}). Contacta al administrador.`
            : 'Tu cuenta no tiene un estado definido en recursos. Contacta al administrador.';
        
        console.error('❌ Usuario no puede iniciar sesión:', {
          uid: user.uid,
          status: userStatus,
          correo: userData.correo
        });
        
        toast.error(statusMessage);
        // Cerrar sesión si no está activo
        await signOut();
        return;
      }

      console.log('✅ Usuario válido y activo:', {
        uid: user.uid,
        status: userStatus,
        rol: userData.rol
      });

      const role = userData.rol;
      console.log('Rol obtenido:', role);

      if (!role) {
        console.error('No se encontró el rol para el usuario:', user.uid);
        toast.error('No se pudo determinar el rol del usuario. Verifica que el documento exista en Firestore con el campo "rol".');
        await signOut();
        return;
      }

      toast.success('Inicio de sesión exitoso');
      
      // Redirigir según el rol
      if (role === 'Rescatista') {
        router.push('/dashboard/rescatista');
      } else if (role === 'Supervisor') {
        router.push('/dashboard/supervisor');
      }
    } catch (error: any) {
      console.error('Error al iniciar sesión:', error);
      toast.error(error.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-xl bg-white p-8 shadow-2xl dark:bg-gray-800">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
              <LogIn className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Iniciar Sesión
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Acceso para Rescatistas y Supervisores
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Email
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Contraseña
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>

            <Link
              href="https://orait-b92dd.web.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full rounded-lg border border-gray-500 px-4 py-2.5 text-center font-semibold text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-500 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Ir a Servicios
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}
