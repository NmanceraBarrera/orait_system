# Guía de Solución de Problemas

## Error: "No se encontró documento para el UID"

Este error ocurre cuando el sistema no puede encontrar el documento del usuario en Firestore. Sigue estos pasos para solucionarlo:

### 1. Verificar que el documento existe

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Selecciona tu proyecto: `orait-b92dd`
3. Ve a **Firestore Database**
4. Busca la colección `users`
5. Verifica que exista un documento con el campo `uid` que coincida con el UID del usuario

### 2. Verificar la estructura del documento

El documento debe tener esta estructura mínima:

```json
{
  "uid": "KJZ8xtszFjdVK74A8h0eJMWl8yt2",
  "correo": "usuario@example.com",
  "nombre": "Nombre del Usuario",
  "rol": "Rescatista"  // o "Supervisor"
}
```

**Importante:**
- El campo `uid` debe existir y coincidir exactamente con el UID del usuario en Firebase Authentication
- El campo `rol` debe tener el valor exacto: `"Rescatista"` o `"Supervisor"` (con mayúscula inicial)

### 3. Verificar las reglas de seguridad

Las reglas de Firestore deben permitir que el usuario lea su propio documento. Copia estas reglas en **Firestore Database > Rules**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // Permitir lectura si el usuario está autenticado y el documento es suyo
      // O si el documento tiene un campo uid que coincide con el UID del usuario
      allow read: if request.auth != null 
        && (
          request.auth.uid == userId 
          || resource.data.uid == request.auth.uid
        );
      
      allow create: if request.auth != null;
      allow update: if request.auth != null && request.auth.uid == userId;
      allow delete: if false;
    }
  }
}
```

### 4. Verificar el ID del documento

El documento puede tener dos estructuras:

**Opción A: El ID del documento es el UID**
```
users/
  └── KJZ8xtszFjdVK74A8h0eJMWl8yt2/
      └── { datos del usuario }
```

**Opción B: El ID del documento es diferente, pero tiene campo uid**
```
users/
  └── [algún-otro-id]/
      └── { 
            uid: "KJZ8xtszFjdVK74A8h0eJMWl8yt2",
            rol: "Rescatista",
            ...
          }
```

El código busca en ambos casos automáticamente.

### 5. Crear el documento si no existe

Si el documento no existe, créalo manualmente:

1. Ve a Firestore Database
2. Selecciona la colección `users`
3. Haz clic en "Add document"
4. Si el ID del documento es el UID:
   - En "Document ID", ingresa el UID del usuario
5. Agrega los campos:
   - `uid` (string): El UID del usuario
   - `correo` (string): El email del usuario
   - `nombre` (string): Nombre del usuario
   - `rol` (string): "Rescatista" o "Supervisor"
   - `status` (string, opcional): "Activo"
   - Otros campos opcionales según necesites

### 6. Verificar en la consola del navegador

Abre la consola del navegador (F12) y revisa los logs. Deberías ver:

```
Buscando datos del usuario con UID: KJZ8xtszFjdVK74A8h0eJMWl8yt2
Búsqueda por ID del documento: KJZ8xtszFjdVK74A8h0eJMWl8yt2 Existe: false
Buscando por campo uid...
Resultados de búsqueda por campo uid: X documentos encontrados
```

Esto te ayudará a entender qué está pasando.

### 7. Problemas comunes

**Problema: "permission-denied"**
- **Solución**: Verifica y actualiza las reglas de seguridad de Firestore

**Problema: El campo `rol` no existe**
- **Solución**: Asegúrate de que el documento tenga el campo `rol` con valor "Rescatista" o "Supervisor"

**Problema: El campo `uid` no coincide**
- **Solución**: Verifica que el campo `uid` en Firestore coincida exactamente con el UID en Firebase Authentication

**Problema: El documento existe pero no se encuentra**
- **Solución**: Verifica que estés buscando en la colección correcta (`users`) y que el proyecto de Firebase sea el correcto

## Verificar configuración de Firebase

Asegúrate de que las variables de entorno estén correctas en `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBKRmYGrOYep_BWvQQK4d7wTqew8QHuJ4k
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=orait-b92dd.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=orait-b92dd
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=orait-b92dd.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=997818815258
NEXT_PUBLIC_FIREBASE_APP_ID=1:997818815258:web:76a92932837e5dab5d92a3
```

## Contacto

Si el problema persiste después de seguir estos pasos, verifica:
1. Los logs en la consola del navegador
2. Las reglas de seguridad de Firestore
3. Que el usuario exista en Firebase Authentication
4. Que el documento exista en Firestore con la estructura correcta
