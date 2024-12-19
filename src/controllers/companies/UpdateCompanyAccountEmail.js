import { db } from "../../config/db.js";
import jwt from "jsonwebtoken";

/**
 * @description Update company email address
 * @route       PUT /api/company/update-email
 * @access      Private (authentication middleware required)
 */
const UpdateCompanyAccountEmail = async (req, res) => {
  try {
    const company_token = req.cookies.company_access_token;

    const company_token_info = jwt.verify(
      company_token,
      process.env.JWT_SECRET_COMPANY
    );

    const current_email = company_token_info.company.email;
    const { new_email } = req.body;

    if (!new_email) {
      return res.status(400).send({ error: "Please provide a new email address" });
    }

    // Check if the new email already exists in the database
    const [existingEmail] = await db.query(
      "SELECT email FROM company WHERE email = ?",
      [new_email]
    );

    if (existingEmail.length > 0) {
      return res.status(400).send({ error: "Email already in use" });
    }

    // Update the email in the database
    const [updatedCompany] = await db.query(
      `UPDATE company
      SET 
        email = ?, 
        updated_at = NOW()
      WHERE email = ?`,
      [new_email, current_email]
    );

    if (updatedCompany.affectedRows === 0) {
      return res.status(400).send({ error: "Failed to update email" });
    }

    return res.status(200).send({
      message: "Email updated successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: "Server error" });
  }
};

export default UpdateCompanyAccountEmail;
