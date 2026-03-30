const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Subject = sequelize.define('Subject', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        defaultValue: ''
    },
    instructorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' }
    },
    thumbnail: {
        type: DataTypes.STRING,
        defaultValue: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    units: {
        type: DataTypes.JSONB,
        defaultValue: []
    },
    category: {
        type: DataTypes.ENUM('BSc', 'BCA', 'BE', 'General'),
        defaultValue: 'General'
    }
}, {
    tableName: 'subjects',
    timestamps: true,
    hooks: {
        beforeCreate: (subject) => {
            const mappings = {
                physics: '/physics.png', // Local Verified Asset
                chemistry: '/uploads/chemistry.png',
                math: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&q=80',
                electronics: '/uploads/basic_electronics.png',
                computer: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
                biology: 'https://images.unsplash.com/photo-1530210124550-912dc1381cb8?w=800&q=80',
                history: 'https://images.unsplash.com/photo-1461360346148-3470a5c6e90e?w=800&q=80',
                science: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800&q=80'
            };

            const title = subject.title.toLowerCase();
            const matchedKey = Object.keys(mappings).find(key => title.includes(key));
            
            if (matchedKey) {
                subject.thumbnail = mappings[matchedKey];
            }
        }
    }
});

const _origSubjectToJSON = Subject.prototype.toJSON;
Subject.prototype.toJSON = function () {
    const values = _origSubjectToJSON.call(this);
    values._id = String(values.id);
    return values;
};

module.exports = Subject;
