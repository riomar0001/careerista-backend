// Check if job is applied (GET /jobs/:job_posting_id/is-applied)
import { db } from "../../config/db.js";
import jwt from "jsonwebtoken";

/**
 * @desc    Check if the applicant has already applied for a job posting
 * @route   GET /jobs/:job_posting_id/is-applied
 * @access  Private
 */
const checkIfApplied = async (req, res) => {
  try {
    const applicant_token = req.cookies.applicant_access_token;
    
    // Verify the applicant token
    const applicant_token_info = jwt.verify(
      applicant_token,
      process.env.JWT_SECRET_APPLICANT
    );
    const applicant_id = applicant_token_info.applicant.applicant_id;
  
    const { job_posting_id } = req.params;

    // Check if the applicant has already applied for the job
    const [existingApplication] = await db.query(
      "SELECT * FROM job_posting_candidates WHERE job_posting_id = ? AND applicant_id = ?",
      [job_posting_id, applicant_id]
    );

    if (existingApplication.length > 0) {
      return res.status(200).send({ applied: true});
    }

    res.status(200).send({ applied: false });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Failed to check job application status" });
  }
};

export default checkIfApplied;
