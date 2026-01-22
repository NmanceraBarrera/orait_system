# Reglas de Seguridad de Firestore

## ⚠️ IMPORTANTE: Si usas App Móvil y Web

Si necesitas reglas compatibles con ambas plataformas, ve a `FIRESTORE_RULES_ACTUALIZADAS_CON_SOLICITUDES.md` para ver las reglas adaptadas.

## Reglas detalladas (solo para referencia)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Colección de usuarios
    match /usuarios/{userId} {
      // Permitir lectura si el usuario está autenticado y:
      // - El ID del documento es su UID, O
      // - El documento tiene un campo uid que coincide con su UID
      allow read: if request.auth != null 
        && (
          request.auth.uid == userId 
          || resource.data.uid == request.auth.uid
        );
      
      // Solo se puede crear durante el registro (requiere autenticación)
      allow create: if request.auth != null;
      
      // Solo el usuario puede actualizar su propio documento (excepto el rol)
      allow update: if request.auth != null 
        && (
          request.auth.uid == userId 
          || resource.data.uid == request.auth.uid
        )
        && (!request.resource.data.diff(resource.data).affectedKeys().hasAny(['rol']));
      
      // No se permite eliminar usuarios
      allow delete: if false;
    }
    
    // Colección de billing_accounts con subcolecciones
    match /billing_accounts/{userId} {
      // Permitir lectura del documento principal si el usuario es el propietario o supervisor
      allow read: if request.auth != null 
        && (
          request.auth.uid == userId 
          || get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.rol == 'Supervisor'
        );
      
      // Subcolección de cuentas de cobro
      match /cuentas/{documentId} {
        // Rescatistas solo pueden leer sus propias cuentas
        // Supervisores pueden leer todas las cuentas
        allow read: if request.auth != null 
          && (
            userId == request.auth.uid 
            || get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.rol == 'Supervisor'
          );
        
        // Solo rescatistas pueden crear cuentas (sus propias)
        allow create: if request.auth != null 
          && userId == request.auth.uid
          && request.resource.data.status == 'pending'
          && request.resource.data.locked == false;
        
        // Solo supervisores pueden actualizar (aprobar/rechazar)
        allow update: if request.auth != null 
          && get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.rol == 'Supervisor'
          && (
            (request.resource.data.status == 'approved' && request.resource.data.locked == true)
            ||
            (request.resource.data.status == 'rejected' && request.resource.data.rejectionReason != null)
          );
        
        // Solo rescatistas pueden eliminar sus propias cuentas rechazadas
        allow delete: if request.auth != null 
          && userId == request.auth.uid
          && resource.data.status == 'rejected'
          && resource.data.locked == false;
      }
      
      // Subcolección de incapacidades
      match /incapacidades/{documentId} {
        // Rescatistas solo pueden leer sus propias incapacidades
        // Supervisores pueden leer todas las incapacidades
        allow read: if request.auth != null 
          && (
            userId == request.auth.uid 
            || get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.rol == 'Supervisor'
          );
        
        // Solo rescatistas pueden crear incapacidades (sus propias)
        allow create: if request.auth != null 
          && userId == request.auth.uid
          && request.resource.data.status == 'pending'
          && request.resource.data.locked == false;
        
        // Solo supervisores pueden actualizar (aprobar/rechazar)
        allow update: if request.auth != null 
          && get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.rol == 'Supervisor'
          && (
            (request.resource.data.status == 'approved' && request.resource.data.locked == true)
            ||
            (request.resource.data.status == 'rejected' && request.resource.data.rejectionReason != null)
          );
        
        // Solo rescatistas pueden eliminar sus propias incapacidades rechazadas
        allow delete: if request.auth != null 
          && userId == request.auth.uid
          && resource.data.status == 'rejected'
          && resource.data.locked == false;
      }
    }
    
    // ============================================
    // COLECCIÓN DE SOLICITUDES DE TRABAJO
    // ============================================
    match /solicitudes/{solicitudId} {
      // Cualquier usuario (incluso no autenticado) puede crear solicitudes
      allow create: if request.resource.data.nombre is string
        && request.resource.data.createdAt is timestamp
        && request.resource.data.status == 'pendiente';
      
      // Solo supervisores pueden leer las solicitudes
      allow read: if request.auth != null
        && get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.rol == 'Supervisor';
      
      // Solo supervisores pueden actualizar (para cambiar el status)
      allow update: if request.auth != null
        && get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.rol == 'Supervisor';
      
      // No permitir eliminación (o solo supervisores si es necesario)
      allow delete: if false;
    }
  }
}
```

## Reglas de Storage

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Ruta de billing_accounts
    match /billing_accounts/{userId}/{documentType}/{fileName} {
      // El usuario propietario puede leer su archivo
      allow read: if request.auth != null && request.auth.uid == userId;
      
      // Supervisores pueden leer todos los archivos
      allow read: if request.auth != null 
        && firestore.get(/databases/(default)/documents/usuarios/$(request.auth.uid)).data.rol == 'Supervisor';
      
      // Solo el usuario propietario puede subir archivos
      allow write: if request.auth != null 
        && request.auth.uid == userId
        && request.resource.size < 10 * 1024 * 1024; // Máximo 10MB
        && request.resource.contentType.matches('(application/pdf|image/.*)'); // Solo PDF e imágenes
      
      // Solo el usuario propietario puede eliminar sus propios archivos
      allow delete: if request.auth != null 
        && request.auth.uid == userId;
    }
  }
}
```

## Instrucciones de Implementación

1. Ve a la consola de Firebase: https://console.firebase.google.com
2. Selecciona tu proyecto
3. Ve a **Firestore Database** > **Rules**
4. Copia y pega las reglas de Firestore
5. Ve a **Storage** > **Rules**
6. Copia y pega las reglas de Storage
7. Publica las reglas haciendo clic en **Publish**

## Notas Importantes

- Las reglas verifican que los usuarios solo puedan acceder a sus propios documentos
- Los supervisores tienen acceso completo de lectura
- Los documentos aprobados quedan bloqueados (locked = true) y no pueden ser modificados
- Los documentos rechazados pueden ser eliminados por el rescatista
- El tamaño máximo de archivo es 10MB
