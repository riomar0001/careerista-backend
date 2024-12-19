import bcrypt from "bcryptjs";

const hashPassword = async (password) => {
  const saltRound = 10;
  return await bcrypt.hash(password, saltRound);
};

export default hashPassword;