const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config/env');

/**
 * Gemini AI Helper untuk Coffee Shop POS
 * Tim Backend: Ilham Saputra & Hafiz Kurniawan
 */

const FALLBACK_DESCRIPTIONS = {
  'Kopi': [
    'Racikan biji kopi pilihan yang diseduh dengan presisi tinggi. Menghadirkan aroma kaya dan bodi yang seimbang untuk melengkapi harimu.',
    'Sentuhan kenikmatan kopi otentik dengan sensasi cita rasa yang halus dan aroma menenangkan dalam setiap tegukan.',
    'Paduan espresso berkarakter mantap dengan kelembutan yang memikat lidah. Sajian klasik yang membangkitkan semangat dan fokus.',
    'Diseduh dari biji kopi sangrai terbaik dengan profil rasa kaya nuansa floral dan cokelat panggang yang memanjakan indera.'
  ],
  'Non-Kopi': [
    'Minuman segar non-kopi dengan perpaduan rasa manis dan gurih yang pas. Cocok untuk menemani waktu santaimu kapan saja.',
    'Cita rasa kelezatan premium tanpa kafein yang dibuat khusus dari bahan berkualitas terbaik untuk menyegarkan harimu.',
    'Kombinasi tekstur lembut dan kesegaran rasa otentik yang menghadirkan momen santai penuh kenikmatan di setiap tegukan.',
    'Sajian pelepas dahaga istimewa dengan aroma menggoda dan rasa manis pas yang disukai semua kalangan.'
  ],
  'Makanan': [
    'Hidangan lezat bertekstur sempurna yang dipanggang segar setiap hari. Pendamping sempurna untuk minuman favoritmu.',
    'Camilan renyah dan gurih dengan cita rasa khas yang menggugah selera dalam setiap gigitan.',
    'Kue lembut kaya rasa yang dibuat dari bahan-bahan bermutu tinggi untuk melengkapi momen santai minum kopi.',
    'Sajian pastry istimewa beraroma mentega gurih dengan kerenyahan luar biasa yang lumer di lidah.'
  ],
  'Default': [
    'Sajian istimewa buatan barista kami menggunakan bahan-bahan segar berkualitas tinggi untuk memberikan pengalaman rasa terbaik.',
    'Kreasi menu andalan kami yang disiapkan dengan dedikasi tinggi demi memanjakan selera setiap penikmat kopi.'
  ]
};

const SUPPORTED_MODELS = ['gemini-3.6-flash', 'gemini-2.5-flash', 'gemini-2.0-flash-lite'];

async function generateMenuDescription(productName, category = 'Umum', price = 0) {
  const apiKey = config.geminiApiKey || process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    const categoryFallbacks = FALLBACK_DESCRIPTIONS[category] || FALLBACK_DESCRIPTIONS['Default'];
    const randomFallback = categoryFallbacks[Math.floor(Math.random() * categoryFallbacks.length)];
    return `${productName} — ${randomFallback}`;
  }

  const prompt = `Buatkan deskripsi menu untuk coffee shop dalam Bahasa Indonesia yang menarik, estetik, kreatif, dan profesional.

Detail Produk:
- Nama Menu: ${productName}
- Kategori: ${category}
- Kisaran Harga: Rp ${price.toLocaleString('id-ID')}

Ketentuan Penulisan:
1. Panjang deskripsi antara 25 hingga 40 kata.
2. Ciptakan kesan cita rasa yang lezat, harum, dan menggugah selera.
3. Buat variasi kata-kata yang segar dan deskriptif.
4. Jangan sebutkan harga spesifik dalam teks deskripsi.
5. Jangan gunakan kata pembuka seperti "Tentu," atau "Berikut deskripsi". Langsung tulis teks deskripsinya saja.`;

  const genAI = new GoogleGenerativeAI(apiKey);

  for (const modelName of SUPPORTED_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0.95,
          topP: 0.95,
        }
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();

      if (text) {
        return text;
      }
    } catch (error) {
      console.warn(`⚠️ Model ${modelName} error (${error.message}), mencoba model berikutnya...`);
    }
  }

  // Fallback acak jika seluruh model API tidak merespons
  const categoryFallbacks = FALLBACK_DESCRIPTIONS[category] || FALLBACK_DESCRIPTIONS['Default'];
  const randomFallback = categoryFallbacks[Math.floor(Math.random() * categoryFallbacks.length)];
  return `${productName} — ${randomFallback}`;
}

module.exports = { generateMenuDescription };
