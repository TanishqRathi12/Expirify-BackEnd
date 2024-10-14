const Product = require('../models/product');
const {processImageAndExtractText} = require('../service/vision')
const User = require('../models/auth'); 
 // Import the User model
 const uploadProductImage = async (req, res) => {
    try {
        // Log the incoming file for debugging
        //console.log('Uploaded file:', req.files.file);

        const file = req.files.file;  // Extract the file from the request body
        const user_id = req.user;  // Extract the user_id from the request body
      

        // Find the user to get their email
        const user = await User.findById(user_id);
        if (!user) return res.status(404).json({ msg: "User not found" });

        const userEmail = user.email;  // Get Email from the user document

        // Extract product details from the image
        const extractedData = await processImageAndExtractText(file);
        if (!extractedData) return res.status(400).json({ msg: "Could not extract product details" });
        console.log(extractedData);

        const { 'MFG.DATE': mfg_date, 'EXP.DATE': expiry_date } = extractedData;
        let product_name = extractedData['PRODUCT_NAME'] || "Not detected";
        // Create a new Product with the extracted details
        const newProduct = new Product({
            product_name,
            expiry_date,
            mfg_date,
            user_id,
            Email: userEmail // Store the user email
        });

        // Save the product to the database
        await newProduct.save();

        // Return the created product in response
        res.json(newProduct);
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ error: error.message });
    }
};

const ManualProduct = async (req, res ) => {
    try {
        const { name, expiryDate, manufacturingDate } = req.body;
        const user_id = req.user;  
    

        // Validate input
        if (!name || !expiryDate) {
            return res.status(400).json({ message: 'Product name and expiry date are required.' });
        }

        const user = await User.findById(user_id);
        if (!user) return res.status(404).json({ msg: "User not found" });

        const userEmail = user.email; 
        // Create a new product
        const newProduct = new Product({
            product_name: name,
            expiry_date: expiryDate,
            mfg_date: manufacturingDate,
            user_id,
            Email: userEmail
        });


        // Save the product to the database
        await newProduct.save();

        res.status(201).json({ message: 'Product added successfully', product: newProduct });
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ message: 'Server error while adding product' });
    }
};

// Controller to get all products for a specific user
const getUserProducts = async (req, res) => {
    const { userId } = req.params;  // Get userId from URL params
    try {
        const products = await Product.find({ user_id: userId });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// Controller function for marking the product as eaten
const markAsEaten = async (req, res) => {
    const { productId } = req.params;

    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).send("Product not found");
        }

        // Update the product status to "eaten"
        product.status = "eaten";
        await product.save();

        res.send("Product status updated to Eaten. Thank you for your response!");
    } catch (error) {
        console.error("Error updating product status: ", error);
        res.status(500).send("Server Error");
    }
};

// Controller function for marking the product as not eaten
const markAsNotEaten = async (req, res) => {
    const { productId } = req.params;

    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).send("Product not found");
        }

        // Update the product status to "not eaten"
        product.status = "not eaten";
        await product.save();

        res.send("Product status updated to Not Eaten. We will remind you again.");
    } catch (error) {
        console.error("Error updating product status: ", error);
        res.status(500).send("Server Error");
    }
};





module.exports = { uploadProductImage, getUserProducts , markAsEaten, markAsNotEaten , ManualProduct};
