import { CATEGORIES } from './categoryConfig.js';

const CATEGORY_SCHEMA = Object.fromEntries(
  Object.entries(CATEGORIES).map(([cat, data]) => [cat, Object.keys(data.subcategories)])
);

const SCHEMA_STR = JSON.stringify(CATEGORY_SCHEMA, null, 2);

function getApiKey() {
  return localStorage.getItem('gemini_api_key') ?? '';
}

export function hasGeminiKey() {
  return !!getApiKey();
}

// Clasifica un lote de transacciones en una sola llamada a Gemini
export async function classifyBatch(transactions) {
  const key = getApiKey();
  if (!key) return null;

  const list = transactions
    .map((t, i) => `${i + 1}. "${t.desc}" (${t.amount.toFixed(2)} €)`)
    .join('\n');

  const prompt = `Eres un clasificador experto de gastos bancarios de un usuario español.
Tu tarea: clasificar cada transacción en la categoría y subcategoría más específica posible.

REGLAS IMPORTANTES:
- Los nombres de lugares (playas, terrazas, bares, cafeterías, restaurantes) → Alimentación > Bar/Copas o Restaurante o Cafetería
- Si el nombre suena a local de hostelería español (terraza, beach bar, taberna, mesón, etc.) → Alimentación > Bar/Copas
- "Otros > General" es el ÚLTIMO recurso, solo si realmente no hay pista alguna
- Winamax, Codere, bet365 → Ocio > Apuestas
- TUS, EMT, Monbus → Transporte > Bus/Metro
- Expendeduría, estanco → Tabaco > Estanco
- Nombres de supermercados gallegos (Gadis, Froiz) → Alimentación > Supermercado
- Amazon, Temu, Aliexpress → Compras > Amazon/Online
- Sé MUY específico: un nombre ambiguo de local → bar o restaurante, nunca "Otros"

Categorías disponibles:
${SCHEMA_STR}

Transacciones a clasificar:
${list}

Responde SOLO con un array JSON en el mismo orden, sin markdown:
[{"category":"...","subcategory":"..."},...]`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0, maxOutputTokens: 1024 },
        }),
      }
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message ?? `HTTP ${res.status}`);
    }
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    // Extraer el JSON aunque venga con markdown
    const jsonStr = text.match(/\[[\s\S]*\]/)?.[0];
    if (!jsonStr) throw new Error('Respuesta inesperada de Gemini');
    const results = JSON.parse(jsonStr);
    // Validar que las categorías existen
    return results.map(r => {
      const validCat = CATEGORIES[r.category] ? r.category : 'Otros';
      const validSub = CATEGORIES[validCat]?.subcategories[r.subcategory]
        ? r.subcategory
        : Object.keys(CATEGORIES[validCat].subcategories)[0];
      return { category: validCat, subcategory: validSub };
    });
  } catch (err) {
    console.error('[Gemini]', err.message);
    return null;
  }
}

// Clasifica una sola transacción (para input manual)
export async function classifyOne(desc, amount = 0) {
  const results = await classifyBatch([{ desc, amount }]);
  return results?.[0] ?? null;
}

export function validateApiKey(key) {
  return Promise.resolve(key.trim().length > 20);
}
