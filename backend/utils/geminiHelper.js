const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Advanced Gemini AI Helper untuk Coffee Shop POS
 * Dikembangkan oleh: Hafiz Kurniawan (Backend & UI Research)
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

async function generateMenuDescription(productName, category = 'Umum', price = 0, tone = 'modern') {
  const apiKey = process.env.GEMINI_API_KEY;

  const tonePrompts = {
    modern: 'gaya bahasa santai, estetik, hangat, dan kekinian ala coffee shop modern',
    elegant: 'gaya bahasa mewah, elegan, dan puitis khas artisan specialty coffee',
    playful: 'gaya bahasa seru, ceria, menggiurkan, dan penuh semangat'
  };

  const selectedToneInstruction = tonePrompts[tone] || tonePrompts.modern;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    // Dynamic smart fallback jika API key belum diset
    const categoryFallbacks = FALLBACK_DESCRIPTIONS[category] || FALLBACK_DESCRIPTIONS['Default'];
    const randomFallback = categoryFallbacks[Math.floor(Math.random() * categoryFallbacks.length)];
    return `${productName} — ${randomFallback}`;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Buatkan deskripsi menu untuk coffee shop dalam Bahasa Indonesia dengan ${selectedToneInstruction}.

Detail Produk:
- Nama Menu: ${productName}
- Kategori: ${category}
- Kisaran Harga: Rp ${price.toLocaleString('id-ID')}

Ketentuan Penulisan:
1. Panjang deskripsi antara 25 hingga 45 kata.
2. Ciptakan kesan cita rasa yang kuat, harum, dan menggiurkan.
3. Jangan sebutkan harga spesifik dalam teks deskripsi.
4. Jangan gunakan pembuka seperti "Tentu," atau "Berikut deskripsi". Langsung tulis teks deskripsinya.`;

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

/**
 * Fitur Tambahan: AI Menu Pair Suggestion
 */
async function generatePairingSuggestion(productName, category) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return category === 'Kopi' ? 'Sangat cocok dinikmati bersama Croissant hangat.' : 'Pas dipadukan dengan Espresso shot.';
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Berikan 1 kalimat singkat rekomendasi pasangan makanan/minuman yang cocok untuk dinikmati bersama "${productName}" (Kategori: ${category}) di coffee shop. Maksimal 15 kata.`;

    const result = await model.generateContent(prompt);
    return (await result.response).text().trim();
  } catch {
    return 'Sangat cocok dipadukan dengan camilan favoritmu.';
  }
}

module.exports = { generateMenuDescription, generatePairingSuggestion };
