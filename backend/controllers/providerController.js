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

        // Image only — no re-verification needed
        if (image) providerProfile.image = image;

        // Track if any sensitive field changed
        let needsReview = false;

        if (phone) { providerProfile.phone = phone; needsReview = true; }
        if (business_name) { providerProfile.business_name = business_name; needsReview = true; }
        if (description) { providerProfile.description = description; needsReview = true; }
        if (price) { providerProfile.price = price; needsReview = true; }
        if (city) { providerProfile.city = city; needsReview = true; }
        if (sub_city) { providerProfile.sub_city = sub_city; needsReview = true; }
        if (woreda) { providerProfile.woreda = woreda; needsReview = true; }
        if (location) { providerProfile.location = location; needsReview = true; }
        if (national_id_photo) { providerProfile.national_id_photo = national_id_photo; needsReview = true; }
        if (FAN_number) { providerProfile.FAN_number = FAN_number; needsReview = true; }
        if (trade_license) { providerProfile.trade_license = trade_license; needsReview = true; }
        if (skill_certificate) { providerProfile.skill_certificate = skill_certificate; needsReview = true; }

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
        res.status(500).json({ error: error?.message || String(error) });
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
                "price", "phone", "image", "verification_status",
                "account_status", "createdAt"
                // FAN_number, national_id_photo, trade_license,
                // skill_certificate are excluded from public view
            ]
        });
        res.json(providerProfiles);
    } catch (error) {
        res.status(500).json({ error: error?.message || String(error) });
    }
}

async function createProviderProfile(req, res) {
    try {
        const {
            phone, category_id, business_name, description, price, image,
            city, sub_city, woreda, location, national_id_photo,
            FAN_number, trade_license, skill_certificate
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
        if (!trade_license) missing.push("trade_license");

        if (missing.length > 0) {
            return res.status(400).json({
                message: `Missing required fields: ${missing.join(", ")}`
            });
        }

        const newProviderProfile = await provider.create({
            phone, user_id: req.user.id, category_id, business_name,
            description, price, image, city, sub_city, woreda, location,
            national_id_photo, FAN_number, trade_license, skill_certificate,
            verification_status: "pending",
            account_status: "active"
        });

        res.status(201).json(newProviderProfile);
    } catch (error) {
        res.status(500).json({ error: error?.message || String(error) });
    }
}

async function getAllProviderProfilesAdmin(req, res) {
    try {
        const providerProfiles = await provider.findAll();
        res.json(providerProfiles);
    } catch (error) {
        res.status(500).json({ error: error?.message || String(error) });
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
        res.status(500).json({ error: error?.message || String(error) });
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
        res.status(500).json({ error: error?.message || String(error) });
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