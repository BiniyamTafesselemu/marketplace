const provider = require("../models/ProviderProfile")

async function getProviderProfile(req, res){
    try {
        const providerProfile = await provider.findOne({ where: { user_id: req.user.id }})
        res.json(providerProfile)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

async function updateProviderProfile(req, res){
    try {
        const { phone, business_name, description, price, image, city, sub_city, woreda, location, national_id_photo, FAN_number } = req.body;
        const providerProfile = await provider.findOne({ where: { user_id: req.user.id }});

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

        await providerProfile.save();
        res.json(providerProfile);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function deleteProviderProfile(req, res){
    try {
        const providerProfile = await provider.findOne({ where: { user_id: req.user.id }});

        if (!providerProfile) {
            return res.status(404).json({ message: "Provider profile not found" });
        }

        await providerProfile.destroy();
        res.json({ message: "Provider profile deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getAllProviderProfiles(req, res){
    try {
        const providerProfiles = await provider.findAll();
        res.json(providerProfiles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function createProviderProfile(req, res){
    try {
        const { phone, category_id, business_name, description, price, image, city, sub_city, woreda, location, national_id_photo, FAN_number } = req.body;
        const newProviderProfile = await provider.create({ phone, user_id: req.user.id, category_id, business_name, description, price, image, city, sub_city, woreda, location, national_id_photo, FAN_number });
        res.status(201).json(newProviderProfile);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getProviderProfile,
    updateProviderProfile,
    deleteProviderProfile,
    getAllProviderProfiles,
    createProviderProfile
}