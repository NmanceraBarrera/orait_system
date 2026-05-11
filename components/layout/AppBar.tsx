'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from '@/lib/firebase/auth';
import { useRouter } from 'next/navigation';
import { LogOut, User, X, AlertCircle } from 'lucide-react';
import OraitLogo from '@/components/ui/OraitLogo';

export default function AppBar() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      if (user) {
        await signOut();
        setShowLogoutModal(false);
        // Redirigir directamente a la página principal (no a login)
        window.location.href = '/';
      } else {
        setIsLoggingOut(false);
        setShowLogoutModal(false);
      }
    } catch (error: any) {
      console.error('Error al cerrar sesión:', error);
      setIsLoggingOut(false);
      setShowLogoutModal(false);
      alert('Error al cerrar sesión. Por favor, intenta nuevamente.');
    }
  };

  const openLogoutModal = () => {
    setShowLogoutModal(true);
  };

  const closeLogoutModal = () => {
    if (!isLoggingOut) {
      setShowLogoutModal(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const styles = {
      Rescatista: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      Supervisor: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    };
    return styles[role as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-gray-800 bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-gray-900/80">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* Logo y navegación principal */}
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center h-full py-2">
                <OraitLogo size="large" />
              </Link>
              
              {!user && (
                <div className="hidden items-center gap-6 md:flex">
                  <Link
                    href="/servicios"
                    className="text-sm font-medium text-gray-300 transition-colors hover:text-white"
                  >
                    Servicios
                  </Link>
                  <Link
                    href="/contacto"
                    className="text-sm font-medium text-gray-300 transition-colors hover:text-white"
                  >
                    Contacto
                  </Link>
                </div>
              )}
            </div>

            {/* Acciones del usuario */}
            <div className="flex items-center gap-4">
              {loading ? (
                <div className="h-8 w-8 animate-pulse rounded-full bg-gray-700" />
              ) : user ? (
                <>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 rounded-lg bg-gray-800 px-3 py-1.5 border border-gray-700">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-300">
                        {user.nombre || user.correo}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${getRoleBadge(user.rol)}`}
                      >
                        {user.rol}
                      </span>
                    </div>
                    <button
                      onClick={openLogoutModal}
                      className="flex items-center gap-2 rounded-lg bg-red-900/30 px-3 py-1.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-900/50 border border-red-800/50"
                    >
                      <LogOut className="h-4 w-4" />
                      Salir
                    </button>
                  </div>
                </>
              ) : (
                <Link
                  href="/login"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90" style={{ backgroundColor: '#80D7C9', color: '#000' }}
                >
                  Ingreso Colaboradores
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Modal de confirmación de cierre de sesión - Renderizado fuera del nav */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={closeLogoutModal}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                  ¿Cerrar sesión?
                </h3>
                <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
                  Estás a punto de cerrar tu sesión. ¿Estás seguro de que deseas continuar?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={closeLogoutModal}
                    disabled={isLoggingOut}
                    className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSignOut}
                    disabled={isLoggingOut}
                    className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-red-500 dark:hover:bg-red-600"
                  >
                    {isLoggingOut ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Cerrando...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <LogOut className="h-4 w-4" />
                        Cerrar sesión
                      </span>
                    )}
                  </button>
                </div>
              </div>
              {!isLoggingOut && (
                <button
                  onClick={closeLogoutModal}
                  className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
