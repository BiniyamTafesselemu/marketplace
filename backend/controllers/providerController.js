const provider = require("../models/ProviderProfile")

async function getProviderProfile(req, res) {
    try {
        const providerProfile = await provider.findOne({ where: { user_id: req.user.id } })
        res.json(providerProfile)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

async function updateProviderProfile(req, res) {
    try {
        const {
            phone, business_name, description, price, image,
            city, sub_city, woreda, location, national_id_photo,
            FAN_number, services
        } = req.body;

        const providerProfile = await provider.findOne({ where: { user_id: req.user.id } });

        if (!providerProfile) {
            return res.status(404).json({ message: "Provider profile not found" });
        }

        // Image only — no re-verification needed
        if (image) providerProfile.image = image;

        let needsReview = false;

        if (phone) { providerProfile.phone = phone; needsReview = true; }
        if (business_name) { providerProfile.business_name = business_name; needsReview = true; }
        if (description !== undefined) { providerProfile.description = description; }
        if (price) { providerProfile.price = price; needsReview = true; }
        if (city) { providerProfile.city = city; needsReview = true; }
        if (sub_city) { providerProfile.sub_city = sub_city; needsReview = true; }
        if (woreda) { providerProfile.woreda = woreda; needsReview = true; }
        if (location) { providerProfile.location = location; needsReview = true; }
        if (national_id_photo) { providerProfile.national_id_photo = national_id_photo; needsReview = true; }
        if (FAN_number) { providerProfile.FAN_number = FAN_number; needsReview = true; }
        if (services) { providerProfile.services = services; needsReview = true; }

        if (needsReview) {
            providerProfile.verification_status = "pending";
        }

        await providerProfile.save();
        res.json(providerProfile);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function deleteProviderProfile(req, res) {
    try {
        const providerProfile = await provider.findOne({ where: { user_id: req.user.id } });
        if (!providerProfile) {
            return res.status(404).json({ message: "Provider profile not found" });
        }
        await providerProfile.destroy();
        res.json({ message: "Provider profile deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getAllProviderProfiles(req, res) {
    try {
        const providerProfiles = await provider.findAll({
            where: {
                verification_status: "approved",
                account_status: "active"
            },
            attributes: [
                "id", "user_id", "category_id", "business_name",
                "description", "city", "sub_city", "woreda", "location",
                "price", "phone", "image", "services",
                "verification_status", "account_status", "createdAt"
            ]
        });
        res.json(providerProfiles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function createProviderProfile(req, res) {
    try {
        const {
            phone, category_id, business_name, description, price, image,
            city, sub_city, woreda, location, national_id_photo,
            FAN_number, services
        } = req.body;

        const missing = [];
        if (!business_name) missing.push("business_name");
        if (!phone) missing.push("phone");
        if (!category_id) missing.push("category_id");
        if (!city) missing.push("city");
        if (!sub_city) missing.push("sub_city");
        if (!woreda) missing.push("woreda");
        if (!location) missing.push("location");
        if (!FAN_number) missing.push("FAN_number");
        if (!national_id_photo) missing.push("national_id_photo");
        if (!services || !Array.isArray(services) || services.length === 0) missing.push("at least one service");

        if (missing.length > 0) {
            return res.status(400).json({
                message: `Missing required fields: ${missing.join(", ")}`
            });
        }

        // Validate each service has required docs
        for (const svc of services) {
            if (!svc.trade_license) {
                return res.status(400).json({
                    message: `Trade license required for service: ${svc.service}`
                });
            }
        }

        const newProviderProfile = await provider.create({
            phone, user_id: req.user.id, category_id, business_name,
            description, price, image, city, sub_city, woreda, location,
            national_id_photo, FAN_number, services,
            verification_status: "pending",
            account_status: "active"
        });

        res.status(201).json(newProviderProfile);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getAllProviderProfilesAdmin(req, res) {
    try {
        const providerProfiles = await provider.findAll();
        res.json(providerProfiles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function updateVerificationStatus(req, res) {
    try {
        const { id } = req.params;
        const { verification_status, rejection_reason } = req.body;

        const providerProfile = await provider.findByPk(id);
        if (!providerProfile) {
            return res.status(404).json({ message: "Provider profile not found" });
        }

        providerProfile.verification_status = verification_status;
        if (rejection_reason) providerProfile.rejection_reason = rejection_reason;

        await providerProfile.save();
        res.json(providerProfile);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function updateAccountStatus(req, res) {
    try {
        const { id } = req.params;
        const { account_status, suspension_reason } = req.body;

        const providerProfile = await provider.findByPk(id);
        if (!providerProfile) {
            return res.status(404).json({ message: "Provider profile not found" });
        }

        providerProfile.account_status = account_status;
        providerProfile.suspension_reason = suspension_reason || null;

        await providerProfile.save();
        res.json(providerProfile);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getProviderProfile,
    updateProviderProfile,
    deleteProviderProfile,
    getAllProviderProfiles,
    createProviderProfile,
    getAllProviderProfilesAdmin,
    updateVerificationStatus,
    updateAccountStatus
}