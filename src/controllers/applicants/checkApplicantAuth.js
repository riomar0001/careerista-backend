import jwt from "jsonwebtoken";
/**
 * @desc    Check if user is authenticated
 * @route   GET /users/auth
 * @access  Private
 */
const checkApplicantAuth = async (req, res) => {
    const applicant_token = req.cookies["applicant_access_token"]; // Assuming you're storing the JWT in a cookie named 'accessToken'
  
    if (!applicant_token) {
      return res.status(403).json({ forbidden: "No token provided" });
    }
  
    jwt.verify(applicant_token, process.env.JWT_SECRET_APPLICANT, (err) => {
      if (err) {
        return res.status(404).json({ forbidden: "Unauthenticated" });
      }
  
      res.status(200).json({ message: "Authenticated" });
    });
  };

  export default checkApplicantAuth;