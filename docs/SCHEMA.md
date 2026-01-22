# Esquema de Base de Datos Firestore

## Colección: `users`

Documento que almacena la información de los usuarios autenticados.

```typescript
{
  uid: string;              // ID del usuario (coincide con Firebase Auth UID)
  email: string;            // Email del usuario
  displayName?: string;     // Nombre para mostrar (opcional)
  role: 'rescatista' | 'supervisor';  // Rol del usuario
  createdAt: Timestamp;     // Fecha de creación
}
```

### Ejemplo:

```json
{
  "email": "rescatista@example.com",
  "displayName": "Juan Pérez",
  "role": "rescatista",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

## Colección: `billing_accounts`

Colección principal que almacena documentos por usuario. Cada documento tiene como ID el `uid` del usuario.

### Estructura:

```
billing_accounts/
  {userId}/                    // ID del documento = UID del usuario
    cuentas/                    // Subcolección de cuentas de cobro
      {documentId}/
        fileName: string
        fileUrl: string
        storagePath: string
        status: 'pending' | 'approved' | 'rejected'
        rejectionReason: string | null
        locked: boolean
        createdAt: Timestamp
        updatedAt: Timestamp
        reviewedBy?: string
        reviewedAt?: Timestamp
    incapacidades/              // Subcolección de incapacidades
      {documentId}/
        fileName: string
        fileUrl: string
        storagePath: string
        status: 'pending' | 'approved' | 'rejected'
        rejectionReason: string | null
        locked: boolean
        createdAt: Timestamp
        updatedAt: Timestamp
        reviewedBy?: string
        reviewedAt?: Timestamp
```

### Ejemplo de documento en subcolección `cuentas`:

```json
{
  "fileName": "cuenta_cobro_enero_2024.pdf",
  "fileUrl": "https://firebasestorage.googleapis.com/...",
  "storagePath": "billing_accounts/abc123xyz/cuenta_cobro/cuenta_cobro_abc123xyz_1234567890_cuenta_cobro_enero_2024.pdf",
  "status": "pending",
  "rejectionReason": null,
  "locked": false,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

## Estructura de Storage

```
billing_accounts/
  {userId}/
    cuenta_cobro/
      cuenta_cobro_{userId}_{timestamp}_{fileName}
    incapacidad/
      incapacidad_{userId}_{timestamp}_{fileName}
```

## Índices Requeridos

Para optimizar las consultas, se recomienda crear los siguientes índices compuestos en Firestore:

1. **Subcolección: billing_accounts/{userId}/cuentas**
   - Campo: `status` (Ascendente) + `createdAt` (Descendente)
   - Uso: Filtrar cuentas de cobro por estado

2. **Subcolección: billing_accounts/{userId}/incapacidades**
   - Campo: `status` (Ascendente) + `createdAt` (Descendente)
   - Uso: Filtrar incapacidades por estado

**Nota:** Los índices para subcolecciones se crean automáticamente cuando Firebase detecta que son necesarios, o puedes crearlos manualmente desde el error que aparece en la consola.

## Flujo de Estados

```
pending → approved (locked: true)
  ↓
rejected (locked: false) → [rescatista puede eliminar] → [puede subir nuevo]
```

- **pending**: Estado inicial cuando se sube un documento
- **approved**: Documento aprobado por supervisor, queda bloqueado
- **rejected**: Documento rechazado, puede ser eliminado y reemplazado
