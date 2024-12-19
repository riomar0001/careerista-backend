import { db } from "../../config/db.js";
import bcrypt from "bcryptjs";
import hashPassword  from "../../utils/hashPassword.js";
import jwt from "jsonwebtoken";

/**
 * @description Update company password
 * @route       PUT /api/company/update-password
 * @access      Private (authentication middleware required)
 */
const UpdateCompanyAccountPassword = async (req, res) => {
  try {
    const company_token = req.cookies.company_access_token;

    const company_token_info = jwt.verify(
      company_token,
      process.env.JWT_SECRET_COMPANY
    );

    const company_id = company_token_info.company.company_id;

    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res
        .status(400)
        .send({ error: "Please provide both current and new passwords" });
    }

    // Retrieve the current hashed password from the database
    const [company] = await db.query(
      "SELECT password FROM company WHERE company_id = ?",
      [company_id]
    );

    if (company.length === 0) {
      return res.status(404).send({ error: "Company not found" });
    }

    const isPasswordMatch = await bcrypt.compare(
      current_password,
      company[0].password
    );

    if (!isPasswordMatch) {
      return res
        .status(401)
        .send({ error: "Current password is incorrect" });
    }

    // Hash the new password
    const hashedNewPassword = await hashPassword(new_password);

    // Update the password in the database
    const [updatedCompany] = await db.query(
      `UPDATE company
      SET 
        password = ?, 
        updated_at = NOW()
      WHERE company_id = ?`,
      [hashedNewPassword, company_id]
    );

    if (updatedCompany.affectedRows === 0) {
      return res
        .status(400)
        .send({ error: "Failed to update password" });
    }

    return res.status(200).send({
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: "Server error" });
  }
};

export default UpdateCompanyAccountPassword;
