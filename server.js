// 📦 File: server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Shopify credentials (يفضل تستعمل .env فـ production)
const SHOPIFY_STORE = 'privilegiashop.ma';
const ACCESS_TOKEN = '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';
const FIXED_VARIANT_ID = 44587629740320; // 🟢 بدلوه على حساب المنتج

// ✅ Middleware
app.use(cors({
  origin: ['https://privilegiashop.ma', 'https://www.privilegiashop.ma'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ API Endpoint
app.post('/create-order', async (req, res) => {
  const {
    nom,
    tele,
    ville,
    address,
    quantity,
    email,
    productTitle,
    productPrice,
    productId,
    orderDate
  } = req.body;

  try {
    const orderData = {
      order: {
        line_items: [
          {
            variant_id: FIXED_VARIANT_ID,
            quantity: parseInt(quantity || 1)
          }
        ],
        customer: {
          first_name: nom,
          phone: tele,
          email: email || `${tele}@noemail.com`,
          tags: "easysell_cod_form"
        },
        shipping_address: {
          address1: address,
          city: ville,
          first_name: nom,
          phone: tele
        },
        financial_status: 'pending',
        fulfillment_status: null,
        tags: "easysell_cod_form",
        send_receipt: false,
        send_fulfillment_receipt: false,
        source_name: 'web',

        // ✅ 📝 معلومات إضافية فـ note
        note: `
📦 Produit: ${productTitle}
💰 Prix: ${productPrice} DH
📄 ID Produit: ${productId}
📅 Date: ${orderDate}
📞 Client: ${nom} - ${tele}
🏙️ Ville: ${ville}
📍 Adresse: ${address}
        `.trim()
      }
    };

    const response = await axios.post(
      `https://${SHOPIFY_STORE}/admin/api/2023-07/orders.json`,
      orderData,
      {
        headers: {
          'X-Shopify-Access-Token': ACCESS_TOKEN,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Order created:', response.data);
    res.status(200).json({ success: true, order: response.data });
  } catch (err) {
    console.error('❌ Error creating order:', err.response?.data || err.message);
    res.status(500).json({ success: false, error: err.response?.data || err.message });
  }
});

app.get('/', (req, res) => {
  res.send('🟢 Shopify Order API running');
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
