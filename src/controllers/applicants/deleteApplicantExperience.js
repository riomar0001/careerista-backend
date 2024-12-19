import { db } from "../../config/db.js";
import jwt from "jsonwebtoken";

/**
 * @description delete an applicant's experience
 * @route DELETE /api/applicants/experience/:id
 * @access Private
 */
const deleteApplicantExperience = async (req, res) => {
  try {
    const applicant_token = req.cookies.applicant_access_token;

    const applicant_token_info = jwt.verify(
      applicant_token,
      process.env.JWT_SECRET_APPLICANT
    );

    const applicant_id = applicant_token_info.applicant.applicant_id;
    const { id } = req.params;

    // Check if the experience exists and belongs to the applicant
    const [experience] = await db.query(
      "SELECT * FROM experience WHERE experience_id = ? AND applicant_id = ?",
      [id, applicant_id]
    );

    if (experience.length === 0) {
      return res.status(404).send({ error: "Experience not found" });
    }

    // Delete the experience from the database
    await db.query(
      "DELETE FROM experience WHERE experience_id = ? AND applicant_id = ?",
      [id, applicant_id]
    );

    return res.status(200).send({
      message: "Applicant experience deleted successfully",
    });
  } catch (error) {
    console.error(error);
    if (error.code === "ER_NO_SUCH_TABLE") {
      return res
        .status(500)
        .send({ error: `Database error: Table '${error.sqlMessage}'` });
    }
    return res.status(500).send({ error: "Server Error" });
  }
};

export default deleteApplicantExperience;