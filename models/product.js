const mongoose = require('mongoose');


const ProductSchema = new mongoose.Schema({
  product_name: { type: String, },
  expiry_date: { type: Date, required: true },
  mfg_date: { type: String },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  Email : { type: String, required: true },
  status: { type: String, default: 'pending' },
});

module.exports = mongoose.model('Product', ProductSchema);
