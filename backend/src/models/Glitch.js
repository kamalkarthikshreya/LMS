const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Glitch = sequelize.define('Glitch', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' }
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('PENDING', 'IN_PROGRESS', 'RESOLVED'),
        defaultValue: 'PENDING'
    }
}, {
    tableName: 'glitches',
    timestamps: true
});

const _origGlitchToJSON = Glitch.prototype.toJSON;
Glitch.prototype.toJSON = function () {
    const values = _origGlitchToJSON.call(this);
    values._id = String(values.id);
    return values;
};

module.exports = Glitch;
