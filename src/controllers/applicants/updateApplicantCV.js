import { db } from "../../config/db.js";
import cloudinary from "../../config/cloudinaryConfig.js";
import jwt from "jsonwebtoken";

/**
 * @description Update applicant CV
 * @route PUT /api/applicants/:applicantId/cv
 * @access Private (authentication middleware required)
 */
const updateApplicantCV = async (req, res) => {
  try {
    const applicant_token = req.cookies.applicant_access_token;

    const applicant_token_info = jwt.verify(
      applicant_token,
      process.env.JWT_SECRET_APPLICANT
    );

    const applicant_id = applicant_token_info.applicant.applicant_id;

    const cv_file = req.files.cv_file?.[0]?.path || null;

    if (!cv_file) {
      return res.status(400).json({
        error: "CV is required.",
      });
    }

    const [applicantExist] = await db.query(
      "SELECT COUNT(*) AS count FROM applicant WHERE applicant_id = ?",
      [applicant_id]
    );

    if (applicantExist[0].count === 0) {
      return res.status(404).send({ error: "Applicant not found" });
    }

    const [cvExist] = await db.query(
      "SELECT COUNT(*) AS count FROM applicant_cv WHERE applicant_id = ?",
      [applicant_id]
    );

    if (cvExist[0].count === 0) {
      return res.status(404).send({ error: "Applicant CV not found" });
    }
    const cvUploadResult = await cloudinary.uploader.upload(cv_file, {
      folder: "applicant_cv",
      public_id: `cv_${applicant_id}`,
      overwrite: true,
    });

    const [updatedCV] = await db.query(
      `UPDATE applicant_cv
      SET 
        cv_file = ?, 
        updated_at = NOW()
      WHERE applicant_id = ?`,
      [cvUploadResult.secure_url, applicant_id]
    );

    if (updatedCV.affectedRows === 0) {
      return res.status(400).send({
        error: "Failed to update applicant CV",
      });
    }

    return res.status(200).send({
      message: "Applicant CV updated successfully",
      CV: cvUploadResult.secure_url,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: "Server error" });
  }
};

export default updateApplicantCV;
