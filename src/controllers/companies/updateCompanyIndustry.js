import { db } from "../../config/db.js";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

/**
 * @description Update applicant details
 * @route PUT /api/applicants/:applicantId
 * @access Private (authentication middleware required)
 */
const updateCompanyIndustry = async (req, res) => {
  try {
    const company_token = req.cookies.company_access_token;

    const company_token_info = jwt.verify(
      company_token,
      process.env.JWT_SECRET_COMPANY
    );

    const company_id = company_token_info.company.company_id;

    const { industry_name } = req.body;

    if (!industry_name ) {
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




    let industryId;

    const [industry] = await db.query(
      `SELECT industry_id FROM industry WHERE industry_name = ?`,
      [industry_name]
    );

    if (industry.length > 0) {
      industryId = industry[0].industry_id;
    } else {
      industryId = uuidv4();
      await db.query(
        `INSERT INTO industry (industry_id, industry_name, created_at, updated_at)
         VALUES (?, ?, NOW(), NOW())`,
        [industryId, industry_name]
      );
    }


    const [updatedCompanyContact] = await db.query(
        `UPDATE company_industry
        SET 
          industry_id = ?,
          updated_at = NOW()
        WHERE company_id = ?`,
        [industryId, company_id]
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

export default updateCompanyIndustry;
