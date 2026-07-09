const { Chapa } = require("chapa-nodejs");

const chapa = new Chapa(process.env.CHAPA_SECRET_KEY);

const createPayment = async (req, res) => {
  try {
    const { amount, email, first_name, last_name, booking_id } = req.body;

    const tx_ref = `tx-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

    const payment = await chapa.initialize({
      amount,
      currency: "ETB",
      email,
      first_name,
      last_name,
      tx_ref,
      callback_url: `${process.env.SERVER_URL}/payments/verify/${tx_ref}`,
      return_url: `${process.env.CLIENT_URL}/payment-success`,
      customization: {
        title: "Service Marketplace",
        description: `Payment for booking ${booking_id}`,
      },
    });

    res.status(200).json({
      success: true,
      checkout_url: payment.data.checkout_url,
      tx_ref,
    });
  } catch (error) {
    console.error("Payment initialization error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create payment",
      error: error.message,
    });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { tx_ref } = req.params;
    const response = await chapa.verify(tx_ref);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createPayment, verifyPayment };