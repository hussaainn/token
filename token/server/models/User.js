const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        phone: { type: String, trim: true },
        password: { type: String, required: true, minlength: 6 },
        role: { type: String, enum: ['customer', 'staff', 'admin'], default: 'customer' },
        avatar: { type: String, default: '' },
        isActive: { type: Boolean, default: true },
        fcmToken: { type: String, default: '' },
        webPushSubscription: { type: Object, default: null },
        loyaltyPoints: { type: Number, default: 0 },
        loyaltyTier: { type: String, enum: ['bronze', 'silver', 'gold', 'platinum'], default: 'bronze' },
        specialization: { type: String, default: '' }, // for staff
        refreshToken: { type: String },
        resetPasswordToken: { type: String },
        resetPasswordExpire: { type: Date },
    },
    { timestamps: true }
);

// Hash password before save
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    try {
        const bcrypt = require('bcryptjs');
        this.password = await bcrypt.hash(this.password, 12);
    } catch (err) {
        throw err;
    }
});

// Compare password
userSchema.methods.matchPassword = async function (entered) {
    return await bcrypt.compare(entered, this.password);
};

// Never return password
userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    delete obj.refreshToken;
    delete obj.resetPasswordToken;
    delete obj.resetPasswordExpire;
    return obj;
};

// Generate and hash password token
userSchema.methods.getResetPasswordToken = function () {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set expire to 10 minutes from now
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema);
