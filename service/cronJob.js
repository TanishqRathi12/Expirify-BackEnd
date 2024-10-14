
const Product = require('../models/product');
const { sendExpiryNotification } = require('../service/mailService');

// Function to check product expiry
const checkForExpiringProducts = async () => {
    try {
        // Get today's date at the start of the day
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of the day

        // Calculate one month from today
        const oneMonthFromNow = new Date();
        oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
        oneMonthFromNow.setHours(23, 59, 59, 999); // End of the day for one month later

        // Find products that will expire within the next month and are still "pending"
        const expiringProducts = await Product.find({
            expiry_date: { 
                $gte: today,  // Make sure the expiry date is in the future
                $lte: oneMonthFromNow  // Expiring within a month
            },
            $or: [
                { status: 'pending' },
                { status: 'not eaten' }
            ]
        }).populate('user_id');

        for (const product of expiringProducts) {
            // Send expiry notification to the user (use product.user_id.email if stored under user_id)
            await sendExpiryNotification(product.Email,product._id ,product.product_name, product.expiry_date);
        }

        console.log("Checked for expiring products.");
    } catch (error) {
        console.error("Error checking expiring products: ", error);
    }
};


module.exports = checkForExpiringProducts;
