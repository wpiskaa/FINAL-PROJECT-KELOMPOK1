const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config/env');

/**
 * Gemini AI Helper untuk Coffee Shop POS
 * Tim Backend: Ilham Saputra & Hafiz Kurniawan
 */

const FALLBACK_DESCRIPTIONS = {
  'Kopi': [
    'Racikan biji kopi pilihan yang diseduh dengan presisi tinggi. Menghadirkan aroma kaya dan bodi yang seimbang untuk melengkapi harimu.',
    'Sentuhan kenikmatan kopi otentik dengan sensasi cita rasa yang halus dan aroma menenangkan dalam setiap tegukan.'
  ],
  'Non-Kopi': [
    'Minuman segar non-kopi dengan perpaduan rasa manis dan gurih yang pas. Cocok untuk menemani waktu santaimu kapan saja.',
    'Cita rasa kelezatan premium tanpa kafein yang dibuat khusus dari bahan berkualitas terbaik untuk menyegarkan harimu.'
  ],
  'Makanan': [
    'Hidangan lezat bertekstur sempurna yang dipanggang segar setiap hari. Pendamping sempurna untuk minuman favoritmu.',
    'Camilan renyah dan gurih dengan cita rasa khas yang menggugah selera dalam setiap gigitan.'
  ],
  'Default': [
    'Sajian istimewa buatan barista kami menggunakan bahan-bahan segar berkualitas tinggi untuk memberikan pengalaman rasa terbaik.'
  ]
};

async function generateMenuDescription(productName, category = 'Umum', price = 0) {
  const apiKey = config.geminiApiKey || process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    const categoryFallbacks = FALLBACK_DESCRIPTIONS[category] || FALLBACK_DESCRIPTIONS['Default'];
    const randomFallback = categoryFallbacks[Math.floor(Math.random() * categoryFallbacks.length)];
    return `${productName} — ${randomFallback}`;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Buatkan deskripsi menu untuk coffee shop dalam Bahasa Indonesia yang menarik, estetik, dan profesional.

Detail Produk:
- Nama Menu: ${productName}
- Kategori: ${category}
- Kisaran Harga: Rp ${price.toLocaleString('id-ID')}

Ketentuan Penulisan:
1. Panjang deskripsi antara 25 hingga 40 kata.
2. Ciptakan kesan cita rasa yang lezat, harum, dan menggugah selera.
3. Jangan sebutkan harga spesifik dalam teks deskripsi.
4. Jangan gunakan kata pembuka seperti "Tentu," atau "Berikut deskripsi". Langsung tulis teks deskripsinya saja.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    return text;
  } catch (error) {
    console.error('⚠️ Gemini API Error:', error.message);
    const categoryFallbacks = FALLBACK_DESCRIPTIONS[category] || FALLBACK_DESCRIPTIONS['Default'];
    return `${productName} — ${categoryFallbacks[0]}`;
  }
}

module.exports = { generateMenuDescription };
