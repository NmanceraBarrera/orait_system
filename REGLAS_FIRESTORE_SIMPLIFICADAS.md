# Reglas de Firestore Simplificadas - TEMPORALES PARA DEBUG

⚠️ **ADVERTENCIA**: Estas reglas son temporales y menos restrictivas para permitir el debug. Una vez que funcione, deberías usar las reglas más restrictivas.

## Reglas TEMPORALES para la colección `users`

Copia estas reglas en Firebase Console > Firestore Database > Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Colección de usuarios - REGLAS TEMPORALES PARA DEBUG
    match /users/{userId} {
      // Permitir lectura a cualquier usuario autenticado (TEMPORAL)
      allow read: if request.auth != null;
      
      // Permitir creación (TEMPORAL)
      allow create: if request.auth != null;
      
      // Permitir actualización (TEMPORAL)
      allow update: if request.auth != null;
      
      // No permitir eliminación
      allow delete: if false;
    }
    
    // Colección de documentos
    match /documents/{documentId} {
      // Permitir lectura si el usuario está autenticado (TEMPORAL)
      allow read: if request.auth != null;
      
      // Permitir creación (TEMPORAL)
      allow create: if request.auth != null;
      
      // Permitir actualización (TEMPORAL)
      allow update: if request.auth != null;
      
      // Permitir eliminación solo si el usuario es el propietario (TEMPORAL)
      allow delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

## Pasos para aplicar:

1. Ve a [Firebase Console](https://console.firebase.google.com/project/orait-b92dd/firestore/rules)
2. Copia y pega las reglas de arriba
3. Haz clic en "Publish"
4. Prueba el login de nuevo
5. Si funciona, luego puedes aplicar las reglas más restrictivas de `FIRESTORE_RULES.md`

## Crear Índice para campo `uid`

1. Ve a [Firebase Console - Indexes](https://console.firebase.google.com/project/orait-b92dd/firestore/indexes)
2. Haz clic en "Create Index"
3. Configura:
   - Collection ID: `users`
   - Fields to index:
     - Field: `uid`, Order: Ascending
   - Query scope: Collection
4. Haz clic en "Create"
5. Espera a que el índice se cree (puede tardar unos minutos)

## Verificar que el documento existe

1. Ve a [Firestore Database](https://console.firebase.google.com/project/orait-b92dd/firestore/data)
2. Selecciona la colección `users`
3. Busca un documento que tenga el campo `uid` con valor `KJZ8xtszFjdVK74A8h0eJMWl8yt2`
4. Verifica que el campo `rol` tenga el valor `"Supervisor"` (con mayúscula)
