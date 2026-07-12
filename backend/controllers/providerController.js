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
            FAN_number, trade_license, skill_certificate
        } = req.body;

        const providerProfile = await provider.findOne({ where: { user_id: req.user.id } });

        if (!providerProfile) {
            return res.status(404).json({ message: "Provider profile not found" });
        }

        providerProfile.phone = phone || providerProfile.phone;
        providerProfile.business_name = business_name || providerProfile.business_name;
        providerProfile.description = description || providerProfile.description;
        providerProfile.price = price || providerProfile.price;
        providerProfile.image = image || providerProfile.image;
        providerProfile.city = city || providerProfile.city;
        providerProfile.sub_city = sub_city || providerProfile.sub_city;
        providerProfile.woreda = woreda || providerProfile.woreda;
        providerProfile.location = location || providerProfile.location;
        providerProfile.national_id_photo = national_id_photo || providerProfile.national_id_photo;
        providerProfile.FAN_number = FAN_number || providerProfile.FAN_number;
        providerProfile.trade_license = trade_license || providerProfile.trade_license;
        providerProfile.skill_certificate = skill_certificate || providerProfile.skill_certificate;
        providerProfile.verification_status = "pending";

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
        const { Op } = require("sequelize");
        const providerProfiles = await provider.findAll({
            where: {
                verification_status: "approved",
                account_status: "active"
            }
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
            FAN_number, trade_license, skill_certificate
        } = req.body;

        const newProviderProfile = await provider.create({
            phone, user_id: req.user.id, category_id, business_name,
            description, price, image, city, sub_city, woreda, location,
            national_id_photo, FAN_number, trade_license, skill_certificate,
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
        if (rejection_reason) {
            providerProfile.rejection_reason = rejection_reason;
        }

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
        if (suspension_reason) {
            providerProfile.suspension_reason = suspension_reason;
        } else {
            providerProfile.suspension_reason = null;
        }

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