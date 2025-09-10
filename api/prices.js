// Bu dosya, Vercel üzerinde sunucu olarak çalışacak ve Harem Altın'dan veri çekecektir.
// Görevi: Güvenlik engellerini aşmak ve ön yüzün istediği formatta veri hazırlamak.

export default async function handler(request, response) {
  const apiUrl = 'https://www.haremaltin.com/ajax/all_prices_ajax';

  // Harem Altın API anahtarlarını, ön yüzdeki ID'lere çeviren harita
  const keyMap = {
    'GA': 'gram-altin',
    '22A': '22-ayar-altin',
    '18A': '18-ayar-altin',
    '14A': '14-ayar-altin',
    'CK': 'ceyrek-altin',
    'CY': 'yarim-altin',
    'T': 'tam-altin',
    'C25': 'ikibesli-altin',
    'ATA': 'ata-altin'
  };

  try {
    // Harem Altın'a istek atarken, isteğin normal bir tarayıcıdan geldiğini taklit ediyoruz.
    const fetchResponse = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Referer': 'https://www.haremaltin.com/canli-piyasalar/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    if (!fetchResponse.ok) {
      throw new Error(`Veri çekilemedi. Status: ${fetchResponse.status}`);
    }

    const rawData = await fetchResponse.json();
    const transformedData = {};

    // Gelen ham veriyi, ön yüzün anlayacağı formata dönüştürüyoruz.
    for (const key in rawData.data) {
      if (keyMap[key]) {
        const newKey = keyMap[key];
        transformedData[newKey] = {
          buy: parseFloat(rawData.data[key].alis.replace('.', '').replace(',', '.')),
          sell: parseFloat(rawData.data[key].satis.replace('.', '').replace(',', '.'))
        };
      }
    }
    
    // Tarayıcının veriyi alabilmesi için gerekli ayarlar
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');

    // Dönüştürülmüş veriyi ön yüze gönder
    return response.status(200).json(transformedData);

  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: 'Sunucu tarafında bir hata oluştu.' });
  }
}

