const express = require("express");
const axios = require("axios");
const router = express.Router();
const { PAYPAL_CLIENT_ID, PAYPAL_SECRET, PAYPAL_API_BASE, BASE_URL } =
  process.env;

// Function to get PayPal access token
async function getAccessToken() {
  const response = await axios.post(
    `${PAYPAL_API_BASE}/v1/oauth2/token`,
    new URLSearchParams({ grant_type: "client_credentials" }),
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      auth: {
        username: PAYPAL_CLIENT_ID,
        password: PAYPAL_SECRET,
      },
    },
  );
  return response.data.access_token;
}

// Create Payment
router.post("/create-payment", async (req, res) => {
  const { amount, slug, name } = req.body;
  console.log(req.body);

  try {
    const accessToken = await getAccessToken();
    const paymentResponse = await axios.post(
      `${PAYPAL_API_BASE}/v2/checkout/orders`,
      {
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: amount,
            },
          },
        ],
        application_context: {
          return_url: `${BASE_URL}/courses/${slug}?success`, // Adjust as needed
          cancel_url: `${BASE_URL}/courses/${slug}?cancel`,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    console.log("paymentResponse", paymentResponse.data.id);
    res.json({ orderID: paymentResponse.data.id });
  } catch (error) {
    console.log("paymentResponse", error.message);

    res.status(400).json({ error: error.message });
  }
});

// Capture Payment
router.post("/capture-payment", async (req, res) => {
  const { orderID } = req.body;
  const accessToken = await getAccessToken();

  try {
    const captureResponse = await axios.post(
      `${PAYPAL_API_BASE}/v2/checkout/orders/${orderID}/capture`,
      {},
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );
    res.json(captureResponse.data);
  } catch (error) {
    res.status(400).json({ error: error.response.data });
  }
});

module.exports = router;
