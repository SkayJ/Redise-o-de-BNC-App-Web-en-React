# BNC App

Aplicación local de banca digital con datos simulados en LocalStorage.

## Requisitos

1. Clona el repositorio.
2. Entra al directorio del proyecto.
3. Instala dependencias con `npm install`.
4. Ejecuta la app en modo desarrollo con `npm run dev`.

## Ejecutar localmente

```bash
npm run dev
```

La aplicación se ejecuta con Vite y usa un store local para persistencia de cuentas, transacciones, notificaciones y solicitudes.

## Estructura clave

- `src/pages/`: pantallas principales de la banca.
- `src/lib/`: contexto de autenticación, tema y datos semilla.
- `src/api/localDB.js`: adaptador local de persistencia.

## Desarrollo

- El flujo de login y registro es local y simulado.
- Los cambios se almacenan en `localStorage` del navegador.
- No se requiere ninguna dependencia externa ni variables de entorno de plataforma.

## Verificar

```bash
npm run build
```

Si el entorno de ejecución no tiene Node/npm en el `PATH`, usa la terminal del proyecto donde estén disponibles esos comandos.

© 2026 Skay J | All Rights Reserved.
