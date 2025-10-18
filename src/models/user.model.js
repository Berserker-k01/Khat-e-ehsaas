// src/models/user.model.js
const mongoose = require('mongoose');
const crypto = require('crypto');
const bcrypt = require('bcryptjs'); // <-- NAYI LINE

const userSchema = new mongoose.Schema({
    // ... (purane fields waise hi)
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    connectionCode: { type: String, unique: true },
    partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });

// User save hone se pehle, password HASH karo
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) { // Agar password change nahi hua to kuch mat karo
        return next();
    }

    // Generate a salt and hash the password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

    if (this.isNew && !this.connectionCode) {
        this.connectionCode = crypto.randomBytes(4).toString('hex').toUpperCase();
    }
    next();
});

// Password compare karne ke liye ek helper method
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;