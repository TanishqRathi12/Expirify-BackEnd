const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNumber: { type: String, required: true,  match: [/^\d{10}$/, 'Please fill a valid 10-digit phone number'] }
});

module.exports = mongoose.model('User', UserSchema);
