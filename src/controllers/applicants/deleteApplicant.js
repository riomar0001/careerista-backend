import { db } from "../../config/db.js";
import jwt from "jsonwebtoken";

/**
 * @description Delete an applicant by ID
 * @route DELETE /api/applicants/:id
 * @access Private
 */
 const deleteApplicant = async (req, res) => {
  try {
    const applicant_token = req.cookies.applicant_access_token;

    const applicant_token_info = jwt.verify(
      applicant_token,
      process.env.JWT_SECRET_APPLICANT
    );

    const applicant_id = applicant_token_info.applicant.applicant_id;

    if (!applicant_id) {
      return res.status(400).send({ error: "Applicant ID is required" });
    }

    const [applicantExist] = await db.query(
      "SELECT COUNT(*) AS count FROM applicant WHERE applicant_id = ?",
      [applicant_id]
    );

    if (applicantExist[0].count === 0) {
      return res.status(404).send({ error: "Applicant not found" });
    }

    await db.query("DELETE FROM applicant WHERE applicant_id = ?", [applicant_id]);

    res.cookie("applicant_access_token", "", {
      httpOnly: true,
      expires: new Date(0),
    });

    return res.status(200).send({ message: "Applicant successfully deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: "Server Error" });
  }
};

export default deleteApplicant;