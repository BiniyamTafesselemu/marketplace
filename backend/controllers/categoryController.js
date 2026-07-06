const Category = require('../models/Category') // ✅



async function getAllCategories (req,res) {
    // Implementation for getting all categories
    try{
        const categories = await Category.findAll();
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: "Error fetching categories" });
    }
}


async function createCategory (req,res) {
    try {
        const { name } = req.body;
        const newCategory = await Category.create({ name });
        res.status(201).json(newCategory);
    }
    catch (error) {
        res.status(500).json({ message: "Error creating category" });
    }
}

async function updateCategory (req, res){
    try {
        const { id } = req.params;
        const { name } = req.body;
        const category = await Category.findByPk(id);

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        category.name = name;
        await category.save();

        res.status(200).json(category); 
    }
    catch (error) {
        res.status(500).json({ message: "Error updating category" });
    }
}

async function deleteCategory (req, res){
    try {
        const { id } = req.params;
        const category = await Category.findByPk(id);

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        await category.destroy();
        res.status(200).json({ message: "Category deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting category" });
    }
}

async function getCategoryById (req, res) {
    try {
        const { id } = req.params;
        const category = await Category.findByPk(id);

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.status(200).json(category);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching category" });
    }
}

module.exports = {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryById
}