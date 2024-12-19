import { db } from "../../config/db.js";
import jwt from "jsonwebtoken";

// Update company details
const UpdateComapnyInformation = async (req, res) => {
  try {
    const company_token = req.cookies.company_access_token;
    const company_token_info = jwt.verify(company_token, process.env.JWT_SECRET_COMPANY);
    const company_id = company_token_info.company.company_id;

    const { email, company_name, description, done_onboarding, address, contact_no, contact_email } = req.body;

    // Update company details
    await db.query(
      `UPDATE company 
       SET email = ?, company_name = ?, description = ?, done_onboarding = ?, updated_at = NOW() 
       WHERE company_id = ?`,
      [email, company_name, description, done_onboarding, company_id]
    );

    // Update address if provided
    if (address) {
      await db.query(
        `UPDATE company_address 
         SET address = ?, updated_at = NOW() 
         WHERE company_id = ?`,
        [address, company_id]
      );
    }

    // Update contact if provided
    if (contact_no || contact_email) {
      await db.query(
        `UPDATE company_contact 
         SET contact_no = ?, email = ?, updated_at = NOW() 
         WHERE company_id = ?`,
        [contact_no, contact_email, company_id]
      );
    }

    res.status(200).json({ message: "Company details updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating company details" });
  }
};

export default UpdateComapnyInformation;
