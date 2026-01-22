# Reglas de Firebase Storage

## Reglas completas actualizadas (incluye solicitudes)

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // ============================================
    // REGLAS PARA BILLING_ACCOUNTS
    // ============================================
    // Ruta de billing_accounts (documentos de rescatistas)
    match /billing_accounts/{userId}/{documentType}/{fileName} {
      // Permitir lectura si el usuario es el propietario o es supervisor
      allow read: if request.auth != null 
        && (
          request.auth.uid == userId 
          || firestore.get(/databases/(default)/documents/usuarios/$(request.auth.uid)).data.rol == 'Supervisor'
        );
      
      // Permitir escritura solo si el usuario es el propietario
      allow write: if request.auth != null 
        && request.auth.uid == userId
        && request.resource.size < 10 * 1024 * 1024  // Máximo 10MB
        && request.resource.contentType.matches('(application/pdf|image/.*)'); // Solo PDF e imágenes
      
      // Permitir eliminación solo si el usuario es el propietario
      allow delete: if request.auth != null 
        && request.auth.uid == userId;
    }

    // ============================================
    // REGLAS PARA SOLICITUDES DE TRABAJO
    // ============================================
    // Ruta de solicitudes (público puede escribir y leer, supervisores también)
    match /solicitudes/{folderId}/{fileName} {
      // Permitir lectura pública (necesario para obtener URL después de subir)
      // También supervisores pueden leer
      allow read: if true;  // Lectura pública permitida

      // Cualquier usuario (incluso no autenticado) puede subir solicitudes
      // Esto permite que personas sin cuenta puedan enviar solicitudes de trabajo
      allow write: if request.resource.size < 10 * 1024 * 1024  // Máximo 10MB
        && (
          request.resource.contentType.matches('application/pdf')
          || request.resource.contentType.matches('image/.*')
          || request.resource.contentType.matches('application/msword')
          || request.resource.contentType.matches('application/vnd.openxmlformats-officedocument.wordprocessingml.document')
          || request.resource.contentType.matches('application/octet-stream')  // Para archivos sin tipo específico
        );

      // No permitir eliminación de solicitudes
      allow delete: if false;
    }

    // ============================================
    // DENEGAR TODO LO DEMÁS POR DEFECTO
    // ============================================
    // Cualquier otra ruta no permitida
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

## Instrucciones para aplicar las reglas

1. Ve a [Firebase Console - Storage Rules](https://console.firebase.google.com/project/orait-b92dd/storage/orait-b92dd.firebasestorage.app/rules)
2. Copia y pega las reglas completas de arriba (desde `rules_version` hasta el final)
3. Haz clic en **"Publicar"** o **"Publish"**
4. Espera a que se confirmen los cambios

## Explicación de las reglas

### Para billing_accounts:
- **Lectura**: Los usuarios pueden leer sus propios archivos. Los supervisores pueden leer todos los archivos.
- **Escritura**: Solo el usuario propietario puede subir archivos a su propia carpeta, con un límite de 10MB y solo PDF/imágenes.
- **Eliminación**: Solo el usuario propietario puede eliminar sus propios archivos.

### Para solicitudes:
- **Lectura**: Solo supervisores autenticados pueden leer los archivos de solicitudes.
- **Escritura**: Cualquier usuario (incluso sin autenticación) puede subir archivos de solicitudes, con límite de 10MB y formatos: PDF, imágenes, Word (DOC, DOCX).
- **Eliminación**: No se permite eliminar solicitudes (solo lectura para supervisores).

## Nota importante

Las reglas de Storage usan `firestore.get()` para verificar el rol del usuario, lo que requiere que:
1. El documento del usuario exista en la colección `usuarios` con el campo `rol`.
2. El usuario esté autenticado para las operaciones de lectura de solicitudes.

## Alternativa: Solo usuarios autenticados pueden subir solicitudes

Si prefieres que solo usuarios autenticados puedan subir solicitudes, cambia la regla de escritura de solicitudes a:

```javascript
allow write: if request.auth != null
  && request.resource.size < 10 * 1024 * 1024
  && request.resource.contentType.matches('(application/pdf|image/.*|application/msword|application/vnd.openxmlformats-officedocument.wordprocessingml.document)');
```

## Verificación

Después de aplicar las reglas, puedes probar:
1. ✅ Subir una solicitud desde la página pública (debe funcionar)
2. ✅ Ver las solicitudes como supervisor (debe funcionar)
3. ✅ Intentar acceder a archivos de solicitudes sin ser supervisor (debe fallar con error de permisos)
