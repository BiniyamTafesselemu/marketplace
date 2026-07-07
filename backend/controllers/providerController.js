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
        const { name, email, phone, address } = req.body;
        const providerProfile = await provider.findOne({ where: { user_id: req.user.id }});

        if (!providerProfile) {
            return res.status(404).json({ message: "Provider profile not found" });
        }

        providerProfile.name = name || providerProfile.name;
        providerProfile.email = email || providerProfile.email;
        providerProfile.phone = phone || providerProfile.phone;
        providerProfile.address = address || providerProfile.address;

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
        const { name, email, phone, address } = req.body;
        const newProviderProfile = await provider.create({ name, email, phone, address, user_id: req.user.id });
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