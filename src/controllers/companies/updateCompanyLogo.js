import { db } from "../../config/db.js";
import cloudinary from "../../config/cloudinaryConfig.js";
import jwt from "jsonwebtoken";

/**
 * @description Update company CV
 * @route PUT /api/companys/:companyId/cv
 * @access Private (authentication middleware required)
 */
const updateCompanyLogo = async (req, res) => {
  try {
    const company_token = req.cookies.company_access_token;

    const company_token_info = jwt.verify(
      company_token,
      process.env.JWT_SECRET_COMPANY
    );

    const company_id = company_token_info.company.company_id;

    const logo = req.files.logo?.[0]?.path || null;

    if (!logo) {
      return res.status(400).json({
        error: "CV is required.",
      });
    }

    const [companyExist] = await db.query(
      "SELECT COUNT(*) AS count FROM company WHERE company_id = ?",
      [company_id]
    );

    if (companyExist[0].count === 0) {
      return res.status(404).send({ error: "company not found" });
    }

    const [logoExist] = await db.query(
      "SELECT COUNT(*) AS count FROM company_logo WHERE company_id = ?",
      [company_id]
    );

    if (logoExist[0].count === 0) {
      return res.status(404).send({ error: "company CV not found" });
    }
    const logoUploadResult = await cloudinary.uploader.upload(cv_file, {
      folder: "company_logo",
      public_id: `logo_${company_id}`,
      overwrite: true,
    });

    const [updatedCV] = await db.query(
      `UPDATE company_cv
      SET 
        logo = ?, 
        updated_at = NOW()
      WHERE company_id = ?`,
      [logoUploadResult.secure_url, company_id]
    );

    if (updatedCV.affectedRows === 0) {
      return res.status(400).send({
        error: "Failed to update company logo",
      });
    }

    return res.status(200).send({
      message: "company logo updated successfully",
      CV: cvUploadResult.secure_url,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: "Server error" });
  }
};

export default updateCompanyLogo;
