# Índices Requeridos en Firestore

Para optimizar las consultas y evitar errores, necesitas crear los siguientes índices en Firestore.

## Índice 1: Para búsqueda de usuarios por campo `uid`

**Colección:** `usuarios`
**Campos:**
- `uid` (Ascending)

**Cómo crearlo:**
1. Ve a [Firebase Console - Indexes](https://console.firebase.google.com/project/orait-b92dd/firestore/indexes)
2. Haz clic en "Create Index"
3. Configura:
   - Collection ID: `usuarios`
   - Fields to index:
     - Field: `uid`, Order: Ascending
   - Query scope: Collection
4. Haz clic en "Create"

## Índice 2: Para cuentas de cobro con filtro de estado

**Colección:** `billing_accounts/{userId}/cuentas`
**Campos:**
- `status` (Ascending)
- `createdAt` (Descending)

**Cómo crearlo:**
1. Ve a [Firebase Console - Indexes](https://console.firebase.google.com/project/orait-b92dd/firestore/indexes)
2. Haz clic en "Create Index"
3. Configura:
   - Collection ID: `billing_accounts`
   - Subcollection: `cuentas`
   - Fields to index:
     - Field: `status`, Order: Ascending
     - Field: `createdAt`, Order: Descending
   - Query scope: Collection
4. Haz clic en "Create"

**Nota:** Este índice se crea automáticamente cuando Firebase detecta que es necesario. Puedes hacer clic en el enlace del error para crearlo.

## Índice 3: Para incapacidades con filtro de estado

**Colección:** `billing_accounts/{userId}/incapacidades`
**Campos:**
- `status` (Ascending)
- `createdAt` (Descending)

**Cómo crearlo:**
1. Ve a [Firebase Console - Indexes](https://console.firebase.google.com/project/orait-b92dd/firestore/indexes)
2. Haz clic en "Create Index"
3. Configura:
   - Collection ID: `billing_accounts`
   - Subcollection: `incapacidades`
   - Fields to index:
     - Field: `status`, Order: Ascending
     - Field: `createdAt`, Order: Descending
   - Query scope: Collection
4. Haz clic en "Create"

**Nota:** Este índice se crea automáticamente cuando Firebase detecta que es necesario. Puedes hacer clic en el enlace del error para crearlo.

## Notas Importantes

- Los índices pueden tardar varios minutos en crearse
- Mientras se crean, el sistema usará un método alternativo (más lento pero funcional)
- Una vez creados, las consultas serán mucho más rápidas
- Puedes ver el estado de los índices en la pestaña "Indexes" de Firestore

## Crear Índice desde el Error

Si ves un error que dice "The query requires an index", Firebase generalmente proporciona un enlace directo para crear el índice. Haz clic en ese enlace y se creará automáticamente.
