const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
    {
        token: { type: mongoose.Schema.Types.ObjectId, ref: 'Token', required: true },
        customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        staff: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        staffRating: { type: Number, min: 1, max: 5, default: null },
        comment: { type: String, trim: true, maxlength: 500 },
        isVisible: { type: Boolean, default: true },
    },
    { timestamps: true }
);

reviewSchema.index({ service: 1 });
reviewSchema.index({ staff: 1 });
reviewSchema.index({ customer: 1 });

module.exports = mongoose.model('Review', reviewSchema);
