const NOKOS_BASE = 'https://api.jasaotp.id/v1';
const fetch = global.fetch;

const nokosFetch = async (endpoint, params = {}) => {
  const url = new URL(`${NOKOS_BASE}/${endpoint}`);
  Object.keys(params).forEach(k => {
    if (params[k] !== undefined && params[k] !== null) url.searchParams.set(k, params[k]);
  });
  const resp = await fetch(url.toString(), { method: 'GET' });
  const json = await resp.json().catch(async () => ({ error: 'Invalid JSON response', raw: await resp.text() }));
  return json;
};

module.exports = [
  {
    name: "Nokos - Check Balance",
    desc: "Periksa saldo JasaOTP",
    category: "Nokos",
    path: "/nokos/balance?apikey=&api_key=",
    async run(req, res) {
      const { apikey, api_key } = req.query;
      if (!global.apikey || !global.apikey.includes(apikey)) return res.json({ status: false, error: 'Apikey invalid' });
      if (!api_key) return res.json({ status: false, error: 'Missing api_key (jasaotp api_key)' });
      try {
        const data = await nokosFetch('balance.php', { api_key });
        res.json({ status: true, result: data });
      } catch (err) {
        res.status(500).json({ status: false, error: err.message });
      }
    }
  },
  {
    name: "Nokos - List Countries",
    desc: "Dapatkan daftar negara dari JasaOTP",
    category: "Nokos",
    path: "/nokos/negara?apikey=",
    async run(req, res) {
      const { apikey } = req.query;
      if (!global.apikey || !global.apikey.includes(apikey)) return res.json({ status: false, error: 'Apikey invalid' });
      try {
        const data = await nokosFetch('negara.php');
        res.json({ status: true, result: data });
      } catch (err) {
        res.status(500).json({ status: false, error: err.message });
      }
    }
  },
  {
    name: "Nokos - Get Operators",
    desc: "Dapatkan operator berdasarkan negara",
    category: "Nokos",
    path: "/nokos/operator?apikey=&negara=",
    async run(req, res) {
      const { apikey, negara } = req.query;
      if (!global.apikey || !global.apikey.includes(apikey)) return res.json({ status: false, error: 'Apikey invalid' });
      if (typeof negara === 'undefined') return res.json({ status: false, error: 'Missing negara' });
      try {
        const data = await nokosFetch('operator.php', { negara });
        res.json({ status: true, result: data });
      } catch (err) {
        res.status(500).json({ status: false, error: err.message });
      }
    }
  },
  {
    name: "Nokos - List Services",
    desc: "Dapatkan layanan untuk negara tertentu",
    category: "Nokos",
    path: "/nokos/layanan?apikey=&negara=",
    async run(req, res) {
      const { apikey, negara } = req.query;
      if (!global.apikey || !global.apikey.includes(apikey)) return res.json({ status: false, error: 'Apikey invalid' });
      if (typeof negara === 'undefined') return res.json({ status: false, error: 'Missing negara' });
      try {
        const data = await nokosFetch('layanan.php', { negara });
        res.json({ status: true, result: data });
      } catch (err) {
        res.status(500).json({ status: false, error: err.message });
      }
    }
  },
  {
    name: "Nokos - Create Order",
    desc: "Buat pesanan OTP baru (order.php)",
    category: "Nokos",
    path: "/nokos/order?apikey=&api_key=&negara=&layanan=&operator=",
    async run(req, res) {
      const { apikey, api_key, negara, layanan, operator } = req.query;
      if (!global.apikey || !global.apikey.includes(apikey)) return res.json({ status: false, error: 'Apikey invalid' });
      if (!api_key) return res.json({ status: false, error: 'Missing api_key (jasaotp api_key)' });
      if (!negara) return res.json({ status: false, error: 'Missing negara' });
      if (!layanan) return res.json({ status: false, error: 'Missing layanan' });
      if (!operator) return res.json({ status: false, error: 'Missing operator' });
      try {
        const data = await nokosFetch('order.php', { api_key, negara, layanan, operator });
        res.json({ status: true, result: data });
      } catch (err) {
        res.status(500).json({ status: false, error: err.message });
      }
    }
  },
  {
    name: "Nokos - Check OTP",
    desc: "Periksa OTP untuk pesanan (sms.php)",
    category: "Nokos",
    path: "/nokos/sms?apikey=&api_key=&id=",
    async run(req, res) {
      const { apikey, api_key, id } = req.query;
      if (!global.apikey || !global.apikey.includes(apikey)) return res.json({ status: false, error: 'Apikey invalid' });
      if (!api_key) return res.json({ status: false, error: 'Missing api_key (jasaotp api_key)' });
      if (!id) return res.json({ status: false, error: 'Missing id (order id)' });
      try {
        const data = await nokosFetch('sms.php', { api_key, id });
        res.json({ status: true, result: data });
      } catch (err) {
        res.status(500).json({ status: false, error: err.message });
      }
    }
  },
  {
    name: "Nokos - Cancel Order",
    desc: "Batalkan order dan kembalikan saldo (cancel.php)",
    category: "Nokos",
    path: "/nokos/cancel?apikey=&api_key=&id=",
    async run(req, res) {
      const { apikey, api_key, id } = req.query;
      if (!global.apikey || !global.apikey.includes(apikey)) return res.json({ status: false, error: 'Apikey invalid' });
      if (!api_key) return res.json({ status: false, error: 'Missing api_key (jasaotp api_key)' });
      if (!id) return res.json({ status: false, error: 'Missing id (order id)' });
      try {
        const data = await nokosFetch('cancel.php', { api_key, id });
        res.json({ status: true, result: data });
      } catch (err) {
        res.status(500).json({ status: false, error: err.message });
      }
    }
  }
];
