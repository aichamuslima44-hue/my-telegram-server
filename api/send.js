// ✅ إضافة CORS headers + OPTIONS support
export default async function handler(req, res) {
    // 🔥 CORS Headers - ضروري لـ GitHub Pages
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
    
    // ✅ دعم preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'استخدم POST فقط' });
    }

    // ✅ التحقق من وجود البيانات
    if (!req.body || !req.body.message) {
        return res.status(400).json({ error: 'البيانات مفقودة' });
    }

    const { message, timestamp, origin, userAgent } = req.body;
    const TOKEN = process.env.BOT_TOKEN;
    const CHAT_ID = process.env.CHAT_ID;

    if (!TOKEN || !CHAT_ID) {
        return res.status(500).json({ error: 'إعدادات البوت مفقودة' });
    }

    // 📝 تنسيق الرسالة مع معلومات إضافية
    const fullMessage = `📱 **من:** ${origin || 'Unknown'}\n🕐 **وقت:** ${timestamp ? new Date(timestamp).toLocaleString('ar-EG') : new Date().toLocaleString('ar-EG')}\n\n${message}\n\n${userAgent ? `🌐 User-Agent: ${userAgent}` : ''}`;

    const url = `https://api.telegram.org/bot${TOKEN}/sendMessage?parse_mode=Markdown`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'User-Agent': 'Vercel-Telegram-Bot/1.0'
            },
            body: JSON.stringify({ 
                chat_id: CHAT_ID, 
                text: fullMessage,
                parse_mode: 'Markdown'  // ✅ تنسيق Markdown جميل
            })
        });

        const telegramData = await response.json();

        if (response.ok && telegramData.ok) {
            console.log('✅ رسالة مرسلة:', telegramData.result.message_id);
            res.status(200).json({ 
                success: 'تم الإرسال!', 
                message_id: telegramData.result.message_id 
            });
        } else {
            console.error('❌ Telegram error:', telegramData);
            res.status(500).json({ error: 'فشل الإرسال لتلجرام', details: telegramData });
        }
    } catch (err) {
        console.error('💥 Server error:', err);
        res.status(500).json({ error: 'خطأ في السيرفر', details: err.message });
    }
}
