'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import RoleGuard from '@/components/auth/RoleGuard';
import {
  getDocuments,
  uploadDocument,
  deleteDocument,
} from '@/lib/firebase/documents';
import { Document, DocumentType } from '@/lib/types';
import StatusBadge from '@/components/ui/StatusBadge';
import FileUpload from '@/components/ui/FileUpload';
import toast from 'react-hot-toast';
import { Upload, Trash2, FileText, Eye, Download } from 'lucide-react';
import Link from 'next/link';

export default function RescatistaDashboard() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedType, setSelectedType] = useState<DocumentType>('cuenta_cobro');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    if (user) {
      loadDocuments();
    }
  }, [user, filter]);

  const loadDocuments = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const statusFilter = filter === 'all' ? undefined : filter;
      console.log('🔍 Cargando documentos con filtro:', statusFilter);
      const docs = await getDocuments(user.uid, user.rol, undefined, statusFilter);
      console.log('📊 Documentos obtenidos:', docs.length);
      console.log('📋 Estados de documentos:', docs.map(d => ({ id: d.id, status: d.status, fileName: d.fileName })));
      setDocuments(docs);
    } catch (error) {
      console.error('Error cargando documentos:', error);
      toast.error('Error al cargar documentos');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) {
      toast.error('Por favor selecciona un archivo');
      return;
    }

    console.log('📤 Iniciando subida:', {
      userId: user.uid,
      type: selectedType,
      fileName: selectedFile.name,
      fileSize: selectedFile.size
    });

    setUploading(true);
    try {
      const uploadedDoc = await uploadDocument(user.uid, selectedType, selectedFile);
      console.log('✅ Documento subido exitosamente:', uploadedDoc.id);
      toast.success('Documento subido exitosamente');
      setSelectedFile(null);
      setSelectedType('cuenta_cobro');
      // Resetear el input de archivo
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
      // Recargar documentos después de un breve delay para asegurar que Firestore haya actualizado
      setTimeout(() => {
        loadDocuments();
      }, 500);
    } catch (error: any) {
      console.error('❌ Error subiendo documento:', error);
      console.error('Detalles del error:', {
        code: error?.code,
        message: error?.message,
        stack: error?.stack
      });
      toast.error(error.message || 'Error al subir documento');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (document: Document) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este documento?')) {
      return;
    }

    try {
      await deleteDocument(document);
      toast.success('Documento eliminado exitosamente');
      loadDocuments();
    } catch (error: any) {
      console.error('Error eliminando documento:', error);
      toast.error(error.message || 'Error al eliminar documento');
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    if (filter === 'all') return true;
    const matches = doc.status === filter;
    if (!matches && filter === 'approved') {
      console.log(`❌ Documento no coincide con filtro "approved":`, {
        id: doc.id,
        status: doc.status,
        fileName: doc.fileName,
        estadoEsperado: 'approved',
        estadoActual: doc.status
      });
    }
    return matches;
  });
  
  console.log(`🔍 Filtro aplicado: "${filter}", documentos totales: ${documents.length}, filtrados: ${filteredDocuments.length}`);

  return (
    <RoleGuard allowedRoles={['Rescatista']}>
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard Rescatista
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Gestiona tus cuentas de cobro e incapacidades
            </p>
          </div>

          {/* Formulario de carga */}
          <div className="mb-8 rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
              Subir Nuevo Documento
            </h2>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tipo de Documento
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as DocumentType)}
                  className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="cuenta_cobro">Cuenta de Cobro</option>
                  <option value="incapacidad">Incapacidad</option>
                </select>
              </div>

              <FileUpload
                onFileSelect={handleFileSelect}
                label="Seleccionar archivo (PDF o Imagen)"
                disabled={uploading}
              />

              <button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                <Upload className="h-4 w-4" />
                {uploading ? 'Subiendo...' : 'Subir Documento'}
              </button>
            </div>
          </div>

          {/* Filtros */}
          <div className="mb-6 flex flex-wrap gap-2">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  filter === status
                    ? 'bg-blue-600 text-white dark:bg-blue-500'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {status === 'all'
                  ? 'Todos'
                  : status === 'pending'
                    ? 'Pendientes'
                    : status === 'approved'
                      ? 'Aprobados'
                      : 'Rechazados'}
              </button>
            ))}
          </div>

          {/* Lista de documentos */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="rounded-xl bg-white p-12 text-center shadow-lg dark:bg-gray-800">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                No hay documentos {filter !== 'all' && `con estado ${filter}`}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredDocuments.map((doc) => (
                <div
                  key={`${doc.userId}_${doc.id}_${doc.type}`}
                  className="rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {doc.type === 'cuenta_cobro' ? 'Cuenta de Cobro' : 'Incapacidad'}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {doc.fileName}
                      </p>
                    </div>
                    <StatusBadge status={doc.status} />
                  </div>

                  <div className="mb-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <p>
                      <strong>Fecha:</strong>{' '}
                      {new Date(doc.createdAt).toLocaleDateString('es-ES')}
                    </p>
                    {doc.reviewedAt && (
                      <p>
                        <strong>Revisado:</strong>{' '}
                        {new Date(doc.reviewedAt).toLocaleDateString('es-ES')}
                      </p>
                    )}
                  </div>

                  {doc.status === 'rejected' && doc.rejectionReason && (
                    <div className="mb-4 rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
                      <p className="text-sm font-medium text-red-800 dark:text-red-300">
                        Motivo de rechazo:
                      </p>
                      <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                        {doc.rejectionReason}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Link
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                    >
                      <Eye className="h-4 w-4" />
                      Ver
                    </Link>
                    {doc.status === 'rejected' && !doc.locked && (
                      <button
                        onClick={() => handleDelete(doc)}
                        className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                      >
                        <Trash2 className="h-4 w-4" />
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}
