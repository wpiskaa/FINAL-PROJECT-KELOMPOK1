const { GoogleGenerativeAI } = require('@google/generative-ai');

async function generateMenuDescription(productName, category, price) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    // Fallback description jika API key belum diset
    return `${productName} adalah salah satu pilihan terbaik kami di kategori ${category}. Dibuat dengan bahan-bahan pilihan berkualitas tinggi, menawarkan cita rasa yang lezat dan pengalaman yang memuaskan. Tersedia dengan harga Rp ${price.toLocaleString('id-ID')} yang sangat terjangkau.`;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Buatkan deskripsi menu untuk coffee shop dalam bahasa Indonesia yang menarik dan profesional. 
    
    Nama Menu: ${productName}
    Kategori: ${category}
    Harga: Rp ${price.toLocaleString('id-ID')}
    
    Ketentuan:
    - Deskripsi minimal 20 kata, maksimal 50 kata
    - Tulis dalam bahasa Indonesia yang natural dan menggiurkan
    - Sebutkan bahan utama atau keunikan produk
    - Jangan menyebutkan harga dalam deskripsi
    - Hanya tulis deskripsinya saja, tanpa header atau label apapun`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    return text;
  } catch (error) {
    console.error('Gemini API error:', error.message);
    // Fallback jika API error
    return `${productName} merupakan menu unggulan kami yang dibuat dengan bahan-bahan segar pilihan. Nikmati cita rasa autentik yang kaya dan memuaskan dalam setiap tegukan. Sempurna untuk menemani hari-hari Anda.`;
  }
}

module.exports = { generateMenuDescription };
