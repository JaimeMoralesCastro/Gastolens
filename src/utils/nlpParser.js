import { CATEGORIES } from './categoryConfig.js';

// ─── Números en palabras ────────────────────────────────────────────────────
const WORD_NUMS = {
  'cero': 0, 'un': 1, 'uno': 1, 'una': 1,
  'dos': 2, 'tres': 3, 'cuatro': 4, 'cinco': 5, 'seis': 6,
  'siete': 7, 'ocho': 8, 'nueve': 9, 'diez': 10,
  'once': 11, 'doce': 12, 'trece': 13, 'catorce': 14, 'quince': 15,
  'dieciséis': 16, 'dieciseis': 16, 'diecisiete': 17, 'dieciocho': 18, 'diecinueve': 19,
  'veinte': 20, 'veintiuno': 21, 'veintidós': 22, 'veintidos': 22,
  'veintitrés': 23, 'veintitres': 23, 'veinticuatro': 24, 'veinticinco': 25,
  'veintiséis': 26, 'veintiseis': 26, 'veintisiete': 27, 'veintiocho': 28, 'veintinueve': 29,
  'treinta': 30, 'cuarenta': 40, 'cincuenta': 50, 'sesenta': 60,
  'setenta': 70, 'ochenta': 80, 'noventa': 90,
  'cien': 100, 'ciento': 100,
  'doscientos': 200, 'doscientas': 200, 'trescientos': 300, 'trescientas': 300,
  'cuatrocientos': 400, 'cuatrocientas': 400, 'quinientos': 500, 'quinientas': 500,
  'seiscientos': 600, 'seiscientas': 600, 'setecientos': 700, 'setecientas': 700,
  'ochocientos': 800, 'ochocientas': 800, 'novecientos': 900, 'novecientas': 900,
  'mil': 1000,
};

// ─── Divisas ────────────────────────────────────────────────────────────────
// Tipo de cambio anual medio 2024 → 1 unidad = X EUR
const TO_EUR = {
  EUR: 1,
  RON: 0.2012,  // 4.97 RON/EUR media 2024
  USD: 0.9259,  // 1.08 USD/EUR media 2024
};

const CURRENCY_SYMBOL = { EUR: '€', RON: 'RON', USD: '$' };

const CURRENCY_DETECTORS = [
  { regex: /\b(?:leu|lei|leis|leus|ron)\b/i,       code: 'RON' },
  { regex: /(?:\$|\b(?:dólares?|dolares?)\b)/i,    code: 'USD' },
];

// Todas las palabras de dinero aceptadas para detectar la cantidad
const MONEY_WORD_SRC =
  '€|\\$|euros?|eurazos?|pavos?|pavo|cholos?|cholo|telas?|pelas?|' +
  'leu|lei|leis|leus|ron|dólares?|dolares?';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function detectCurrency(text) {
  for (const { regex, code } of CURRENCY_DETECTORS) {
    if (regex.test(text)) return code;
  }
  return 'EUR';
}

function normalizeNumbers(text) {
  let t = text.toLowerCase();

  // Ordenar palabras de mayor a menor longitud para evitar coincidencias parciales
  const words = Object.keys(WORD_NUMS).sort((a, b) => b.length - a.length);
  const wp = words.join('|');

  // "treinta y cinco" → "35"
  const compound = new RegExp(`\\b(${wp})\\s+y\\s+(${wp})\\b`, 'gi');
  t = t.replace(compound, (_, a, b) => {
    const va = WORD_NUMS[a.toLowerCase()];
    const vb = WORD_NUMS[b.toLowerCase()];
    return va !== undefined && vb !== undefined ? String(va + vb) : `${a} y ${b}`;
  });

  // "mil" aislado → 1000
  t = t.replace(/\bmil\b/gi, '1000');

  // Palabras numéricas individuales → dígitos
  const single = new RegExp(`\\b(${words.filter(w => w !== 'mil').join('|')})\\b`, 'gi');
  t = t.replace(single, m => {
    const v = WORD_NUMS[m.toLowerCase()];
    return v !== undefined ? String(v) : m;
  });

  return t;
}

