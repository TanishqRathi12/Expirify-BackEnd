const express = require('express');
const fileUpload = require('express-fileupload');
const {
    uploadProductImage,
    getUserProducts,
    markAsEaten,
    markAsNotEaten,
    ManualProduct
} = require('../controllers/product.controller');
const router = express.Router();
const verifyToken = require('../middlewares/auth.middleware');

router.use(fileUpload());

router.post('/scan', verifyToken, (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    const uploadedFile = req.files.image;
    const uploadPath = `./uploads/${uploadedFile.name}`; 

   
    uploadedFile.mv(uploadPath, (err) => {
        if (err) {
            return res.status(500).send(err);
        }
        uploadProductImage(req, res, uploadPath); 
    });
});

router.get('/:userId/products', getUserProducts);
router.get('/products/:productId/eaten', markAsEaten);
router.get('/products/:productId/not-eaten', markAsNotEaten);
router.post('/manual', verifyToken, ManualProduct);

module.exports = router;
