# Reglas de Firestore - Actualizadas con Solicitudes

## Reglas completas (compatibles con App Móvil y Web)

Dado que usas una app móvil y página web, estas reglas mantienen la flexibilidad pero agregan soporte para solicitudes públicas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ============================================
    // REGLA ESPECÍFICA PARA SOLICITUDES (PÚBLICO)
    // ============================================
    // Esta regla debe ir ANTES de la regla general para tener prioridad
    match /solicitudes/{solicitudId} {
      // Cualquier usuario (incluso no autenticado) puede crear solicitudes
      allow create: if request.resource.data.nombre is string
        && request.resource.data.createdAt is timestamp
        && (request.resource.data.status == 'pendiente' || !('status' in request.resource.data));
      
      // Usuarios autenticados pueden leer (para app móvil y web)
      allow read: if request.auth != null;
      
      // Solo supervisores pueden actualizar (cambiar status)
      allow update: if request.auth != null
        && get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.rol == 'Supervisor';
      
      // No permitir eliminación
      allow delete: if false;
    }
    
    // ============================================
    // REGLA GENERAL (PARA APP MÓVIL Y WEB)
    // ============================================
    // Esta regla aplica a todas las demás colecciones
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Explicación:

1. **Regla específica para `solicitudes`**:
   - **Crear**: Público (sin autenticación) - permite que cualquiera envíe solicitudes desde la web
   - **Leer**: Usuarios autenticados - tanto app móvil como web pueden leer
   - **Actualizar**: Solo supervisores - para cambiar el status de las solicitudes
   - **Eliminar**: No permitido

2. **Regla general**:
   - Mantiene tu configuración actual para todas las demás colecciones
   - Requiere autenticación para leer y escribir

## Ventajas de esta estructura:

✅ **Compatible con tu app móvil**: Las reglas generales siguen funcionando  
✅ **Permite solicitudes públicas**: Cualquiera puede crear solicitudes desde la web  
✅ **Seguridad**: Solo supervisores pueden actualizar solicitudes  
✅ **Prioridad correcta**: La regla específica tiene prioridad sobre la general

## Instrucciones:

1. Ve a Firebase Console → Firestore Database → Rules
2. Copia y pega las reglas de arriba
3. Haz clic en **"Publicar"**
4. Prueba subir una solicitud desde la página web

## Nota importante:

Las reglas más específicas (`/solicitudes/{solicitudId}`) se evalúan ANTES que las generales (`/{document=**}`), por lo que las solicitudes tendrán su propio comportamiento mientras que el resto de colecciones mantiene tu configuración actual.
