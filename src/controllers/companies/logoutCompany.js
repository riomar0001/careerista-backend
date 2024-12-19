
import jwt from "jsonwebtoken";

/**
 * @desc    Logout user
 * @route   POST /company/logout
 * @access  Private
 */
const logoutCompany = async (req, res) => {
  res.cookie("company_access_token", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  return res.status(200).json({ error: "User Logged Out" });
};

export default logoutCompany;
