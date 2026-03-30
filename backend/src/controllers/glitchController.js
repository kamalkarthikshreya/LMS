const { Glitch, User } = require('../models');

// Report a new glitch
const createGlitch = async (req, res) => {
    try {
        const { title, description } = req.body;
        const userId = req.user.id; // user reporting the glitch

        if (!title || !description) {
            return res.status(400).json({ message: 'Title and description are required.' });
        }

        const glitch = await Glitch.create({
            userId,
            title,
            description,
            status: 'PENDING'
        });

        res.status(201).json(glitch);
    } catch (error) {
        console.error('Error creating glitch:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get glitches (Admins/IT Admins see all, regular users see only their own)
const getGlitches = async (req, res) => {
    try {
        let whereClause = {};

        // If not an admin/IT admin, restrict to user's reported glitches
        if (req.user.role !== 'ADMIN' && req.user.role !== 'IT_ADMIN') {
            whereClause.userId = req.user.id;
        }

        const glitches = await Glitch.findAll({
            where: whereClause,
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'email', 'role']
            }],
            order: [['createdAt', 'DESC']]
        });

        res.json(glitches);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single glitch
const getGlitchById = async (req, res) => {
    try {
        const glitch = await Glitch.findByPk(req.params.id, {
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'email', 'role']
            }]
        });

        if (!glitch) {
            return res.status(404).json({ message: 'Glitch report not found' });
        }

        // Restrict access if not admin
        if (req.user.role !== 'ADMIN' && req.user.role !== 'IT_ADMIN' && glitch.userId !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to view this report.' });
        }

        res.json(glitch);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update glitch status (IT_ADMIN or ADMIN only)
const updateGlitchStatus = async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!['PENDING', 'IN_PROGRESS', 'RESOLVED'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const glitch = await Glitch.findByPk(req.params.id);

        if (!glitch) {
            return res.status(404).json({ message: 'Glitch report not found' });
        }

        glitch.status = status;
        await glitch.save();

        res.json(glitch);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a glitch report
const deleteGlitch = async (req, res) => {
    try {
        const glitch = await Glitch.findByPk(req.params.id);

        if (!glitch) {
            return res.status(404).json({ message: 'Glitch report not found' });
        }

        await glitch.destroy();

        res.json({ message: 'Glitch report deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createGlitch,
    getGlitches,
    getGlitchById,
    updateGlitchStatus,
    deleteGlitch
};
