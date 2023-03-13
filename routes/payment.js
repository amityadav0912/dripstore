const express = require('express');
const router = express.Router();
const Bigpromise = require('../middlewares/bigpromise');

exports.sendStripeKey = Bigpromise(async (req, res, next) => {
const {sendStripeKey,
       sendRazonpayKey,
       captureStripePayment,
       captureRazorpayPayment
} = require('../controllers/paymentController');
const {isLoggedIn, customRole} = require('../middlewares/user');

router.route('/stripekey').get(isLoggedIn, sendStripeKey);
router.route('/razorpaykey').get(isLoggedIn, sendRazonpayKey);

router.route('/captureStripe').post(isLoggedIn, captureStripePayment);
router.route('/capturerazorpay').post(isLoggedIn, captureRazorpayPayment);
})
module.exports = router;
