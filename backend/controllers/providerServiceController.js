const ProviderService = require("../models/ProviderService");
const ProviderProfile = require("../models/ProviderProfile");

// Get all approved services (public)
async function getAllServices(req, res) {
    try {
        const services = await ProviderService.findAll({
            where: { status: "approved" },
            include: [{
                model: ProviderProfile,
                where: {
                    verification_status: "approved",
                    account_status: "active"
                },
                attributes: ["id", "business_name", "city", "sub_city", "woreda", "location", "phone", "image", "user_id"]
            }]
        });
        res.json(services);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Get my services (provider)
async function getMyServices(req, res) {
    try {
        const profile = await ProviderProfile.findOne({ where: { user_id: req.user.id } });
        if (!profile) return res.status(404).json({ message: "Provider profile not found" });

        const services = await ProviderService.findAll({
            where: { provider_id: profile.id }
        });
        res.json(services);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Add a service
async function addService(req, res) {
    try {
        const profile = await ProviderProfile.findOne({ where: { user_id: req.user.id } });
        if (!profile) return res.status(404).json({ message: "Create a provider profile first" });

        const { service, price, description, trade_license, skill_certificate, payment_method, payment_account } = req.body;

        const missing = [];
        if (!service) missing.push("service");
        if (!price) missing.push("price");
        if (!payment_method) missing.push("payment_method");
        if (!payment_account) missing.push("payment_account");
        if (!trade_license) missing.push("trade_license");

        if (missing.length > 0) {
            return res.status(400).json({ message: `Missing required fields: ${missing.join(", ")}` });
        }

        const newService = await ProviderService.create({
            provider_id: profile.id,
            service, price, description,
            trade_license, skill_certificate,
            payment_method, payment_account,
            status: "pending"
        });

        res.status(201).json(newService);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Update a service
async function updateService(req, res) {
    try {
        const profile = await ProviderProfile.findOne({ where: { user_id: req.user.id } });
        if (!profile) return res.status(404).json({ message: "Provider profile not found" });

        const { id } = req.params;
        const svc = await ProviderService.findOne({ where: { id, provider_id: profile.id } });
        if (!svc) return res.status(404).json({ message: "Service not found" });

        const { price, description, trade_license, skill_certificate, payment_method, payment_account } = req.body;

        if (price) svc.price = price;
        if (description !== undefined) svc.description = description;
        if (trade_license) svc.trade_license = trade_license;
        if (skill_certificate) svc.skill_certificate = skill_certificate;
        if (payment_method) svc.payment_method = payment_method;
        if (payment_account) svc.payment_account = payment_account;
        svc.status = "pending";

        await svc.save();
        res.json(svc);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Delete a service
async function deleteService(req, res) {
    try {
        const profile = await ProviderProfile.findOne({ where: { user_id: req.user.id } });
        if (!profile) return res.status(404).json({ message: "Provider profile not found" });

        const { id } = req.params;
        const svc = await ProviderService.findOne({ where: { id, provider_id: profile.id } });
        if (!svc) return res.status(404).json({ message: "Service not found" });

        await svc.destroy();
        res.json({ message: "Service deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Admin — get all services
async function getAllServicesAdmin(req, res) {
    try {
        const services = await ProviderService.findAll({
            include: [{
                model: ProviderProfile,
                attributes: ["id", "business_name", "city", "user_id"]
            }]
        });
        res.json(services);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Admin — update service status
async function updateServiceStatus(req, res) {
    try {
        const { id } = req.params;
        const { status, rejection_reason } = req.body;

        const svc = await ProviderService.findByPk(id);
        if (!svc) return res.status(404).json({ message: "Service not found" });

        svc.status = status;
        if (rejection_reason) svc.rejection_reason = rejection_reason;

        await svc.save();
        res.json(svc);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getAllServices,
    getMyServices,
    addService,
    updateService,
    deleteService,
    getAllServicesAdmin,
    updateServiceStatus
};