import { db } from "../../config/db.js";
import hashPassword from "../../utils/hashPassword.js";
import jwt from "jsonwebtoken";

/**
 * @description Update applicant details
 * @route PUT /api/applicants/:applicantId
 * @access Private (authentication middleware required)
 */
const updateApplicant = async (req, res) => {
  try {
    const applicant_token = req.cookies.applicant_access_token;

    const applicant_token_info = jwt.verify(
      applicant_token,
      process.env.JWT_SECRET_APPLICANT
    );

    const applicant_id = applicant_token_info.applicant.applicant_id;

    const { username, first_name, last_name, email } =
      req.body;

    if (
      !username ||
      !email ||
      !first_name ||
      !last_name
    ) {
      return res
        .status(400)
        .send({ error: "Please provide all required fields" });
    }

    // Check if username or email is already in use
    const [usernameExists] = await db.query(
      "SELECT COUNT(*) AS count FROM applicant WHERE username = ? AND applicant_id = ?",
      [username, applicant_id]
    );

    if (usernameExists[0].count > 0) {
      return res.status(400).send({ error: "Username is already in use" });
    }

    const [emailExists] = await db.query(
      "SELECT COUNT(*) AS count FROM applicant WHERE email = ? AND applicant_id = ?",
      [email, applicant_id]
    );

    if (emailExists[0].count > 0) {
      return res.status(400).send({ error: "Email is already in use" });
    }


    const [updatedApplicant] = await db.query(
      `UPDATE applicant
      SET 
        username = ?,  
        first_name = ?, 
        last_name = ?, 
        email = ?, 
        updated_at = NOW()
      WHERE applicant_id = ?`,
      [
        username,
        first_name,
        last_name,
        email,
        applicant_id,
      ]
    );

    if (updatedApplicant.affectedRows === 0) {
      return res
        .status(400)
        .send({ error: "Failed to update applicant details" });
    }

    return res.status(200).send({
      message: "Applicant details updated successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: "Server error" });
  }
};

export default updateApplicant;
