const mongoose = require('mongoose');
const Service = require('../models/Service');


// ===============================
// @desc   Get all services
// ===============================
exports.getServices = async (req, res, next) => {
    try {
        const { category, isActive = 'true' } = req.query;

        const filter = {};

        if (isActive !== 'all') {
            filter.isActive = isActive === 'true';
        }

        if (category) {
            filter.category = category;
        }

        const services = await Service.find(filter)
            .sort({ category: 1, name: 1 });

        res.json({
            success: true,
            count: services.length,
            services
        });

    } catch (err) {
        next(err);
    }
};



// ===============================
// @desc   Get single service
// ===============================
exports.getService = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid service ID'
            });
        }

        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        res.json({
            success: true,
            service
        });

    } catch (err) {
        next(err);
    }
};



// ===============================
// @desc   Create service
// ===============================
exports.createService = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        const allowedFields = [
            'name',
            'description',
            'category',
            'price',
            'duration',
            'isActive'
        ];

        const serviceData = {};

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                serviceData[field] = req.body[field];
            }
        });

        const existing = await Service.findOne({ name: serviceData.name });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'Service with this name already exists'
            });
        }

        const service = await Service.create(serviceData);

        res.status(201).json({
            success: true,
            service
        });

    } catch (err) {
        next(err);
    }
};



// ===============================
// @desc   Update service
// ===============================
exports.updateService = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid service ID'
            });
        }

        const allowedFields = [
            'name',
            'description',
            'category',
            'price',
            'duration',
            'isActive'
        ];

        const updates = {};

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        const service = await Service.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        res.json({
            success: true,
            service
        });

    } catch (err) {
        next(err);
    }
};



// ===============================
// @desc   Delete (Soft deactivate) service
// ===============================
exports.deleteService = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid service ID'
            });
        }

        const service = await Service.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        res.json({
            success: true,
            message: 'Service deactivated'
        });

    } catch (err) {
        next(err);
    }
};