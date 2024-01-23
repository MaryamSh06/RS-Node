
const {DataTypes} = require('sequelize');
const sequelize = require("../Database/connection")
const bcrypt = require('bcrypt');

const User = sequelize.define('User',{
  username: DataTypes.STRING,
  email: DataTypes.STRING,
  password: DataTypes.STRING,
});


User.beforeCreate(async (user) => {
  const saltRounds = 10;
  user.password = await bcrypt.hash(user.password, saltRounds);
});
module.exports = User;