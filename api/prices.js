// Bu dosya, Vercel üzerinde sunucu olarak çalışacak olan koddur.
// Görevi: haremaltin.com'dan veriyi güvenli bir şekilde çekip bizim panelimize sunmak.

export default async function handler(request, response) {
  // Hedef API adresi
  const apiUrl = 'https://www.haremaltin.com/ajax/all_prices_ajax';

  try {
    // Veriyi Harem Altın'dan çekiyoruz.
    // İsteği, sitenin kendi içinden gelen gerçek bir tarayıcı isteği gibi göstermek için
    // 'Referer' gibi ek başlıklar (headers) ekledik. Bu, en güçlü engelleme yöntemlerini bile aşabilir.
    const fetchResponse = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Referer': 'https://www.haremaltin.com/canli-piyasalar/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    // Eğer veri çekme işlemi başarısız olursa hata fırlat.
    if (!fetchResponse.ok) {
      throw new Error(`Veri çekilemedi. Status: ${fetchResponse.status}`);
    }

    // Gelen veriyi JSON formatına çevir.
    const data = await fetchResponse.json();

    // Veriyi, HTML'deki JavaScript'in anlayacağı formata dönüştür.
    const formattedData = {};
    for (const key in data.data) {
        formattedData[key] = {
            buy: parseFloat(data.data[key].alis.replace(',', '.')),
            sell: parseFloat(data.data[key].satis.replace(',', '.'))
        };
    }
    
    // HTML'in istediği anahtar isimleriyle eşleştir
    const finalData = {
        'gram-altin': formattedData['GA'],
        '22-ayar-altin': formattedData['22A'],
        '18-ayar-altin': formattedData['18A'],
        '14-ayar-altin': formattedData['14A'],
        'ceyrek-altin': formattedData['CK'],
        'yarim-altin': formattedData['CY'],
        'tam-altin': formattedData['T'],
        'ikibesli-altin': formattedData['C25'],
        'ata-altin': formattedData['ATA']
    };


    // Panelin veriyi sorunsuz alabilmesi için gerekli olan ayarları (header) yapıyoruz.
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate'); // Veriyi 60 saniye cache'le

    // Veriyi panele JSON olarak gönderiyoruz.
    return response.status(200).json(finalData);

  } catch (error) {
    console.error(error);
    // Bir hata olursa, panelimize 500 koduyla birlikte bir hata mesajı gönder.
    return response.status(500).json({ error: 'Sunucu tarafında bir hata oluştu.' });
  }
}

