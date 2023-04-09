import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import Post from "./PostModel.js";
import Like from "./LikeModel.js";

const { DataTypes } = Sequelize

const User = db.define('users', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    password: {
        type: DataTypes.TEXT,
    },
    role: {
        type: DataTypes.STRING,
        defaultValue: "general",
    },
    bio: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    website: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    profilePictureUrl: {
        type: DataTypes.TEXT,
    },
    phoneNumber: {
        type: DataTypes.STRING,
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    freezeTableName: true
})

User.hasMany(Like, { foreignKey: 'userId' })
Post.hasMany(Like, { foreignKey: 'foodId' })

export default User;