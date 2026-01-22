# Guía de Configuración Inicial

## Pasos para Configurar el Proyecto

### 1. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key_aqui
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_proyecto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
```

**Dónde encontrar estos valores:**
1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Selecciona tu proyecto
3. Ve a ⚙️ Configuración del proyecto
4. En "Tus aplicaciones", selecciona la app web o crea una nueva
5. Copia los valores de configuración

### 2. Configurar Firebase Authentication

1. En Firebase Console, ve a **Authentication**
2. Habilita el proveedor **Email/Password**
3. Crea usuarios de prueba:
   - Ve a la pestaña **Users**
   - Haz clic en **Add user**
   - Ingresa email y contraseña
   - Guarda el UID del usuario

### 3. Crear Usuarios en Firestore

Para cada usuario creado en Authentication, debes crear un documento en Firestore:

1. Ve a **Firestore Database** en Firebase Console
2. Crea la colección `users` si no existe
3. Crea un documento con el **UID del usuario** como ID del documento
4. Agrega los siguientes campos:

```json
{
  "email": "usuario@example.com",
  "displayName": "Nombre del Usuario",
  "role": "Rescatista",  // o "Supervisor"
  "createdAt": "2024-01-15T10:30:00Z"
}
```

**Ejemplo para Rescatista:**
```json
{
  "email": "rescatista@example.com",
  "displayName": "Juan Pérez",
  "role": "Rescatista",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

**Ejemplo para Supervisor:**
```json
{
  "email": "supervisor@example.com",
  "displayName": "María García",
  "role": "Supervisor",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### 4. Configurar Reglas de Seguridad

#### Firestore Rules

1. Ve a **Firestore Database** > **Rules**
2. Copia el contenido de `FIRESTORE_RULES.md`
3. Pega las reglas en el editor
4. Haz clic en **Publish**

#### Storage Rules

1. Ve a **Storage** > **Rules**
2. Copia las reglas de Storage de `FIRESTORE_RULES.md`
3. Pega las reglas en el editor
4. Haz clic en **Publish**

### 5. Configurar Firebase Storage

1. Ve a **Storage** en Firebase Console
2. Asegúrate de que esté habilitado
3. Las reglas de seguridad ya están configuradas en el paso anterior

### 6. Crear Índices en Firestore (Opcional pero Recomendado)

Para optimizar las consultas, crea estos índices compuestos:

1. Ve a **Firestore Database** > **Indexes**
2. Haz clic en **Create Index**
3. Crea los siguientes índices:

**Índice 1:**
- Colección: `documents`
- Campos:
  - `userId` (Ascendente)
  - `createdAt` (Descendente)

**Índice 2:**
- Colección: `documents`
- Campos:
  - `type` (Ascendente)
  - `status` (Ascendente)
  - `createdAt` (Descendente)

**Índice 3:**
- Colección: `documents`
- Campos:
  - `status` (Ascendente)
  - `createdAt` (Descendente)

### 7. Ejecutar el Proyecto

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

### 8. Probar el Sistema

1. **Como Rescatista:**
   - Inicia sesión con credenciales de rescatista
   - Deberías ver el Dashboard Rescatista
   - Intenta subir un documento
   - Verifica que aparezca en estado "Pendiente"

2. **Como Supervisor:**
   - Inicia sesión con credenciales de supervisor
   - Deberías ver el Dashboard Supervisor
   - Deberías ver todos los documentos
   - Intenta aprobar o rechazar un documento

## Solución de Problemas

### Error: "Firebase no está inicializado"
- Verifica que las variables de entorno estén correctamente configuradas
- Asegúrate de que el archivo `.env.local` esté en la raíz del proyecto
- Reinicia el servidor de desarrollo después de agregar variables de entorno

### Error: "auth/invalid-api-key"
- Verifica que `NEXT_PUBLIC_FIREBASE_API_KEY` sea correcta
- Asegúrate de que no haya espacios extra en el archivo `.env.local`

### No puedo iniciar sesión
- Verifica que el usuario exista en Firebase Authentication
- Verifica que el documento del usuario exista en Firestore con el rol correcto
- El UID en Firestore debe coincidir con el UID en Authentication

### No veo documentos en el dashboard
- Verifica las reglas de Firestore
- Asegúrate de que los documentos tengan la estructura correcta
- Verifica que el usuario tenga el rol correcto

### No puedo subir archivos
- Verifica las reglas de Storage
- Asegúrate de que el tamaño del archivo sea menor a 10MB
- Verifica que el formato sea PDF, JPG o PNG

## Próximos Pasos

Una vez configurado:

1. Personaliza los textos y estilos según tu marca
2. Agrega más tipos de documentos si es necesario
3. Configura notificaciones por email (opcional)
4. Implementa tests (recomendado)
5. Configura CI/CD para despliegue automático

## Soporte

Si encuentras problemas, revisa:
- `README.md` - Documentación general
- `docs/ARCHITECTURE.md` - Arquitectura del sistema
- `docs/SCHEMA.md` - Esquema de base de datos
- `docs/FLOW_DIAGRAM.md` - Diagramas de flujo
- `FIRESTORE_RULES.md` - Reglas de seguridad
