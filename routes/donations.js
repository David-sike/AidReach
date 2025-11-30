import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch"; // or axios if you prefer
import { v4 as uuidv4 } from "uuid"; // for unique internal IDs
dotenv.config();

const router = express.Router();

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
if (!PAYSTACK_SECRET_KEY) {
  throw new Error("PAYSTACK_SECRET_KEY is not set in environment variables");
}


router.post("/initiate", async (req, res) => {
  const { amount, email, campaignId } = req.body;

  if (!amount || !email || !campaignId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Convert to kobo (Paystack expects smallest currency unit)
  const amountKobo = Math.round(Number(amount) * 100);

  // Generate a unique transaction reference
  const reference = `DON-${uuidv4()}`;

  
  res.json({
    reference,
    amount,
    email,
    campaignId,
    publicKey: process.env.PAYSTACK_PUBLIC_KEY, // safe to expose
  });
});


router.post("/verify", async (req, res) => {
  const { reference, campaignId } = req.body;

  if (!reference) {
    return res.status(400).json({ error: "Missing reference" });
  }

  try {
    const verifyUrl = `https://api.paystack.co/transaction/verify/${reference}`;
    const response = await fetch(verifyUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!data.status || !data.data) {
      return res.status(400).json({ error: "Invalid Paystack response" });
    }

    const tx = data.data;

    if (tx.status !== "success") {
      return res.status(400).json({ error: "Transaction not successful" });
    }

    res.json({
      ok: true,
      verified: true,
      reference: tx.reference,
      amount: tx.amount / 100,
      email: tx.customer.email,
      campaignId,
      message: "Payment verified successfully",
    });
  } catch (err) {
    console.error("Paystack verification error:", err);
    res.status(500).json({ error: "Server error verifying payment" });
  }
});

export default router;
