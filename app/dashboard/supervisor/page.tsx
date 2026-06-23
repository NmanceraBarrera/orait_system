'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import RoleGuard from '@/components/auth/RoleGuard';
import {
  getPendingDocuments,
  getUserDocuments,
  getUserDocumentCount,
  approveDocument,
  rejectDocument,
} from '@/lib/firebase/documents';
import { getAllRescatistas, updateUserSupervisorData } from '@/lib/firebase/auth';
import { getAllSolicitudes, validarSolicitud } from '@/lib/firebase/solicitudes';
import { SOLICITUD_DOCUMENT_FIELDS } from '@/lib/constants/solicitudDocuments';
import { Document, DocumentType, Solicitud } from '@/lib/types';
import StatusBadge from '@/components/ui/StatusBadge';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Eye, Users, Clock, History, FileText, Briefcase, Download, Search, Edit, IdCard, StickyNote } from 'lucide-react';
import Link from 'next/link';

type ViewMode = 'pending' | 'rescatistas' | 'history' | 'solicitudes';

type RescatistaItem = {
  uid: string;
  nombre: string;
  correo: string;
  telefono: string;
  cedula: string;
  novedad: string;
  status: string;
  documentCount?: number;
  pendingCount?: number;
};

const getStatusBadgeClass = (status: string) => {
  if (status === 'Activo') {
    return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
  }
  if (status === 'Inactivo') {
    return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
  }
  return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
};

