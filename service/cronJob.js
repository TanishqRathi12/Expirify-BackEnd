
const Product = require('../models/product');
const { sendExpiryNotification } = require('../service/mailService');


const checkForExpiringProducts = async () => {
    try {
        
        const today = new Date();
        today.setHours(0, 0, 0, 0); 

        const oneMonthFromNow = new Date();
        oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
        oneMonthFromNow.setHours(23, 59, 59, 999); 

  
        const expiringProducts = await Product.find({
            expiry_date: { 
                $gte: today,  
                $lte: oneMonthFromNow 
            },
            $or: [
                { status: 'pending' },
                { status: 'not eaten' }
            ]
        }).populate('user_id');

        for (const product of expiringProducts) {
           
            await sendExpiryNotification(product.Email,product._id ,product.product_name, product.expiry_date);
        }

        console.log("Checked for expiring products.");
    } catch (error) {
        console.error("Error checking expiring products: ", error);
    }
};


module.exports = checkForExpiringProducts;
