<div align="center">

# Gastolens

**Finanzas personales sin fricción.**
Apuntar un gasto debería costar lo que cuesta decirlo. Lo escribes o lo dices,
y la app hace el resto.

[**gastolens.vercel.app →**](https://gastolens.vercel.app)

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-38B2AC?style=flat-square&logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=flat-square&logo=supabase&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=flat-square&logo=pwa&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)

🇬🇧 [English version](README.md)

</div>

---

## La idea

Todas las apps de gastos piden importe, categoría y fecha en tres campos
distintos. La mayoría de la gente lo abandona en la segunda semana. Gastolens
acepta una frase:

> *"cena con amigos 45 euros"*

y extrae **importe → 45**, **moneda → EUR**, **categoría → restaurantes**,
**fecha → hoy**. Por voz con la Web Speech API, o escrito. Cero
infraestructura, instalable como PWA, funciona sin conexión y sincroniza entre
dispositivos.

## El parser

Un parser hecho a mano, sin depender de la API de nadie:

- **Números en palabras**: *"treinta y cinco pavos"* se resuelve como 35,00.
- **Jerga del dinero**: *pavos*, *pelas*, *cholos*, *telas*, *eurazos* son euros.
- **Tres divisas**, convertidas a euros al cambio medio anual de 2024: EUR,
  **lei** rumanos (RON, 0,2012 €) y **dólares** (USD, 0,9259 €) — efecto
  secundario de pasar un año de Erasmus en Bucarest.
- **Categoría inferida** desde una taxonomía hecha a mano de comercios
  españoles y palabras del día a día (`src/utils/categoryConfig.js`): *Alcampo*
  es alimentación y *Alsa* es transporte sin que haya que decírselo.

## Importar un extracto del banco

Subes un CSV o un Excel (los formatos de BBVA y Revolut están mapeados) y las
transacciones van a **Gemini 1.5 Flash por lotes**: una llamada por lote, con
la taxonomía de categorías como esquema de respuesta para que el modelo no
pueda inventarse etiquetas. Si no hay clave, o la llamada falla, **clasifican
las reglas locales**. La importación nunca depende de que el modelo esté
disponible.

La app se registra además como **Web Share Target**, así que el extracto se
puede compartir directamente desde la app del banco a Gastolens.

## Dónde acabó

El motor financiero escrito aquí —el parser, la taxonomía de categorías, las
utilidades de fechas y las métricas— se reutilizó después como módulo nativo
dentro de [**Rentlog**](https://github.com/JaimeMoralesCastro/rentlog), donde los
anfitriones apuntan los gastos de sus pisos de la misma forma.

## Arrancar en local

```bash
npm install
npm run dev
```

Supabase se usa para autenticación y sincronización. Copia `.env.example` a
`.env` y rellena:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

La clave de Gemini la introduce el usuario dentro de la app, no está en el
repositorio; sin ella, las importaciones usan las reglas locales.

```bash
npm run build       # genera los iconos de la PWA y compila
```

## Estructura

```
src/
├── utils/
│   ├── nlpParser.js        parser de gastos en lenguaje natural y por voz
│   ├── categoryConfig.js   taxonomía de categorías y diccionario de comercios
│   ├── geminiClassifier.js clasificación por lotes con fallback local
│   └── dateHelpers.js
├── components/   entrada de gastos, histórico, detalle, gráficas, importación, auth
├── hooks/        useExpenses, useSpeechRecognition, useLocalStorage
├── contexts/     AuthContext (Supabase)
└── lib/          cliente de Supabase
public/           manifest, service worker, iconos generados
```

## Licencia

[MIT](LICENSE) © Jaime Morales Castro