export default function SupervisorDashboard() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('pending');
  const [pendingDocuments, setPendingDocuments] = useState<Document[]>([]);
  const [rescatistas, setRescatistas] = useState<any[]>([]);
  const [rescatistasWithCounts, setRescatistasWithCounts] = useState<any[]>([]);
  const [selectedRescatista, setSelectedRescatista] = useState<string | null>(null);
  const [userDocuments, setUserDocuments] = useState<Document[]>([]);
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [userNamesMap, setUserNamesMap] = useState<Record<string, string>>({});
  const [selectedSolicitud, setSelectedSolicitud] = useState<Solicitud | null>(null);
  const [showValidarModal, setShowValidarModal] = useState(false);
  const [motivoValidacion, setMotivoValidacion] = useState('');
  const [validarAprobada, setValidarAprobada] = useState<boolean | null>(null);
  const [filtroRescatistas, setFiltroRescatistas] = useState('');
  const [showEditRescatistaModal, setShowEditRescatistaModal] = useState(false);
  const [selectedRescatistaForEdit, setSelectedRescatistaForEdit] = useState<RescatistaItem | null>(null);
  const [cedulaValue, setCedulaValue] = useState('');
  const [novedadValue, setNovedadValue] = useState('');

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, viewMode, selectedRescatista]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      if (viewMode === 'pending') {
        // Cargar documentos pendientes y nombres de usuarios en paralelo
        const [docs, rescatistasList] = await Promise.all([
          getPendingDocuments(),
          getAllRescatistas(),
        ]);
        
        // Crear mapa de userId -> nombre
        const namesMap: Record<string, string> = {};
        rescatistasList.forEach((rescatista) => {
          namesMap[rescatista.uid] = rescatista.nombre || rescatista.correo || rescatista.uid.substring(0, 8) + '...';
        });
        setUserNamesMap(namesMap);
        setPendingDocuments(docs);
      } else if (viewMode === 'rescatistas') {
        const rescatistasList = await getAllRescatistas();
        setRescatistas(rescatistasList);
        
        // Obtener conteos de documentos para cada rescatista
        const rescatistasWithCounts = await Promise.all(
          rescatistasList.map(async (rescatista) => {
            const counts = await getUserDocumentCount(rescatista.uid);
            return {
              ...rescatista,
              documentCount: counts.approved,
              pendingCount: counts.pending,
            };
          })
        );
        setRescatistasWithCounts(rescatistasWithCounts);
      } else if (viewMode === 'history' && selectedRescatista) {
        const docs = await getUserDocuments(selectedRescatista);
        setUserDocuments(docs);
      } else if (viewMode === 'solicitudes') {
        const solicitudesList = await getAllSolicitudes();
        setSolicitudes(solicitudesList);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (document: Document) => {
    if (!user || !confirm('¿Estás seguro de aprobar este documento?')) {
      return;
    }

    setProcessing(true);
    try {
      await approveDocument(document, user.uid);
      toast.success('Documento aprobado exitosamente');
      loadData();
    } catch (error: any) {
      console.error('Error aprobando documento:', error);
      toast.error(error.message || 'Error al aprobar documento');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedDoc || !user || !rejectionReason.trim()) {
      toast.error('El motivo de rechazo es obligatorio');
      return;
    }

    setProcessing(true);
    try {
      await rejectDocument(selectedDoc, user.uid, rejectionReason);
      toast.success('Documento rechazado');
      setShowRejectModal(false);
      setRejectionReason('');
      setSelectedDoc(null);
      loadData();
    } catch (error: any) {
      console.error('Error rechazando documento:', error);
      toast.error(error.message || 'Error al rechazar documento');
    } finally {
      setProcessing(false);
    }
  };

  const openRejectModal = (document: Document) => {
    setSelectedDoc(document);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const openValidarModal = (solicitud: Solicitud, aprobada: boolean) => {
    setSelectedSolicitud(solicitud);
    setValidarAprobada(aprobada);
    setMotivoValidacion('');
    setShowValidarModal(true);
  };

  const handleValidarSolicitud = async () => {
    if (!selectedSolicitud || !user || !motivoValidacion.trim() || validarAprobada === null) {
      toast.error('El motivo de validación es obligatorio');
      return;
    }

    setProcessing(true);
    try {
      await validarSolicitud(
        selectedSolicitud.id,
        user.uid,
        validarAprobada,
        motivoValidacion
      );
      toast.success(validarAprobada ? 'Solicitud validada exitosamente' : 'Solicitud rechazada');
      setShowValidarModal(false);
      setMotivoValidacion('');
      setSelectedSolicitud(null);
      setValidarAprobada(null);
      loadData();
    } catch (error: any) {
      console.error('Error validando solicitud:', error);
      toast.error(error.message || 'Error al validar solicitud');
    } finally {
      setProcessing(false);
    }
  };

  const handleRescatistaSelect = (uid: string) => {
    setSelectedRescatista(uid);
    setViewMode('history');
  };

  const openEditRescatistaModal = (rescatista: RescatistaItem) => {
    setSelectedRescatistaForEdit(rescatista);
    setCedulaValue(rescatista.cedula || '');
    setNovedadValue(rescatista.novedad || '');
    setShowEditRescatistaModal(true);
  };

  const handleSaveRescatistaData = async () => {
    if (!selectedRescatistaForEdit) return;

    setProcessing(true);
    try {
      await updateUserSupervisorData(selectedRescatistaForEdit.uid, {
        cedula: cedulaValue.trim(),
        novedad: novedadValue.trim(),
      });
      toast.success('Datos del rescatista actualizados');
      setShowEditRescatistaModal(false);
      setSelectedRescatistaForEdit(null);
      setCedulaValue('');
      setNovedadValue('');
      loadData();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al guardar los datos';
      console.error('Error guardando datos del rescatista:', error);
      toast.error(message);
    } finally {
      setProcessing(false);
    }
  };

  const rescatistasFiltrados = useMemo(() => {
    const listaRescatistas = (rescatistasWithCounts.length > 0
      ? rescatistasWithCounts
      : rescatistas) as RescatistaItem[];

    if (!filtroRescatistas.trim()) {
      return listaRescatistas;
    }

    const filtroLower = filtroRescatistas.toLowerCase().trim();
    return listaRescatistas.filter((rescatista) => {
      const nombre = (rescatista.nombre || '').toLowerCase();
      const correo = (rescatista.correo || '').toLowerCase();
      const cedula = (rescatista.cedula || '').toLowerCase();
      const novedad = (rescatista.novedad || '').toLowerCase();
      return (
        nombre.includes(filtroLower) ||
        correo.includes(filtroLower) ||
        cedula.includes(filtroLower) ||
        novedad.includes(filtroLower)
      );
    });
  }, [filtroRescatistas, rescatistasWithCounts, rescatistas]);

  const rescatistasActivos = useMemo(
    () => rescatistasFiltrados.filter((rescatista) => rescatista.status === 'Activo'),
    [rescatistasFiltrados]
  );

  const rescatistasInactivos = useMemo(
    () => rescatistasFiltrados.filter((rescatista) => rescatista.status === 'Inactivo'),
    [rescatistasFiltrados]
  );

  const rescatistasSinEstado = useMemo(
    () =>
      rescatistasFiltrados.filter(
        (rescatista) => rescatista.status !== 'Activo' && rescatista.status !== 'Inactivo'
      ),
    [rescatistasFiltrados]
  );

  const pendingByEmployee = useMemo(() => {
    const groups = new Map<string, Document[]>();

    pendingDocuments.forEach((doc) => {
      const current = groups.get(doc.userId) || [];
      current.push(doc);
      groups.set(doc.userId, current);
    });

    return Array.from(groups.entries())
      .map(([userId, docs]) => ({
        userId,
        name: userNamesMap[userId] || `${userId.substring(0, 8)}...`,
        docs: docs.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
      }))
      .sort((a, b) => a.name.localeCompare(b.name, 'es'));
  }, [pendingDocuments, userNamesMap]);

  const renderRescatistaCard = (rescatista: RescatistaItem) => (
    <div
      key={rescatista.uid}
      className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-5"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-gray-900 dark:text-white">
            {rescatista.nombre || 'Sin nombre'}
          </h3>
          <p className="mt-1 truncate text-sm text-gray-600 dark:text-gray-400">{rescatista.correo}</p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
            {rescatista.telefono || 'Sin teléfono'}
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${getStatusBadgeClass(rescatista.status)}`}>
          {rescatista.status}
        </span>
      </div>

      <div className="mb-4 space-y-3 text-sm">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Cédula</p>
          <p className="mt-1 text-gray-900 dark:text-white">{rescatista.cedula || 'Sin cédula'}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Novedad</p>
          <p className="mt-1 whitespace-pre-wrap break-words text-gray-900 dark:text-white">
            {rescatista.novedad || 'Sin novedad registrada'}
          </p>
        </div>
      </div>

      <div className="mt-auto flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={() => openEditRescatistaModal(rescatista)}
          disabled={processing}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          <Edit className="h-4 w-4" />
          Editar datos
        </button>
        <button
          type="button"
          onClick={() => handleRescatistaSelect(rescatista.uid)}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          <History className="h-4 w-4" />
          Ver histórico
          {rescatista.pendingCount && rescatista.pendingCount > 0 ? (
            <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">NEW</span>
          ) : rescatista.documentCount && rescatista.documentCount > 0 ? (
            <span className="rounded-full bg-blue-400 px-2 py-0.5 text-xs font-medium text-white">
              {rescatista.documentCount}
            </span>
          ) : null}
        </button>
      </div>
    </div>
  );

  const renderRescatistaSection = (
    title: string,
    items: RescatistaItem[],
    emptyMessage: string,
    accentClass: string
  ) => (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        <span className={`rounded-full px-3 py-1 text-sm font-medium ${accentClass}`}>
          {items.length}
        </span>
      </div>
      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
          {emptyMessage}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map(renderRescatistaCard)}
        </div>
      )}
    </section>
  );

  return (
    <RoleGuard allowedRoles={['Supervisor']}>
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard Supervisor
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Gestiona documentos y rescatistas
            </p>
          </div>

          {/* Navegación de vistas */}
          <div className="mb-6 grid grid-cols-2 gap-2 rounded-xl bg-white p-2 shadow-lg dark:bg-gray-800 lg:grid-cols-4">
            <button
              onClick={() => {
                setViewMode('pending');
                setSelectedRescatista(null);
              }}
              className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors sm:px-4 sm:text-base ${
                viewMode === 'pending'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="truncate">Pendientes</span>
            </button>
            <button
              onClick={() => {
                setViewMode('rescatistas');
                setSelectedRescatista(null);
              }}
              className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors sm:px-4 sm:text-base ${
                viewMode === 'rescatistas'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              <Users className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="truncate">Rescatistas</span>
            </button>
            {selectedRescatista && (
              <button
                onClick={() => setViewMode('history')}
                className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors sm:px-4 sm:text-base ${
                  viewMode === 'history'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <History className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="truncate">Histórico</span>
              </button>
            )}
            <button
              onClick={() => {
                setViewMode('solicitudes');
                setSelectedRescatista(null);
              }}
              className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors sm:px-4 sm:text-base ${
                viewMode === 'solicitudes'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              <Briefcase className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="truncate">Solicitudes</span>
            </button>
          </div>

          {/* Vista: Documentos Pendientes */}
          {viewMode === 'pending' && (
            <div>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Cuentas de Cobro Pendientes
                </h2>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                  {pendingDocuments.length} pendientes · {pendingByEmployee.length} empleados
                </span>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                </div>
              ) : pendingDocuments.length === 0 ? (
                <div className="rounded-xl bg-white p-12 text-center shadow-lg dark:bg-gray-800">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-4 text-gray-600 dark:text-gray-400">
                    No hay documentos pendientes
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {pendingByEmployee.map(({ userId, name, docs }) => (
                    <section
                      key={userId}
                      className="rounded-xl border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800 sm:p-6"
                    >
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-4 dark:border-gray-700">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{name}</h3>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {docs.length} documento{docs.length === 1 ? '' : 's'} pendiente{docs.length === 1 ? '' : 's'}
                          </p>
                        </div>
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
                          Empleado
                        </span>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {docs.map((doc) => (
                          <div
                            key={doc.id}
                            className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/40 sm:p-5"
                          >
                            <div className="mb-4 flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                  {doc.type === 'cuenta_cobro' ? 'Cuenta de Cobro' : 'Incapacidad'}
                                </h4>
                                <p className="mt-1 truncate text-sm text-gray-600 dark:text-gray-400">
                                  {doc.fileName}
                                </p>
                              </div>
                              <StatusBadge status={doc.status} />
                            </div>

                            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                              <strong>Fecha:</strong>{' '}
                              {new Date(doc.createdAt).toLocaleDateString('es-ES')}
                            </p>

                            <div className="flex flex-col gap-2">
                              <Link
                                href={doc.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                              >
                                <Eye className="h-4 w-4" />
                                Ver Documento
                              </Link>

                              <div className="flex flex-col gap-2 sm:flex-row">
                                <button
                                  onClick={() => handleApprove(doc)}
                                  disabled={processing}
                                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-700 transition-colors hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                  Aprobar
                                </button>
                                <button
                                  onClick={() => openRejectModal(doc)}
                                  disabled={processing}
                                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                                >
                                  <XCircle className="h-4 w-4" />
                                  Rechazar
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Vista: Lista de Rescatistas */}
          {viewMode === 'rescatistas' && (
            <div className="space-y-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Rescatistas
                </h2>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                  {rescatistasFiltrados.length} en total
                </span>
              </div>

              {!loading && rescatistas.length > 0 && (
                <div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar por nombre, correo, cédula o novedad..."
                      value={filtroRescatistas}
                      onChange={(e) => setFiltroRescatistas(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                    />
                  </div>
                </div>
              )}

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                </div>
              ) : rescatistas.length === 0 ? (
                <div className="rounded-xl bg-white p-12 text-center shadow-lg dark:bg-gray-800">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-4 text-gray-600 dark:text-gray-400">
                    No hay rescatistas registrados
                  </p>
                </div>
              ) : rescatistasFiltrados.length === 0 ? (
                <div className="rounded-xl bg-white p-12 text-center shadow-lg dark:bg-gray-800">
                  <Search className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-4 text-gray-600 dark:text-gray-400">
                    No se encontraron rescatistas que coincidan con &quot;{filtroRescatistas}&quot;
                  </p>
                </div>
              ) : (
                <div className="space-y-10">
                  {renderRescatistaSection(
                    'Rescatistas activos',
                    rescatistasActivos,
                    'No hay rescatistas activos con los filtros actuales.',
                    'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  )}
                  {renderRescatistaSection(
                    'Rescatistas inactivos',
                    rescatistasInactivos,
                    'No hay rescatistas inactivos con los filtros actuales.',
                    'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  )}
                  {rescatistasSinEstado.length > 0 &&
                    renderRescatistaSection(
                      'Sin estado definido',
                      rescatistasSinEstado,
                      'No hay rescatistas sin estado.',
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    )}
                </div>
              )}
            </div>
          )}

          {/* Vista: Histórico por Usuario */}
          {viewMode === 'history' && selectedRescatista && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Histórico de Documentos
                </h2>
                <button
                  onClick={() => {
                    setViewMode('rescatistas');
                    setSelectedRescatista(null);
                  }}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Volver
                </button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                </div>
              ) : userDocuments.length === 0 ? (
                <div className="rounded-xl bg-white p-12 text-center shadow-lg dark:bg-gray-800">
                  <History className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-4 text-gray-600 dark:text-gray-400">
                    No hay documentos para este rescatista
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {userDocuments.map((doc) => (
                    <div
                      key={doc.id}
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
                            <strong>Aprobado:</strong>{' '}
                            {new Date(doc.reviewedAt).toLocaleDateString('es-ES')}
                          </p>
                        )}
                      </div>

                      <Link
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                      >
                        <Eye className="h-4 w-4" />
                        Ver Documento
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Vista: Solicitudes de Trabajo */}
          {viewMode === 'solicitudes' && (
            <div>
              <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                Solicitudes de Trabajo
              </h2>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                </div>
              ) : solicitudes.length === 0 ? (
                <div className="rounded-xl bg-white p-12 text-center shadow-lg dark:bg-gray-800">
                  <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-4 text-gray-600 dark:text-gray-400">
                    No hay solicitudes de trabajo
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {solicitudes.map((solicitud) => (
                    <div
                      key={solicitud.id}
                      className="rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800"
                    >
                      <div className="mb-4 flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {solicitud.nombre}
                          </h3>
                          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            Fecha: {new Date(solicitud.createdAt).toLocaleDateString('es-ES')}
                          </p>
                          {solicitud.telefono && (
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                              📞 {solicitud.telefono}
                            </p>
                          )}
                        </div>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          solicitud.status === 'pendiente' || !solicitud.status
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            : solicitud.status === 'revisada'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                            : solicitud.status === 'aprobada'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                        }`}>
                          {solicitud.status === 'pendiente' || !solicitud.status ? 'Nueva solicitud' : solicitud.status}
                        </span>
                      </div>

                      {/* Mostrar motivo de validación si existe */}
                      {solicitud.motivoValidacion && (
                        <div className={`mb-4 rounded-lg p-3 ${
                          solicitud.status === 'aprobada'
                            ? 'bg-green-50 dark:bg-green-900/20'
                            : 'bg-red-50 dark:bg-red-900/20'
                        }`}>
                          <p className={`text-sm font-medium ${
                            solicitud.status === 'aprobada'
                              ? 'text-green-800 dark:text-green-300'
                              : 'text-red-800 dark:text-red-300'
                          }`}>
                            {solicitud.status === 'aprobada' ? '✅ Aprobada' : '❌ Rechazada'}
                          </p>
                          <p className={`mt-1 text-sm ${
                            solicitud.status === 'aprobada'
                              ? 'text-green-700 dark:text-green-400'
                              : 'text-red-700 dark:text-red-400'
                          }`}>
                            {solicitud.motivoValidacion}
                          </p>
                          {solicitud.validadoEn && (
                            <p className={`mt-1 text-xs ${
                              solicitud.status === 'aprobada'
                                ? 'text-green-600 dark:text-green-500'
                                : 'text-red-600 dark:text-red-500'
                            }`}>
                              Validado: {new Date(solicitud.validadoEn).toLocaleDateString('es-ES')}
                            </p>
                          )}
                        </div>
                      )}

                      <div className="mb-4 space-y-2">
                        {SOLICITUD_DOCUMENT_FIELDS.map(({ key, label }) => {
                          const documento = solicitud[key];
                          if (!documento) return null;

                          return (
                            <Link
                              key={key}
                              href={documento.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex min-w-0 items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                            >
                              <Download className="h-4 w-4 flex-shrink-0" />
                              <span className="min-w-0 truncate">
                                {label}: {documento.fileName}
                              </span>
                            </Link>
                          );
                        })}
                      </div>

                      {/* Botones de validación - solo si está pendiente */}
                      {(solicitud.status === 'pendiente' || !solicitud.status) && (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              openValidarModal(solicitud, true);
                            }}
                            disabled={processing}
                            className="relative z-10 flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-700 transition-colors hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Validar
                          </button>
                          <button
                            type="button"
                            onClick={() => openValidarModal(solicitud, false)}
                            disabled={processing}
                            className="relative z-10 flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                          >
                            <XCircle className="h-4 w-4" />
                            Rechazar
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Modal de validación de solicitud */}
          {showValidarModal && selectedSolicitud !== null && (
            <div 
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setShowValidarModal(false);
                  setMotivoValidacion('');
                  setSelectedSolicitud(null);
                  setValidarAprobada(null);
                }
              }}
            >
              <div 
                className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                  {validarAprobada === true ? 'Validar Solicitud' : 'Rechazar Solicitud'}
                </h2>
                <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                  {validarAprobada === true
                    ? 'Proporciona el motivo por el cual se valida esta solicitud. Este campo es obligatorio.'
                    : 'Proporciona el motivo por el cual se rechaza esta solicitud. Este campo es obligatorio.'}
                </p>
                <textarea
                  value={motivoValidacion}
                  onChange={(e) => setMotivoValidacion(e.target.value)}
                  placeholder={validarAprobada === true ? 'Motivo de validación...' : 'Motivo de rechazo...'}
                  rows={4}
                  className="mb-4 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowValidarModal(false);
                      setMotivoValidacion('');
                      setSelectedSolicitud(null);
                      setValidarAprobada(null);
                    }}
                    className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleValidarSolicitud();
                    }}
                    disabled={!motivoValidacion.trim() || processing}
                    className={`flex-1 rounded-lg px-4 py-2 font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                      validarAprobada === true
                        ? 'bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600'
                        : 'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600'
                    }`}
                  >
                    {processing ? 'Procesando...' : validarAprobada === true ? 'Validar' : 'Rechazar'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal de rechazo */}
          {showRejectModal && selectedDoc && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800">
                <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                  Rechazar Documento
                </h2>
                <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                  Por favor, proporciona el motivo del rechazo. El documento se guardará con el
                  estado rechazado para que el rescatista pueda ver el motivo.
                </p>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Motivo del rechazo..."
                  rows={4}
                  className="mb-4 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowRejectModal(false);
                      setRejectionReason('');
                      setSelectedDoc(null);
                    }}
                    className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={!rejectionReason.trim() || processing}
                    className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-red-500 dark:hover:bg-red-600"
                  >
                    {processing ? 'Procesando...' : 'Rechazar'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal de edición de cédula */}
          {showEditRescatistaModal && selectedRescatistaForEdit && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800">
                <div className="mb-4 flex items-center gap-3">
                  <IdCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Editar datos del rescatista
                  </h2>
                </div>
                <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                  Rescatista: <span className="font-medium">{selectedRescatistaForEdit.nombre}</span>
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Cédula
                    </label>
                    <input
                      type="text"
                      value={cedulaValue}
                      onChange={(e) => setCedulaValue(e.target.value)}
                      placeholder="Ingrese la cédula del rescatista"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                    />
                  </div>
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <StickyNote className="h-4 w-4" />
                      Novedad
                    </label>
                    <textarea
                      value={novedadValue}
                      onChange={(e) => setNovedadValue(e.target.value)}
                      placeholder="Registre novedades, observaciones o comentarios del rescatista"
                      rows={4}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                    />
                  </div>
                </div>
                <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditRescatistaModal(false);
                      setCedulaValue('');
                      setNovedadValue('');
                      setSelectedRescatistaForEdit(null);
                    }}
                    className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveRescatistaData}
                    disabled={processing}
                    className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
                  >
                    {processing ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}
