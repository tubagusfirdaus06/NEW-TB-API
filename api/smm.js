const INDOSMM_URL = 'https://indosmm.id/api/v2';
const fetch = global.fetch;

const indosmmRequest = async (params = {}) => {
  // params should be a plain object that will be form-encoded
  const body = new URLSearchParams();
  Object.keys(params).forEach(k => {
    if (params[k] !== undefined && params[k] !== null) body.append(k, String(params[k]));
  });

  const resp = await fetch(INDOSMM_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Accept': 'application/json'
    },
    body: body.toString()
  });

  // Try parse JSON, otherwise return raw text
  const text = await resp.text().catch(() => '');
  try {
    return JSON.parse(text);
  } catch (e) {
    return { error: 'Invalid JSON response', raw: text, httpStatus: resp.status };
  }
};

module.exports = [
  {
    name: "SMM - Services (list)",
    desc: "Ambil daftar layanan dari IndoSMM (action=services)",
    category: "SMM",
    path: "/smm/services?apikey=&key=",
    async run(req, res) {
      const { apikey, key } = Object.assign({}, req.query, req.body || {});
      if (!global.apikey || !global.apikey.includes(apikey)) return res.json({ status: false, error: 'Apikey invalid' });
      if (!key) return res.json({ status: false, error: 'Missing key (IndoSMM API key)' });
      try {
        const data = await indosmmRequest({ key, action: 'services' });
        res.json({ status: true, result: data });
      } catch (err) {
        res.status(500).json({ status: false, error: err.message });
      }
    }
  },
  {
    name: "SMM - Add Order",
    desc: "Buat order baru (action=add). Terima berbagai parameter sesuai dokumentasi.",
    category: "SMM",
    path: "/smm/add?apikey=&key=&service=&link=&quantity=",
    async run(req, res) {
      const input = Object.assign({}, req.query, req.body || {});
      const { apikey, key, service, link, quantity } = input;
      if (!global.apikey || !global.apikey.includes(apikey)) return res.json({ status: false, error: 'Apikey invalid' });
      if (!key) return res.json({ status: false, error: 'Missing key (IndoSMM API key)' });
      if (!service) return res.json({ status: false, error: 'Missing service (service ID)' });
      if (!link) return res.json({ status: false, error: 'Missing link (target url/username)' });
      if (!quantity && typeof quantity !== 'number' && typeof quantity !== 'string') return res.json({ status: false, error: 'Missing quantity' });

      try {
        // Forward all provided params to the API (action=add)
        const params = Object.assign({}, input, { key, action: 'add' });
        // Remove apikey (our internal) from params sent to provider
        delete params.apikey;
        const data = await indosmmRequest(params);
        res.json({ status: true, result: data });
      } catch (err) {
        res.status(500).json({ status: false, error: err.message });
      }
    }
  },
  {
    name: "SMM - Order Status",
    desc: "Cek status order (action=status). Gunakan 'order' untuk single atau 'orders' untuk multiple.",
    category: "SMM",
    path: "/smm/status?apikey=&key=&order=",
    async run(req, res) {
      const { apikey, key, order, orders } = Object.assign({}, req.query, req.body || {});
      if (!global.apikey || !global.apikey.includes(apikey)) return res.json({ status: false, error: 'Apikey invalid' });
      if (!key) return res.json({ status: false, error: 'Missing key (IndoSMM API key)' });
      if (!order && !orders) return res.json({ status: false, error: 'Missing order or orders' });
      try {
        const params = { key, action: 'status' };
        if (orders) params.orders = orders; else params.order = order;
        const data = await indosmmRequest(params);
        res.json({ status: true, result: data });
      } catch (err) {
        res.status(500).json({ status: false, error: err.message });
      }
    }
  },
  {
    name: "SMM - Refill (create)",
    desc: "Minta refill untuk order (action=refill).",
    category: "SMM",
    path: "/smm/refill?apikey=&key=&order=",
    async run(req, res) {
      const { apikey, key, order, orders } = Object.assign({}, req.query, req.body || {});
      if (!global.apikey || !global.apikey.includes(apikey)) return res.json({ status: false, error: 'Apikey invalid' });
      if (!key) return res.json({ status: false, error: 'Missing key (IndoSMM API key)' });
      if (!order && !orders) return res.json({ status: false, error: 'Missing order or orders' });
      try {
        const params = { key, action: 'refill' };
        if (orders) params.orders = orders; else params.order = order;
        const data = await indosmmRequest(params);
        res.json({ status: true, result: data });
      } catch (err) {
        res.status(500).json({ status: false, error: err.message });
      }
    }
  },
  {
    name: "SMM - Refill Status",
    desc: "Cek status refill (action=refill_status).",
    category: "SMM",
    path: "/smm/refill_status?apikey=&key=&refill=",
    async run(req, res) {
      const { apikey, key, refill, refills } = Object.assign({}, req.query, req.body || {});
      if (!global.apikey || !global.apikey.includes(apikey)) return res.json({ status: false, error: 'Apikey invalid' });
      if (!key) return res.json({ status: false, error: 'Missing key (IndoSMM API key)' });
      if (!refill && !refills) return res.json({ status: false, error: 'Missing refill or refills' });
      try {
        const params = { key, action: 'refill_status' };
        if (refills) params.refills = refills; else params.refill = refill;
        const data = await indosmmRequest(params);
        res.json({ status: true, result: data });
      } catch (err) {
        res.status(500).json({ status: false, error: err.message });
      }
    }
  },
  {
    name: "SMM - Cancel Order",
    desc: "Batalkan order (action=cancel). Berikan 'orders' (comma-separated up to 100).",
    category: "SMM",
    path: "/smm/cancel?apikey=&key=&orders=",
    async run(req, res) {
      const { apikey, key, orders } = Object.assign({}, req.query, req.body || {});
      if (!global.apikey || !global.apikey.includes(apikey)) return res.json({ status: false, error: 'Apikey invalid' });
      if (!key) return res.json({ status: false, error: 'Missing key (IndoSMM API key)' });
      if (!orders) return res.json({ status: false, error: 'Missing orders (comma-separated order IDs)' });
      try {
        const params = { key, action: 'cancel', orders };
        const data = await indosmmRequest(params);
        res.json({ status: true, result: data });
      } catch (err) {
        res.status(500).json({ status: false, error: err.message });
      }
    }
  },
  {
    name: "SMM - Balance",
    desc: "Cek saldo user (action=balance).",
    category: "SMM",
    path: "/smm/balance?apikey=&key=",
    async run(req, res) {
      const { apikey, key } = Object.assign({}, req.query, req.body || {});
      if (!global.apikey || !global.apikey.includes(apikey)) return res.json({ status: false, error: 'Apikey invalid' });
      if (!key) return res.json({ status: false, error: 'Missing key (IndoSMM API key)' });
      try {
        const data = await indosmmRequest({ key, action: 'balance' });
        res.json({ status: true, result: data });
      } catch (err) {
        res.status(500).json({ status: false, error: err.message });
      }
    }
  }
];
