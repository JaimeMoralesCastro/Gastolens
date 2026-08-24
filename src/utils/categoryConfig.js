export const CATEGORIES = {
  Alimentación: {
    color: '#00ff88',
    icon: '🛒',
    subcategories: {
      Supermercado: ['mercadona', 'lidl', 'aldi', 'carrefour', 'gadis', 'froiz', 'dia', 'eroski', 'alcampo', 'consum', 'hipercor', 'supermercado', 'mercado', 'compra', 'alimentación'],
      Restaurante:  ['restaurante', 'cena', 'almuerzo', 'pizza', 'burger', 'hamburguesa', 'sushi', 'kebab', 'bocadillo', 'menú', 'menu', 'tapas', 'ensalada', 'asador', 'marisqueria', 'marisquería'],
      'Bar/Copas':  ['bar', 'copa', 'cerveza', 'vino', 'caña', 'cañas', 'bebida', 'chupito', 'gin', 'cocktail', 'mojito', 'vermut', 'sidra', 'discoteca', 'disco', 'pub', 'club'],
      Cafetería:    ['café', 'cafeteria', 'cafetería', 'coffee', 'cappuccino', 'latte', 'espresso', 'croissant', 'desayuno', 'merienda', 'tostada', 'pasteleria', 'pastelería'],
      'Comida rápida': ['mcdonalds', 'burger king', 'kfc', 'telepizza', 'dominos', 'domino', 'subway', 'glovo', 'just eat', 'uber eats', 'deliveroo', 'pedidos ya'],
    },
  },
  Transporte: {
    color: '#00d4ff',
    icon: '🚌',
    subcategories: {
      'Bus/Metro':  ['metro', 'bus', 'autobús', 'autobus', 'tranvía', 'tranvia', 'tus', 'emt', 'tmb', 'fgc', 'abono', 'bono transporte', 'billete', 'monbus', 'alsa'],
      Tren:         ['renfe', 'tren', 'cercanías', 'cercanias', 'ave', 'iryo', 'ouigo', 'feve', 'estacion', 'estación'],
      'Taxi/Uber':  ['taxi', 'uber', 'cabify', 'bolt', 'vtc', 'freenow', 'blablacar'],
      Gasolina:     ['gasolina', 'gasolinera', 'combustible', 'diesel', 'bp', 'repsol', 'cepsa', 'galp', 'repostaje'],
      Parking:      ['parking', 'aparcamiento', 'garaje', 'parquímetro', 'parquimetro'],
    },
  },
  Ocio: {
    color: '#a855f7',
    icon: '🎮',
    subcategories: {
      Apuestas:     ['winamax', 'bet365', 'sportium', 'codere', 'betway', 'apuesta', 'casino', 'bingo', 'poker', 'loteria', 'lotería', 'once', 'tragaperra'],
      Streaming:    ['netflix', 'hbo', 'disney', 'prime video', 'apple tv', 'hulu', 'twitch', 'mubi', 'filmin', 'dazn', 'skyshowtime'],
      'Música':     ['spotify', 'apple music', 'tidal', 'deezer', 'concierto', 'festival', 'sala'],
      Videojuegos:  ['steam', 'playstation', 'xbox', 'nintendo', 'psn', 'game pass', 'epic games', 'riot'],
      Cine:         ['cine', 'kinépolis', 'kinepolis', 'yelmo', 'cinesa', 'multicines'],
      'Salidas':    ['bowling', 'karting', 'laser', 'paintball', 'escape room', 'acuario', 'zoo', 'parque'],
    },
  },
  Compras: {
    color: '#f97316',
    icon: '🛍️',
    subcategories: {
      'Amazon/Online': ['amazon', 'aliexpress', 'temu', 'shein', 'zalando', 'pccomponentes', 'fnac', 'ebay', 'mediamarkt'],
      Ropa:         ['zara', 'h&m', 'mango', 'pull', 'bershka', 'stradivarius', 'primark', 'lefties', 'cortefiel', 'ropa', 'camiseta', 'pantalón'],
      Tecnología:   ['apple', 'samsung', 'xiaomi', 'huawei', 'móvil', 'movil', 'portátil', 'portatil', 'tablet', 'auriculares', 'cargador'],
      Hogar:        ['ikea', 'leroy merlin', 'leroy', 'bricodepot', 'el corte inglés', 'el corte ingles', 'worten'],
      General:      ['tienda', 'shop', 'store'],
    },
  },
  Hogar: {
    color: '#f59e0b',
    icon: '🏠',
    subcategories: {
      Alquiler:     ['alquiler', 'hipoteca', 'renta', 'comunidad', 'ibi'],
      Suministros:  ['luz', 'electricidad', 'iberdrola', 'endesa', 'naturgy', 'agua', 'gas', 'calefacción', 'holaluz'],
      Internet:     ['movistar', 'vodafone', 'orange', 'jazztel', 'masmovil', 'digi', 'fibra', 'router', 'internet'],
      Limpieza:     ['limpieza', 'detergente', 'droguería', 'drogueria', 'mercadona limpieza'],
      Seguros:      ['seguro', 'mutua', 'mapfre', 'axa', 'allianz', 'sanitas', 'adeslas'],
    },
  },
  Salud: {
    color: '#ec4899',
    icon: '💊',
    subcategories: {
      Farmacia:     ['farmacia', 'medicamento', 'medicina', 'paracetamol', 'antibiótico', 'vitamina', 'crema', 'jarabe'],
      Médico:       ['médico', 'medico', 'doctor', 'clínica', 'clinica', 'hospital', 'dentista', 'oculista', 'fisio', 'psicólogo'],
      Gimnasio:     ['gym', 'gimnasio', 'fitness', 'crossfit', 'pilates', 'yoga', 'padel', 'piscina', 'natación'],
    },
  },
  Viajes: {
    color: '#06b6d4',
    icon: '✈️',
    subcategories: {
      Vuelos:       ['vuelo', 'ryanair', 'vueling', 'iberia', 'easyjet', 'wizz', 'volotea', 'aeropuerto', 'boarding'],
      Hotel:        ['hotel', 'hostel', 'airbnb', 'booking', 'apartamento vacaciones', 'aparthotel'],
      Actividades:  ['excursión', 'excursion', 'tour', 'museo', 'entrada', 'monumento'],
    },
  },
  Educación: {
    color: '#84cc16',
    icon: '📚',
    subcategories: {
      Cursos:       ['udemy', 'coursera', 'domestika', 'academia', 'formación', 'masterclass', 'clases', 'curso'],
      Libros:       ['libro', 'kindle', 'audiolibro', 'revista', 'periódico', 'periodico'],
    },
  },
  Tabaco: {
    color: '#78716c',
    icon: '🚬',
    subcategories: {
      Estanco:      ['estanco', 'expendeduria', 'expendeduría', 'tabaco', 'cigarros', 'cigarro', 'vapeador', 'vape'],
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
