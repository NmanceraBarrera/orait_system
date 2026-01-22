# Diagrama de Flujo del Sistema

## Flujo de Autenticación

```
Usuario → Login → Firebase Auth
                ↓
         Verificar Rol en Firestore
                ↓
    ┌───────────┴───────────┐
    ↓                       ↓
Rescatista            Supervisor
    ↓                       ↓
Dashboard            Dashboard
Rescatista            Supervisor
```

## Flujo de Aprobación de Documentos

### Para Rescatista:

```
1. Rescatista sube documento
   ↓
2. Estado: pending
   ↓
3. Espera revisión del supervisor
   ↓
4. Supervisor revisa y decide:
   ├─ Aprobar → Estado: approved, locked: true
   │            ↓
   │            Documento inmutable
   │            (no se puede eliminar ni modificar)
   │
   └─ Rechazar → Estado: rejected, locked: false
                 ↓
                 Rescatista puede:
                 ├─ Ver motivo de rechazo
                 ├─ Eliminar documento
                 └─ Subir nuevo documento
```

### Para Supervisor:

```
1. Supervisor accede al dashboard
   ↓
2. Ve todos los documentos (filtros disponibles)
   ↓
3. Selecciona documento pendiente
   ↓
4. Visualiza el archivo
   ↓
5. Decide:
   ├─ Aprobar
   │   ↓
   │   Documento queda locked: true
   │   Estado: approved
   │
   └─ Rechazar
       ↓
       Debe ingresar motivo (obligatorio)
       ↓
       Documento queda locked: false
       Estado: rejected
```

## Estados de Documentos

```
┌─────────┐
│ pending │ ← Estado inicial
└────┬────┘
     │
     ├─────────────────┐
     ↓                 ↓
┌──────────┐      ┌──────────┐
│approved  │      │rejected  │
│locked:true│      │locked:false│
└──────────┘      └────┬─────┘
                       │
                       ↓
              Puede eliminarse
              Puede reemplazarse
```

## Permisos por Rol

### Rescatista:
- ✅ Ver sus propios documentos
- ✅ Subir documentos (cuenta_cobro, incapacidad)
- ✅ Ver estado de documentos
- ✅ Ver motivo de rechazo
- ✅ Eliminar documentos rechazados
- ✅ Reemplazar documentos rechazados
- ❌ Ver documentos de otros usuarios
- ❌ Aprobar/rechazar documentos
- ❌ Modificar documentos aprobados

### Supervisor:
- ✅ Ver todos los documentos
- ✅ Filtrar por tipo y estado
- ✅ Visualizar archivos
- ✅ Aprobar documentos
- ✅ Rechazar documentos (con motivo obligatorio)
- ❌ Subir documentos
- ❌ Eliminar documentos
- ❌ Modificar documentos aprobados

## Flujo de Navegación

```
Landing Page (Público)
    │
    ├─ Servicios
    ├─ Quiénes Somos
    ├─ Contacto
    └─ Login
        │
        ├─ Dashboard Rescatista
        │   ├─ Subir Documento
        │   ├─ Ver Documentos (filtros)
        │   └─ Gestionar Documentos Rechazados
        │
        └─ Dashboard Supervisor
            ├─ Ver Todos los Documentos (filtros)
            ├─ Visualizar Archivos
            └─ Aprobar/Rechazar
```

## Seguridad y Validaciones

### Al Subir Documento:
1. Validar que el usuario esté autenticado
2. Validar tipo de archivo (PDF, JPG, PNG)
3. Validar tamaño (máx. 10MB)
4. Crear documento con estado `pending`
5. Subir a Storage con ruta: `documents/{userId}/{type}/{fileName}`

### Al Aprobar:
1. Validar que el usuario sea supervisor
2. Actualizar estado a `approved`
3. Establecer `locked: true`
4. Registrar `reviewedBy` y `reviewedAt`

### Al Rechazar:
1. Validar que el usuario sea supervisor
2. Validar que se proporcione motivo (obligatorio)
3. Actualizar estado a `rejected`
4. Establecer `locked: false`
5. Registrar motivo, `reviewedBy` y `reviewedAt`

### Al Eliminar:
1. Validar que el usuario sea el propietario
2. Validar que el estado sea `rejected`
3. Validar que `locked: false`
4. Eliminar de Storage
5. Eliminar de Firestore
