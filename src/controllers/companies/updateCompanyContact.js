import { db } from "../../config/db.js";
import jwt from "jsonwebtoken";

/**
 * @description Update applicant details
 * @route PUT /api/applicants/:applicantId
 * @access Private (authentication middleware required)
 */
const updateCompanyContact = async (req, res) => {
  try {
    const company_token = req.cookies.company_access_token;

    const company_token_info = jwt.verify(
      company_token,
      process.env.JWT_SECRET_COMPANY
    );

    const company_id = company_token_info.company.company_id;

    const { contact_no, email } = req.body;

    if (!contact_no || !email) {
      return res
        .status(400)
        .send({ error: "Please provide all required fields" });
    }

    const [applicantExist] = await db.query(
      "SELECT COUNT(*) AS count FROM company WHERE company_id = ?",
      [company_id]
    );

    if (applicantExist[0].count === 0) {
      return res.status(404).send({ error: "Company not found" });
    }

    const [updatedCompanyContact] = await db.query(
      `UPDATE company_contact
      SET 
        contact_no = ?,
        email = ?,
        updated_at = NOW()
      WHERE company_id = ?`,
      [contact_no, email, company_id]
    );

    if (updatedCompanyContact.affectedRows === 0) {
      return res
        .status(400)
        .send({ error: "Failed to update company contact" });
    }

    return res.status(200).send({
      message: "Company Contat updated successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: "Server error" });
  }
};

export default updateCompanyContact;
