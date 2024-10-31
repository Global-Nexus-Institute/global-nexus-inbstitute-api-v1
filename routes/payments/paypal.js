const express = require("express");
const axios = require("axios");
const router = express.Router();
const { PAYPAL_CLIENT_ID, PAYPAL_SECRET, PAYPAL_API_BASE, BASE_URL } =
  process.env;

const Payment = require("../../models/Payments");

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
  const { amount, slug, name, courseId, userId } = req.body;
  console.log(req.body);

  if (!amount || !slug || !name || !courseId || !userId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const prevPayment = await Payment.findOne({
    courseId: courseId,
    userId: userId,
    paymentStatus: "COMPLETED",
  }).catch((error) => {
    console.log("Error finding previous payment: ", error.message);
    return null;
  });

  if (prevPayment !== null) {
    return res.status(400).json({ error: "Payment already made" });
  }

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

    console.log("paymentResponse", paymentResponse.data);
    if (paymentResponse.data.status === "CREATED") {
      const paymentRecord = {
        courseId: courseId,
        userId: userId,
        amount: amount,
        paymentStatus: "PENDING",
        transactionId: paymentResponse.data.id,
      };
      await Payment.create(paymentRecord);
    }
    res.json({ orderID: paymentResponse.data.id });
  } catch (error) {
    console.log("paymentResponse", error.message);

    res.status(400).json({ error: error.message });
  }
});

// Capture Payment
router.post("/capture-payment", async (req, res) => {
  const { orderID, payerID } = req.body;
  const accessToken = await getAccessToken();

  try {
    const captureResponse = await axios.post(
      `${PAYPAL_API_BASE}/v2/checkout/orders/${orderID}/capture`,
      {},
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );
    console.log("captureResponse: ", captureResponse.data);
    if (captureResponse.data.status === "COMPLETED") {
      const paymentRecord = {
        paymentStatus: "COMPLETED",
      };
      await Payment.findOneAndUpdate({ transactionId: orderID }, paymentRecord);
    }
    res.json(captureResponse.data);
  } catch (error) {
    res.status(400).json({ error: error.response.data });
  }
});

// get payment status
router.post("/get-payment-status", async (req, res) => {
  const { userId, courseId } = req.body;
  try {
    const paymentRecord = await Payment.findOne({
      userId: userId,
      courseId: courseId,
    }).catch((error) => {
      console.log("Error finding payment: ", error.message);
      return null;
    });
    console.log("payment status: ", paymentRecord.paymentStatus);
    if (paymentRecord === null)
      return res.status(200).json({ paymentStatus: null });
    return res.status(200).json({ paymentStatus: paymentRecord.paymentStatus });
  } catch (err) {
    return res.status(400).json({ paymentStatus: null, error: err.message });
  }
});

module.exports = router;
