
import jwt from "jsonwebtoken";

/**
 * @desc    Logout user
 * @route   POST /applicant/logout
 * @access  Private
 */
const logoutApplicant = async (req, res) => {
  res.cookie("applicant_access_token", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  return res.status(200).json({ error: "User Logged Out" });
};

export default logoutApplicant;
