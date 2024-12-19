import { db } from "../../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/**
 * @description Update applicant password
 * @route       PUT /api/applicant/update-password
 * @access      Private (authentication middleware required)
 */
const UpdateApplicantPassword = async (req, res) => {
  try {
    const applicant_token = req.cookies.applicant_access_token;

    // Verify JWT token
    const applicant_token_info = jwt.verify(
      applicant_token,
      process.env.JWT_SECRET_APPLICANT
    );

    const applicant_id = applicant_token_info.applicant.applicant_id;
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).send({ error: "Please provide both current and new passwords" });
    }

    // Retrieve the current hashed password from the database
    const [applicant] = await db.query(
      "SELECT password FROM applicant WHERE applicant_id = ?",
      [applicant_id]
    );

    if (applicant.length === 0) {
      return res.status(404).send({ error: "Applicant not found" });
    }

    const isPasswordMatch = await bcrypt.compare(
      current_password,
      applicant[0].password
    );

    if (!isPasswordMatch) {
      return res.status(401).send({ error: "Current password is incorrect" });
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(new_password, 10);

    // Update the password in the database
    const [updatedApplicant] = await db.query(
      `UPDATE applicant
      SET 
        password = ?, 
        updated_at = NOW()
      WHERE applicant_id = ?`,
      [hashedNewPassword, applicant_id]
    );

    if (updatedApplicant.affectedRows === 0) {
      return res.status(400).send({ error: "Failed to update password" });
    }

    return res.status(200).send({
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: "Server error" });
  }
};

export default UpdateApplicantPassword;
