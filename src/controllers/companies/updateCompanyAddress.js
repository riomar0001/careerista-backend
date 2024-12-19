import { db } from "../../config/db.js";
import jwt from "jsonwebtoken";

/**
 * @description Update applicant details
 * @route PUT /api/applicants/:applicantId
 * @access Private (authentication middleware required)
 */
const updateCompanyAddress = async (req, res) => {
  try {
    const company_token = req.cookies.company_access_token;

    const company_token_info = jwt.verify(
      company_token,
      process.env.JWT_SECRET_COMPANY
    );

    const company_id = company_token_info.company.company_id;

    const { address } = req.body;

    if (!address) {
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

    const [updatedCompanyAddress] = await db.query(
      `UPDATE company_address
      SET 
        address = ?,
        updated_at = NOW()
      WHERE company_id = ?`,
      [address, company_id]
    );

    if (updatedCompanyAddress.affectedRows === 0) {
      return res
        .status(400)
        .send({ error: "Failed to update company address" });
    }

    return res.status(200).send({
      message: "Company details updated successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: "Server error" });
  }
};

export default updateCompanyAddress;
