export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'استخدم POST فقط' });
    }

    const { message } = req.body;
    const TOKEN = process.env.BOT_TOKEN; // سنسجل التوكن في الخطوة القادمة
    const CHAT_ID = process.env.CHAT_ID;

    const url = `https://api.telegram.org/bot${TOKEN}/sendMessage`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: CHAT_ID, text: message })
        });

        if (response.ok) {
            res.status(200).json({ success: 'تم الإرسال!' });
        } else {
            res.status(500).json({ error: 'فشل الإرسال لتلجرام' });
        }
    } catch (err) {
        res.status(500).json({ error: 'خطأ في السيرفر' });
    }
}
