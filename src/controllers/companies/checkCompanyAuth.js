import jwt from "jsonwebtoken";
/**
 * @desc    Check if user is authenticated
 * @route   GET /users/auth
 * @access  Private
 */
const checkCompanyAuth = async (req, res) => {
    const company_token = req.cookies["company_access_token"]; // Assuming you're storing the JWT in a cookie named 'accessToken'
  
    if (!company_token) {
      return res.status(403).json({ forbidden: "No token provided" });
    }
  
    jwt.verify(company_token, process.env.JWT_SECRET_COMPANY, (err) => {
      if (err) {
        return res.status(404).json({ forbidden: "Unauthenticated" });
      }
  
      res.status(200).json({ message: "Authenticated" });
    });
  };

  export default checkCompanyAuth;