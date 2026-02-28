const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        description: { type: String, default: '' },
        duration: { type: Number, required: true, min: 5 }, // minutes
        price: { type: Number, required: true, min: 0 },
        category: {
            type: String,
            enum: ['hair', 'skin', 'nail', 'makeup', 'beard', 'waxing', 'threading', 'massage', 'other'],
            default: 'other',
        },
        isActive: { type: Boolean, default: true },
        imageUrl: { type: String, default: '' },
        averageRating: { type: Number, default: 0 },
        totalReviews: { type: Number, default: 0 },
    },
    { timestamps: true }
);

serviceSchema.index({ category: 1, isActive: 1 });

module.exports = mongoose.model('Service', serviceSchema);
