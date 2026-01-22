# Arquitectura del Sistema ORAIT

## Visión General

Sistema web empresarial construido con Next.js 16 (App Router) que implementa un flujo completo de gestión de documentos con control de roles y aprobaciones.

## Stack Tecnológico

### Frontend
- **Next.js 16**: Framework React con App Router
- **React 19**: Biblioteca UI
- **TypeScript**: Tipado estático
- **Tailwind CSS 4**: Estilos utility-first
- **Lucide React**: Iconos

### Backend/Servicios
- **Firebase Authentication**: Autenticación de usuarios
- **Cloud Firestore**: Base de datos NoSQL
- **Firebase Storage**: Almacenamiento de archivos

### Utilidades
- **React Hot Toast**: Notificaciones toast
- **tsx**: Ejecución de TypeScript

## Arquitectura de Componentes

### Estructura de Carpetas

```
app/                    # App Router de Next.js
├── (public)/          # Rutas públicas (agrupación implícita)
├── login/             # Autenticación
└── dashboard/         # Área privada
    ├── rescatista/    # Dashboard específico por rol
    └── supervisor/

components/            # Componentes React
├── auth/             # Componentes de autenticación
│   └── RoleGuard.tsx # Guard de protección por rol
├── layout/           # Componentes de layout
│   └── AppBar.tsx    # Barra de navegación
└── ui/               # Componentes UI reutilizables
    ├── StatusBadge.tsx
    └── FileUpload.tsx

lib/                  # Lógica de negocio
├── firebase/         # Servicios Firebase
│   ├── config.ts     # Configuración
│   ├── auth.ts       # Servicios de autenticación
│   └── documents.ts  # Servicios de documentos
└── types/            # Definiciones TypeScript
    └── index.ts

hooks/                # Custom hooks
└── useAuth.ts        # Hook de autenticación
```

## Flujo de Datos

### Autenticación

```
1. Usuario ingresa credenciales → Login Page
2. Firebase Auth valida → signIn()
3. Obtener rol desde Firestore → getUserRole()
4. Redirigir según rol → Dashboard correspondiente
5. Hook useAuth() mantiene estado global
```

### Gestión de Documentos

#### Rescatista
```
1. Selecciona tipo de documento
2. Sube archivo → uploadDocument()
3. Archivo se guarda en Storage
4. Metadatos se crean en Firestore (status: pending)
5. Supervisor recibe notificación visual
```

#### Supervisor
```
1. Ve lista de documentos pendientes
2. Visualiza archivo desde Storage
3. Decide: Aprobar o Rechazar
4. Si aprueba: status=approved, locked=true
5. Si rechaza: status=rejected, motivo obligatorio
```

## Patrones de Diseño

### 1. Role-Based Access Control (RBAC)
- **RoleGuard**: Componente HOC que protege rutas por rol
- Validación en cliente y servidor (Firestore Rules)

### 2. Custom Hooks
- **useAuth**: Centraliza lógica de autenticación
- Estado reactivo con onAuthStateChanged

### 3. Service Layer
- Separación de lógica de negocio en `lib/firebase/`
- Funciones puras y reutilizables

### 4. Component Composition
- Componentes pequeños y reutilizables
- Props tipadas con TypeScript

## Seguridad

### Capas de Seguridad

1. **Cliente (React)**
   - RoleGuard valida acceso antes de renderizar
   - Validación de formularios
   - Manejo de errores

2. **Firestore Rules**
   - Validación a nivel de base de datos
   - Usuarios solo ven sus documentos
   - Supervisores tienen acceso completo

3. **Storage Rules**
   - Control de acceso por UID
   - Límite de tamaño de archivos
   - Validación de rutas

### Validaciones Implementadas

- ✅ Autenticación requerida para rutas privadas
- ✅ Roles validados antes de acceder a dashboards
- ✅ Usuarios solo pueden modificar sus propios documentos
- ✅ Documentos aprobados quedan bloqueados
- ✅ Motivo de rechazo obligatorio
- ✅ Solo documentos rechazados pueden eliminarse

## Estado de la Aplicación

### Estado Global
- **useAuth**: Estado de autenticación (usuario, rol, loading)
- Persistencia mediante Firebase Auth

### Estado Local
- Componentes manejan su propio estado
- React hooks (useState, useEffect)
- No se requiere Redux/Zustand (complejidad innecesaria)

## Optimizaciones

### Performance
- Lazy loading de componentes (Next.js automático)
- Imágenes optimizadas (next/image)
- Código dividido por rutas

### UX
- Loading states en todas las operaciones async
- Feedback visual inmediato (toast notifications)
- Confirmaciones para acciones destructivas
- Diseño responsive

## Escalabilidad

### Preparado para:
- ✅ Múltiples tipos de documentos (extensible)
- ✅ Más roles (fácil agregar)
- ✅ Notificaciones push (Firebase Cloud Messaging)
- ✅ Reportes y analytics
- ✅ Exportación de datos

### Consideraciones Futuras
- Cache de documentos con React Query
- Paginación para listas grandes
- Búsqueda y filtros avanzados
- Historial de cambios detallado

## Testing (Futuro)

Estructura sugerida:
```
__tests__/
├── components/
├── hooks/
├── lib/
└── pages/
```

Herramientas recomendadas:
- Jest + React Testing Library
- Firebase Emulator Suite
- Playwright para E2E

## Deployment

### Vercel (Recomendado)
1. Conectar repositorio
2. Configurar variables de entorno
3. Deploy automático

### Otros
- Netlify
- Firebase Hosting
- Docker + VPS

## Monitoreo

Recomendaciones:
- Firebase Analytics
- Sentry para errores
- Vercel Analytics
- Logs de Firestore

---

**Arquitectura diseñada para ser:**
- 🚀 Escalable
- 🔒 Segura
- 🎨 Mantenible
- ⚡ Performante
- 📱 Responsive
