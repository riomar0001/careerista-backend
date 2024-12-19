import { db } from "../../config/db.js";
import jwt from "jsonwebtoken";

/**
 * @description Update applicant experience
 * @route PUT /api/applicants/:experience_id/:experienceId
 * @access Private (authentication middleware required)
 */
const updateApplicantExperience = async (req, res) => {
  try {
    const applicant_token = req.cookies.applicant_access_token;

    const applicant_token_info = jwt.verify(
      applicant_token,
      process.env.JWT_SECRET_APPLICANT
    );

    const applicant_id = applicant_token_info.applicant.applicant_id;

    const { experience_id } = req.params;
    const { company, address, position, years_of_stay } = req.body;

    if (!company || !address || !position || !years_of_stay) {
      return res
        .status(400)
        .send({ error: "Please provide all required fields" });
    }

    const [applicantExist] = await db.query(
      "SELECT COUNT(*) AS count FROM applicant WHERE applicant_id = ?",
      [applicant_id]
    );

    if (applicantExist[0].count === 0) {
      return res.status(404).send({ error: "Applicant not found" });
    }

    const [experienceExist] = await db.query(
      "SELECT COUNT(*) AS count FROM experience WHERE experience_id = ? AND applicant_id = ?",
      [experience_id, applicant_id]
    );

    if (experienceExist[0].count === 0) {
      return res.status(404).send({ error: "Experience not found" });
    }

    const [updatedExperience] = await db.query(
      `UPDATE experience
      SET 
        company = ?, 
        address = ?, 
        position = ?, 
        years_of_stay = ?, 
        updated_at = NOW()
      WHERE experience_id = ? AND applicant_id = ?`,
      [company, address, position, years_of_stay, experience_id, applicant_id]
    );

    if (updatedExperience.affectedRows === 0) {
      return res.status(400).send({ error: "Failed to update experience" });
    }

    return res.status(200).send({
      message: "Applicant experience updated successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: "Server error" });
  }
};

export default updateApplicantExperience;
