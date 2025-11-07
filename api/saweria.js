const fetch = global.fetch;

let SaweriaCreateQr = null;
try {
  SaweriaCreateQr = require('saweria-createqr');
} catch (e) {
  // package not installed — createPayment will instruct the user to install it
}

module.exports = [
  {
    name: "Saweria Login",
    desc: "Login ke Saweria dan ambil JWT dari header Authorization",
    category: "Saweria",
    path: "/saweria/login?apikey=&email=&password=&otp=",
    async run(req, res) {
      const { apikey, email, password, otp } = req.query;
      if (!global.apikey || !global.apikey.includes(apikey)) return res.json({ status: false, error: 'Apikey invalid' });
      if (!email) return res.json({ status: false, error: 'Missing email' });
      if (!password) return res.json({ status: false, error: 'Missing password' });

      try {
        const body = { email, password };
        if (typeof otp !== 'undefined') body.otp = otp;

        const resp = await fetch('https://api.saweria.co/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(body)
        });

        const json = await resp.json().catch(() => null);
        const authHeader = resp.headers.get('authorization') || resp.headers.get('Authorization');

        res.json({
          status: true,
          result: {
            httpStatus: resp.status,
            body: json,
            authorization: authHeader || null
          }
        });
      } catch (err) {
        res.status(500).json({ status: false, error: err.message });
      }
    }
  },
  {
    name: "Saweria Create Payment (QRIS)",
    desc: "Buat payment QRIS Saweria. Menggunakan package 'saweria-createqr' bila ada.",
    category: "Saweria",
    path: "/saweria/createpayment",
    async run(req, res) {
      const input = Object.assign({}, req.query, req.body || {});
      const { apikey, amount, username, email, password, duration = 30, name = 'Donatur', msg = '' } = input;
      if (!global.apikey || !global.apikey.includes(apikey)) return res.json({ status: false, error: 'Apikey invalid' });
      if (!amount) return res.json({ status: false, error: 'Missing amount' });
      if (!username && (!email || !password)) return res.json({ status: false, error: 'Provide either saweria username or email+password for login' });

      try {
        if (!SaweriaCreateQr) {
          return res.status(400).json({ status: false, error: "Package 'saweria-createqr' not found. Install it: npm i saweria-createqr or use your own Saweria integration." });
        }

        const { SumshiiySawer } = SaweriaCreateQr;
        const sawer = new SumshiiySawer({ username, email, password });

        if (typeof sawer.login === 'function') {
          await sawer.login();
        }

        if (typeof sawer.createPaymentQr !== 'function') {
          return res.status(500).json({ status: false, error: "Installed 'saweria-createqr' doesn't expose createPaymentQr(). Check package version." });
        }

        const data = await sawer.createPaymentQr(parseInt(amount, 10), parseInt(duration, 10), name, email || '', msg);

        res.json({ status: true, result: data });
      } catch (err) {
        res.status(500).json({ status: false, error: err.message });
      }
    }
  },
  {
    name: "Saweria Webhook Receiver",
    desc: "Endpoint untuk menerima webhook dari Saweria (donation notifications).",
    category: "Saweria",
    path: "/saweria/webhook",
    async run(req, res) {
      try {
        const payload = req.body || {};
        // Add verification logic as needed (signature, secret, etc.)
        res.status(200).json({ status: true, received: payload });
      } catch (err) {
        res.status(500).json({ status: false, error: err.message });
      }
    }
  }
];
