import { db } from "../../config/db.js";
import cloudinary from "../../config/cloudinaryConfig.js";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

/**
 * @description Update company details (logo, industry, address, or general information)
 * @route PUT /api/company/:companyId
 * @access Private (authentication middleware required)
 */
const UpdateCompanyAccount = async (req, res) => {
  try {
    const company_token = req.cookies.company_access_token;
    const company_token_info = jwt.verify(
      company_token,
      process.env.JWT_SECRET_COMPANY
    );
    const company_id = company_token_info.company.company_id;

    // Validate if company exists
    const [companyExist] = await db.query(
      "SELECT COUNT(*) AS count FROM company WHERE company_id = ?",
      [company_id]
    );
    if (companyExist[0].count === 0) {
      return res.status(404).send({ error: "Company not found" });
    }

    // Extract fields from request body and files
    const { email, company_name, description, industry_name, contact_no, address } = req.body;
    const logo = req.files?.logo?.[0]?.path || null;

    // Update logo if provided
    if (logo) {
      const logoUploadResult = await cloudinary.uploader.upload(logo, {
        folder: "company_logo",
        public_id: `logo_${company_id}`,
        overwrite: true,
      });
      await db.query(
        `UPDATE company_cv SET logo = ?, updated_at = NOW() WHERE company_id = ?`,
        [logoUploadResult.secure_url, company_id]
      );
    }

    // Update industry if provided
    if (industry_name) {
      let industryId;
      const [industry] = await db.query(
        "SELECT industry_id FROM industry WHERE industry_name = ?",
        [industry_name]
      );

      if (industry.length > 0) {
        industryId = industry[0].industry_id;
      } else {
        industryId = uuidv4();
        await db.query(
          `INSERT INTO industry (industry_id, industry_name, created_at, updated_at) VALUES (?, ?, NOW(), NOW())`,
          [industryId, industry_name]
        );
      }

      await db.query(
        `UPDATE company_industry SET industry_id = ?, updated_at = NOW() WHERE company_id = ?`,
        [industryId, company_id]
      );
    }

    // Update address if provided
    if (address) {
      await db.query(
        `UPDATE company_address SET address = ?, updated_at = NOW() WHERE company_id = ?`,
        [address, company_id]
      );
    }

    // Update general details if provided
    if (email || company_name || description || contact_no) {
      const queryFields = [];
      const queryValues = [];

      if (email) {
        queryFields.push("email = ?");
        queryValues.push(email);
      }
      if (company_name) {
        queryFields.push("company_name = ?");
        queryValues.push(company_name);
      }
      if (description) {
        queryFields.push("description = ?");
        queryValues.push(description);
      }
      if (contact_no) {
        queryFields.push("contact_no = ?");
        queryValues.push(contact_no);
      }

      queryValues.push(company_id);
      await db.query(
        `UPDATE company SET ${queryFields.join(", ")}, updated_at = NOW() WHERE company_id = ?`,
        queryValues
      );
    }

    return res.status(200).send({ message: "Company details updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: "Server error" });
  }
};

export default UpdateCompanyAccount;
