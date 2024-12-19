
import { db } from "../../config/db.js";
import jwt from "jsonwebtoken";

/**
 * @description Update applicant contact details
 * @route PUT /api/applicants/:applicantId/contact
 * @access Private (authentication middleware required)
 */
const updateApplicantContact = async (req, res) => {
  try {
    const applicant_token = req.cookies.applicant_access_token;

    const applicant_token_info = jwt.verify(
      applicant_token,
      process.env.JWT_SECRET_APPLICANT
    );

    const applicant_id = applicant_token_info.applicant.applicant_id;

    const { contact_no, email } = req.body;

    if (!contact_no || !email) {
      return res.status(400).send({ error: "Please provide contact number and email" });
    }

    const [applicantExist] = await db.query(
      "SELECT COUNT(*) AS count FROM applicant WHERE applicant_id = ?",
      [applicant_id]
    );

    if (applicantExist[0].count === 0) {
      return res.status(404).send({ error: "Applicant not found" });
    }

    const [contactExist] = await db.query(
      "SELECT COUNT(*) AS count FROM applicant_contact WHERE applicant_id = ?",
      [applicant_id]
    );

    if (contactExist[0].count === 0) {
      return res.status(404).send({ error: "Applicant contact information not found" });
    }

    const [updatedContact] = await db.query(
      `UPDATE applicant_contact
      SET 
        contact_no = ?, 
        email = ?, 
        updated_at = NOW()
      WHERE applicant_id = ?`,
      [
        contact_no,
        email,
        applicant_id
      ]
    );

    if (updatedContact.affectedRows === 0) {
      return res.status(400).send({ error: "Failed to update applicant contact information" });
    }

    return res.status(200).send({
      message: "Applicant contact information updated successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: "Server error" });
  }
};

export default updateApplicantContact;
