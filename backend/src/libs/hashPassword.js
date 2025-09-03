const bcrypt = require("bcrypt");

const passwordEncryption = async (plainPassword) => {
  const salt = await bcrypt.genSalt(10);
  const encryptedPassword = await bcrypt.hash(plainPassword, salt);
  return encryptedPassword;
};

const comparePassword = async (userPassword, encryptedPassword) => {
  return await bcrypt.compare(userPassword, encryptedPassword);
};
module.exports = {
  passwordEncryption,
  comparePassword,
};
