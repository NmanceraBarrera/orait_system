# ORAIT System - Sistema de Gestión para Rescatistas Acuáticos

Aplicación web empresarial desarrollada con Next.js, React, Tailwind CSS y Firebase para ORAIT S.A.S. - Empresa especializada en rescate acuático y salvavidas profesionales para piscinas privadas, públicas y estanques. Sistema de gestión integral para nuestros equipos de salvavidas con control de roles y flujo de aprobación.

## 🚀 Características

- **Páginas Públicas**: Landing page corporativa con secciones de servicios, quiénes somos y contacto
- **Autenticación**: Sistema de login con Firebase Authentication y detección automática de roles
- **Dashboard Rescatista**: 
  - Subir cuentas de cobro e incapacidades
  - Ver estado de documentos (Pendiente/Aprobado/Rechazado)
  - Eliminar documentos rechazados
  - Ver motivos de rechazo
- **Dashboard Supervisor**:
  - Ver todos los documentos
  - Filtrar por tipo y estado
  - Aprobar o rechazar documentos
  - Campo obligatorio para motivo de rechazo
- **Control de Acceso**: Sistema de roles con permisos diferenciados
- **Seguridad**: Reglas de Firestore y Storage configuradas

## 🛠️ Tecnologías

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS 4**
- **Firebase** (Authentication, Firestore, Storage)
- **React Hot Toast** (Notificaciones)
- **Lucide React** (Iconos)

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Proyecto Firebase configurado

## 🔧 Instalación

1. **Clonar el repositorio** (si aplica)

2. **Instalar dependencias**:
```bash
npm install
```

3. **Configurar variables de entorno**:
Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_proyecto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
```

4. **Configurar Firebase**:
   - Crea un proyecto en [Firebase Console](https://console.firebase.google.com)
   - Habilita Authentication (Email/Password)
   - Crea una base de datos Firestore
   - Configura Firebase Storage
   - Copia las reglas de seguridad desde `FIRESTORE_RULES.md`

5. **Crear usuarios iniciales**:
   - Ve a Firebase Authentication y crea usuarios manualmente
   - Luego crea los documentos correspondientes en Firestore (colección `users`)
   - O usa el script `scripts/createUser.ts` (requiere configuración adicional)

## 🚀 Ejecutar en Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura del Proyecto

```
orait-system/
├── app/                      # Páginas y rutas (App Router)
│   ├── (public)/            # Rutas públicas
│   │   ├── page.tsx         # Landing page
│   │   ├── servicios/       # Página de servicios
│   │   ├── quienes-somos/  # Página sobre nosotros
│   │   └── contacto/        # Página de contacto
│   ├── login/               # Página de login
│   └── dashboard/
│       ├── rescatista/      # Dashboard rescatista
│       └── supervisor/      # Dashboard supervisor
├── components/              # Componentes React
│   ├── auth/               # Componentes de autenticación
│   ├── layout/             # Componentes de layout
│   └── ui/                 # Componentes UI reutilizables
├── hooks/                  # Custom hooks
│   └── useAuth.ts          # Hook de autenticación
├── lib/                    # Utilidades y configuraciones
│   ├── firebase/           # Configuración y servicios Firebase
│   └── types/              # Tipos TypeScript
├── middleware.ts           # Middleware de Next.js
├── docs/                   # Documentación
│   └── SCHEMA.md           # Esquema de base de datos
└── FIRESTORE_RULES.md      # Reglas de seguridad
```

## 🔐 Seguridad

### Reglas de Firestore

Las reglas de seguridad están documentadas en `FIRESTORE_RULES.md`. Asegúrate de:

1. Copiar las reglas a la consola de Firebase
2. Verificar que los usuarios solo puedan acceder a sus propios documentos
3. Confirmar que los supervisores tengan acceso completo de lectura
4. Validar que los documentos aprobados queden bloqueados

### Reglas de Storage

Las reglas de Storage también están en `FIRESTORE_RULES.md`. Configúralas para:

- Limitar el tamaño de archivos (máx. 10MB)
- Restringir acceso por UID
- Permitir eliminación solo de documentos rechazados

## 📊 Esquema de Base de Datos

Consulta `docs/SCHEMA.md` para ver la estructura completa de las colecciones:

- **users**: Información de usuarios con roles
- **documents**: Documentos subidos con estados y metadatos

## 🎨 Diseño

- Diseño moderno y limpio con Tailwind CSS
- Responsive design (mobile-first)
- Modo oscuro soportado
- Componentes UI consistentes
- Badges de estado con colores semánticos

## 🔄 Flujo de Aprobación

1. **Rescatista sube documento** → Estado: `pending`
2. **Supervisor revisa** → Puede aprobar o rechazar
3. **Si aprueba** → Estado: `approved`, `locked: true` (inmutable)
4. **Si rechaza** → Estado: `rejected`, `locked: false` (puede eliminarse)
5. **Rescatista puede eliminar rechazados** y subir uno nuevo

## 🧪 Próximos Pasos

- [ ] Tests unitarios y de integración
- [ ] Mejoras en UX/UI
- [ ] Notificaciones por email
- [ ] Historial de cambios detallado
- [ ] Exportación de reportes
- [ ] Dashboard de estadísticas

## 📝 Licencia

Este proyecto es privado y de uso interno.

## 👥 Soporte

Para soporte técnico, contacta al equipo de desarrollo o revisa la documentación en `docs/`.

---

Desarrollado con ❤️ usando Next.js y Firebase