function extractRawAmount(normalizedText) {
  const mw = MONEY_WORD_SRC;
  const patterns = [
    new RegExp(`(\\d{1,6}[.,]\\d{1,2})\\s*(?:${mw})`, 'i'),
    new RegExp(`(\\d{1,6})\\s*(?:${mw})`, 'i'),
    new RegExp(`(?:${mw})\\s*(\\d{1,6}[.,]\\d{1,2})`, 'i'),
    new RegExp(`(?:${mw})\\s*(\\d{1,6})`, 'i'),
    /\b(\d{1,6}[.,]\d{1,2})\b/,
  ];
  for (const p of patterns) {
    const m = normalizedText.match(p);
    if (m) return parseFloat(m[1].replace(',', '.'));
  }
  return 0;
}

// ─── Descripciones estandarizadas ────────────────────────────────────────────
const DESCRIPTION_MAP = {
  Alimentación: {
    Cafetería: 'Consumo en cafetería',
    Restaurante: 'Consumo en restaurante',
    Supermercado: 'Compra en supermercado',
    Bar: 'Consumo en bar',
  },
  Transporte: {
    Gasolina: 'Repostaje de combustible',
    'Transporte Público': 'Billete de transporte público',
    'Taxi / VTC': 'Servicio de taxi/VTC',
    Parking: 'Pago de aparcamiento',
  },
  Hogar: {
    Electricidad: 'Pago de suministro eléctrico',
    Agua: 'Pago de suministro de agua',
    Gas: 'Pago de suministro de gas',
    Internet: 'Factura de telecomunicaciones',
    Alquiler: 'Pago de alquiler/hipoteca',
    Limpieza: 'Productos de limpieza del hogar',
  },
  Salud: {
    Farmacia: 'Compra en farmacia',
    Médico: 'Consulta médica',
    Gimnasio: 'Cuota deportiva/gimnasio',
  },
  Ocio: {
    Cine: 'Entrada de cine',
    Streaming: 'Suscripción de streaming',
    Música: 'Evento o servicio musical',
    Juegos: 'Compra de videojuego/software',
    Deporte: 'Entrada a evento deportivo',
  },
  Ropa: {
    Ropa: 'Compra de prendas de ropa',
    Calzado: 'Compra de calzado',
    Accesorios: 'Compra de accesorios',
  },
  Tecnología: {
    Electrónica: 'Compra de dispositivo electrónico',
    Software: 'Suscripción o licencia de software',
  },
  Educación: {
    Cursos: 'Formación y cursos',
    Libros: 'Compra de material educativo',
  },
  Otros: {
    General: 'Gasto general',
  },
};

function classifyExpense(text) {
  const lower = text.toLowerCase();
  let best = { category: 'Otros', subcategory: 'General', score: 0 };
  for (const [cat, data] of Object.entries(CATEGORIES)) {
    for (const [sub, keywords] of Object.entries(data.subcategories)) {
      const score = keywords.reduce((s, kw) => (lower.includes(kw) ? s + kw.length : s), 0);
      if (score > best.score) best = { category: cat, subcategory: sub, score };
    }
  }
  return { category: best.category, subcategory: best.subcategory };
}

// ─── API pública ─────────────────────────────────────────────────────────────
export function parseExpenseText(text) {
  const currency = detectCurrency(text);
  const normalized = normalizeNumbers(text);
  const originalAmount = extractRawAmount(normalized);
  const amount = parseFloat((originalAmount * TO_EUR[currency]).toFixed(2));
  const { category, subcategory } = classifyExpense(text);
  const description = DESCRIPTION_MAP[category]?.[subcategory] ?? 'Gasto registrado';

  return {
    id: crypto.randomUUID(),
    amount,
    originalAmount,
    currency,
    category,
    subcategory,
    description,
    rawText: text.trim(),
    date: new Date().toISOString(),
  };
}

export { CURRENCY_SYMBOL, TO_EUR };
