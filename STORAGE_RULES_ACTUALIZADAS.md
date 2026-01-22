# Reglas de Firebase Storage - Actualizadas

## Cómo aplicar las reglas:

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: `orait-b92dd`
3. En el menú lateral, ve a **Storage**
4. Haz clic en la pestaña **Rules**
5. Copia y pega las siguientes reglas
6. Haz clic en **Publish**

## Reglas completas:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // ============================================
    // REGLAS PARA BILLING_ACCOUNTS
    // ============================================
    // Ruta de billing_accounts (documentos de rescatistas)
    match /billing_accounts/{userId}/{documentType}/{fileName} {
      // El usuario propietario puede leer su archivo
      allow read: if request.auth != null && request.auth.uid == userId;

      // Supervisores pueden leer todos los archivos
      allow read: if request.auth != null
        && firestore.get(/databases/(default)/documents/usuarios/$(request.auth.uid)).data.rol == 'Supervisor';

      // Solo el usuario propietario puede subir archivos
      allow write: if request.auth != null
        && request.auth.uid == userId
        && request.resource.size < 10 * 1024 * 1024  // Máximo 10MB
        && request.resource.contentType.matches('(application/pdf|image/.*)'); // Solo PDF e imágenes

      // Solo el usuario propietario puede eliminar sus propios archivos
      allow delete: if request.auth != null
        && request.auth.uid == userId;
    }

    // ============================================
    // REGLAS PARA SOLICITUDES (NUEVO)
    // ============================================
    // Ruta de solicitudes de trabajo (público puede escribir, supervisores pueden leer)
    match /solicitudes/{timestamp}/{fileName} {
      // Cualquier usuario autenticado puede leer (para supervisores)
      // También permitir lectura pública si es necesario para previews
      allow read: if request.auth != null
        && firestore.get(/databases/(default)/documents/usuarios/$(request.auth.uid)).data.rol == 'Supervisor';

      // Cualquier usuario (incluso no autenticado) puede subir solicitudes
      // Esto permite que personas sin cuenta puedan enviar solicitudes de trabajo
      allow write: if request.resource.size < 10 * 1024 * 1024  // Máximo 10MB
        && request.resource.contentType.matches('(application/pdf|image/.*|application/msword|application/vnd.openxmlformats-officedocument.wordprocessingml.document)'); // PDF, imágenes, Word

      // No permitir eliminación de solicitudes (solo lectura para supervisores)
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

## Explicación de las reglas para solicitudes:

### Lectura (`allow read`):
- Solo supervisores autenticados pueden leer los archivos de solicitudes
- Verifica el rol del usuario en la colección `usuarios`

### Escritura (`allow write`):
- **Cualquier usuario puede subir** (incluso sin autenticación)
- Esto permite que personas sin cuenta puedan enviar solicitudes
- Límite de tamaño: 10MB por archivo
- Tipos permitidos: PDF, imágenes (JPG, PNG, etc.), Word (DOC, DOCX)

### Eliminación (`allow delete`):
- No se permite eliminar solicitudes (solo lectura para supervisores)

## Nota importante:

Si quieres que **solo usuarios autenticados** puedan subir solicitudes, cambia la regla de escritura a:

```javascript
allow write: if request.auth != null
  && request.resource.size < 10 * 1024 * 1024
  && request.resource.contentType.matches('(application/pdf|image/.*|application/msword|application/vnd.openxmlformats-officedocument.wordprocessingml.document)');
```

## Verificación:

Después de aplicar las reglas, puedes probar:
1. Subir una solicitud desde la página pública (debe funcionar)
2. Ver las solicitudes como supervisor (debe funcionar)
3. Intentar acceder a archivos de solicitudes sin ser supervisor (debe fallar)
