export const CATEGORIES = {
  Alimentación: {
    color: '#00ff88',
    icon: '🍽️',
    subcategories: {
      Cafetería: ['café', 'cafeteria', 'cafetería', 'coffee', 'cappuccino', 'latte', 'espresso', 'croissant', 'desayuno', 'merienda', 'tortilla', 'tostada'],
      Restaurante: ['restaurante', 'cena', 'comida', 'almuerzo', 'tapas', 'menú', 'menu', 'pizza', 'burger', 'hamburguesa', 'sushi', 'kebab', 'bocadillo', 'sandwich', 'ensalada'],
      Supermercado: ['super', 'supermercado', 'mercado', 'mercadona', 'lidl', 'aldi', 'carrefour', 'dia', 'frutas', 'verduras', 'compra', 'alimentación', 'consum', 'eroski', 'hipercor'],
      Bar: ['bar', 'copa', 'cerveza', 'vino', 'cañas', 'caña', 'bebida', 'chupito', 'gin', 'cocktail', 'mojito', 'vermut', 'sidra', 'tinto'],
    },
  },
  Transporte: {
    color: '#00d4ff',
    icon: '🚗',
    subcategories: {
      Gasolina: ['gasolina', 'gasolinera', 'combustible', 'carburante', 'diesel', 'bp', 'repsol', 'cepsa', 'galp', 'repostar', 'repostaje'],
      'Transporte Público': ['metro', 'bus', 'autobús', 'autobus', 'tren', 'renfe', 'cercanías', 'cercanias', 'tranvía', 'billete', 'abono', 'bono transporte', 'fgc', 'tmb'],
      'Taxi / VTC': ['taxi', 'uber', 'cabify', 'bolt', 'vtc', 'freenow'],
      Parking: ['parking', 'aparcamiento', 'garaje', 'parquímetro'],
    },
  },
  Hogar: {
    color: '#f59e0b',
    icon: '🏠',
    subcategories: {
      Electricidad: ['luz', 'electricidad', 'eléctrica', 'iberdrola', 'endesa', 'naturgy', 'holaluz', 'octopus'],
      Agua: ['agua', 'canal de isabel', 'aguas municipales'],
      Gas: ['gas', 'calefacción', 'calefaccion'],
      Internet: ['internet', 'fibra', 'wifi', 'movistar', 'vodafone', 'orange', 'jazztel', 'router', 'masmovil', 'digi'],
      Alquiler: ['alquiler', 'hipoteca', 'renta', 'piso', 'apartamento', 'habitación', 'habitacion'],
      Limpieza: ['limpieza', 'detergente', 'fregona', 'escoba', 'aspiradora', 'productos limpieza', 'ikea', 'leroy'],
    },
  },
  Salud: {
    color: '#ec4899',
    icon: '💊',
    subcategories: {
      Farmacia: ['farmacia', 'medicamento', 'medicina', 'pastilla', 'paracetamol', 'antibiótico', 'antibiotic', 'vitamina', 'crema', 'jarabe'],
      Médico: ['médico', 'medico', 'doctor', 'consulta', 'clínica', 'clinica', 'hospital', 'dentista', 'oculista', 'fisio', 'fisioterapeuta', 'psicólogo', 'psicologo'],
      Gimnasio: ['gym', 'gimnasio', 'fitness', 'crossfit', 'pilates', 'yoga', 'padel', 'pádel', 'piscina', 'natación', 'cuota deportiva'],
    },
  },
  Ocio: {
    color: '#a855f7',
    icon: '🎬',
    subcategories: {
      Cine: ['cine', 'película', 'pelicula', 'cines kinépolis', 'yelmo'],
      Streaming: ['netflix', 'hbo', 'disney', 'prime video', 'apple tv', 'streaming', 'hulu', 'twitch', 'mubi', 'filmin'],
      Música: ['concierto', 'festival', 'spotify', 'apple music', 'tidal', 'deezer'],
      Juegos: ['juego', 'videojuego', 'steam', 'playstation', 'xbox', 'nintendo', 'psn', 'game pass'],
      Deporte: ['estadio', 'partido', 'entrada', 'fútbol', 'futbol', 'baloncesto', 'tenis', 'formula 1'],
    },
  },
  Ropa: {
    color: '#f97316',
    icon: '👕',
    subcategories: {
      Ropa: ['ropa', 'camiseta', 'pantalón', 'pantalon', 'chaqueta', 'vestido', 'camisa', 'sudadera', 'zara', 'h&m', 'mango', 'pull', 'shein', 'primark', 'bershka'],
      Calzado: ['zapatos', 'zapatillas', 'botas', 'sandalias', 'nike', 'adidas', 'converse', 'new balance', 'calzado'],
      Accesorios: ['bolso', 'gafas', 'cinturón', 'cinturon', 'reloj', 'pulsera', 'sombrero', 'bufanda', 'guantes'],
    },
  },
  Tecnología: {
    color: '#06b6d4',
    icon: '💻',
    subcategories: {
      Electrónica: ['móvil', 'movil', 'teléfono', 'telefono', 'ordenador', 'portátil', 'portatil', 'tablet', 'auriculares', 'cargador', 'apple', 'samsung', 'xiaomi', 'amazon'],
      Software: ['software', 'app', 'aplicación', 'aplicacion', 'suscripción', 'suscripcion', 'licencia', 'adobe', 'microsoft', 'chatgpt', 'notion', 'figma'],
    },
  },
  Educación: {
    color: '#84cc16',
    icon: '📚',
    subcategories: {
      Cursos: ['curso', 'clase', 'academia', 'formación', 'formacion', 'taller', 'masterclass', 'udemy', 'coursera', 'domestika', 'clases'],
      Libros: ['libro', 'kindle', 'audiolibro', 'revista', 'periódico', 'periodico', 'fnac'],
    },
  },
  Otros: {
    color: '#6b7280',
    icon: '📦',
    subcategories: {
      General: [],
    },
  },
};

export const CATEGORY_LIST = Object.keys(CATEGORIES);

export const ALL_SUBCATEGORIES = Object.entries(CATEGORIES).flatMap(([cat, data]) =>
  Object.keys(data.subcategories).map(sub => ({ category: cat, subcategory: sub }))
);
