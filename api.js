// server.js or api.js
const express = require('express');
const router = express.Router();

// Mock database (replace with real database in production)
const donations = [];

router.post('/donations', async (req, res) => {
    try {
        const { campaignId, amount, reference, email } = req.body;
        
        // Verify payment with Paystack
        const verification = await verifyPaystackPayment(reference);
        
        if (verification.status === 'success') {
            // Store donation
            const donation = {
                campaignId,
                amount,
                reference,
                email,
                timestamp: new Date(),
                status: 'completed'
            };
            
            donations.push(donation);
            
            res.json({ 
                success: true, 
                message: 'Donation recorded successfully',
                donation: donation
            });
        } else {
            res.status(400).json({ 
                success: false, 
                message: 'Payment verification failed' 
            });
        }
    } catch (error) {
        console.error('Donation recording error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
});

async function verifyPaystackPayment(reference) {
    const Paystack = require('paystack')(process.env.PAYSTACK_SECRET_KEY);
    const response = await Paystack.transaction.verify(reference);
    return response.data;
}

module.exports = router;