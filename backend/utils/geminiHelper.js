const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config/env');

/**
 * Gemini AI Helper untuk Coffee Shop POS — Optimized for Sub-Second Ultra Fast Generation
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

// Model ultra-cepat flash-lite sebagai prioritas utama (~0.9s response time)
const SUPPORTED_MODELS = ['gemini-3.5-flash-lite', 'gemini-3.6-flash'];

async function generateMenuDescription(productName, category = 'Umum', price = 0) {
  const apiKey = config.geminiApiKey || process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    const categoryFallbacks = FALLBACK_DESCRIPTIONS[category] || FALLBACK_DESCRIPTIONS['Default'];
    const randomFallback = categoryFallbacks[Math.floor(Math.random() * categoryFallbacks.length)];
    return `${productName} — ${randomFallback}`;
  }

  const prompt = `Buatkan 1 paragraf deskripsi menu coffee shop dalam Bahasa Indonesia (25-35 kata) yang estetik dan menggugah selera.

Produk: ${productName} (Kategori: ${category})

Aturan:
- Langsung tulis deskripsi tanpa kata pengantar/pembuka.
- Jangan sebutkan nominal harga.
- Buat kata-kata yang menggugah selera.`;

  const genAI = new GoogleGenerativeAI(apiKey);

  for (const modelName of SUPPORTED_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0.9,
          topP: 0.9,
          maxOutputTokens: 85, // Optimasi token agar respon sub-second (<1 detik)
        }
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();

      if (text) {
        return text;
      }
    } catch (error) {
      console.warn(`⚠️ Model ${modelName} error (${error.message}), mencoba fallback model...`);
    }
  }

  // Fallback acak jika model API tidak merespons
  const categoryFallbacks = FALLBACK_DESCRIPTIONS[category] || FALLBACK_DESCRIPTIONS['Default'];
  const randomFallback = categoryFallbacks[Math.floor(Math.random() * categoryFallbacks.length)];
  return `${productName} — ${randomFallback}`;
}

module.exports = { generateMenuDescription };
