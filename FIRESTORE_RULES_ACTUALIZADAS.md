# Reglas de Seguridad de Firestore - ACTUALIZADAS

## IMPORTANTE: Estas reglas permiten búsqueda por campo `uid`

Copia estas reglas en Firebase Console > Firestore Database > Rules

## Colección: `users`

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Colección de usuarios
    match /users/{userId} {
      // Permitir lectura si:
      // 1. El usuario está autenticado Y
      // 2. (El ID del documento es su UID O el documento tiene un campo uid que coincide)
      allow read: if request.auth != null 
        && (
          request.auth.uid == userId 
          || resource.data.uid == request.auth.uid
        );
      
      // Permitir creación si el usuario está autenticado
      allow create: if request.auth != null;
      
      // Permitir actualización si el usuario es el propietario (por ID o por campo uid)
      allow update: if request.auth != null 
        && (
          request.auth.uid == userId 
          || resource.data.uid == request.auth.uid
        );
      
      // No se permite eliminar usuarios
      allow delete: if false;
    }
    
    // Colección de documentos
    match /documents/{documentId} {
      // Rescatistas solo pueden leer sus propios documentos
      // Supervisores pueden leer todos los documentos
      allow read: if request.auth != null 
        && (
          resource.data.userId == request.auth.uid 
          || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.rol == 'Supervisor'
          || exists(/databases/$(database)/documents/users/$(request.auth.uid))
          && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.rol == 'Supervisor'
        );
      
      // Solo rescatistas pueden crear documentos (sus propios)
      allow create: if request.auth != null 
        && request.resource.data.userId == request.auth.uid
        && request.resource.data.status == 'pending'
        && request.resource.data.locked == false;
      
      // Solo supervisores pueden actualizar documentos (aprobar/rechazar)
      allow update: if request.auth != null 
        && (
          get(/databases/$(database)/documents/users/$(request.auth.uid)).data.rol == 'Supervisor'
          || exists(/databases/$(database)/documents/users/$(request.auth.uid))
          && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.rol == 'Supervisor'
        )
        && (
          // Al aprobar, debe establecer locked = true
          (request.resource.data.status == 'approved' && request.resource.data.locked == true)
          ||
          // Al rechazar, debe proporcionar rejectionReason
          (request.resource.data.status == 'rejected' && request.resource.data.rejectionReason != null)
        );
      
      // Solo rescatistas pueden eliminar sus propios documentos rechazados y no bloqueados
      allow delete: if request.auth != null 
        && resource.data.userId == request.auth.uid
        && resource.data.status == 'rejected'
        && resource.data.locked == false;
    }
  }
}
```

## Reglas de Storage

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Ruta de documentos
    match /documents/{userId}/{documentType}/{fileName} {
      // El usuario propietario puede leer su archivo
      allow read: if request.auth != null && request.auth.uid == userId;
      
      // Supervisores pueden leer todos los archivos
      allow read: if request.auth != null 
        && firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.rol == 'Supervisor';
      
      // Solo el usuario propietario puede subir archivos
      allow write: if request.auth != null 
        && request.auth.uid == userId
        && request.resource.size < 10 * 1024 * 1024; // Máximo 10MB
      
      // Solo el usuario propietario puede eliminar archivos rechazados
      allow delete: if request.auth != null 
        && request.auth.uid == userId
        && firestore.get(/databases/(default)/documents/documents/$(documentId)).data.status == 'rejected'
        && firestore.get(/databases/(default)/documents/documents/$(documentId)).data.locked == false;
    }
  }
}
```

## Crear Índice para búsqueda por campo `uid`

Si la búsqueda por campo `uid` no funciona, necesitas crear un índice:

1. Ve a Firebase Console > Firestore Database > Indexes
2. Haz clic en "Create Index"
3. Configura:
   - Collection ID: `users`
   - Fields to index:
     - Field: `uid`, Order: Ascending
   - Query scope: Collection
4. Haz clic en "Create"

## Notas Importantes

- Las reglas ahora permiten lectura cuando el campo `uid` coincide, incluso si el ID del documento es diferente
- Esto permite que el sistema funcione con documentos que tienen IDs diferentes al UID
- Asegúrate de crear el índice para optimizar las búsquedas por campo `uid`
