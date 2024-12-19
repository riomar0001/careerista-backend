// Cancel Job Application (DELETE /jobs/:job_posting_id/cancel)
import { db } from "../../config/db.js";
import jwt from "jsonwebtoken";

/**
 * @desc    Cancel job application
 * @route   DELETE /jobs/:job_posting_id/cancel
 * @access  Private
 */
const cancelJobApplication = async (req, res) => {
  try {
    const applicant_token = req.cookies.applicant_access_token;
    const applicant_token_info = jwt.verify(
      applicant_token,
      process.env.JWT_SECRET_APPLICANT
    );
    const applicant_id = applicant_token_info.applicant.applicant_id;

    console.log(applicant_id);
    

    const { job_posting_id } = req.params;

    // Check if the job posting exists
    const [jobExists] = await db.query(
      "SELECT * FROM job_posting WHERE job_posting_id = ?",
      [job_posting_id]
    );

    if (!jobExists.length) {
      return res.status(404).send({ error: "Job posting not found" });
    }

    // Check if the applicant has applied for this job
    const [existingApplication] = await db.query(
      "SELECT * FROM job_posting_candidates WHERE job_posting_id = ? AND applicant_id = ?",
      [job_posting_id, applicant_id]
    );

    if (!existingApplication.length) {
      return res.status(400).send({ error: "You have not applied for this job" });
    }

    // Delete the application from job_posting_candidates table
    await db.query(
      "DELETE FROM job_posting_candidates WHERE job_posting_id = ? AND applicant_id = ?",
      [job_posting_id, applicant_id]
    );

    res.status(200).send({ message: "Job application canceled successfully" });
  } catch (error) {
    res.status(500).send({ error: "Failed to cancel the job application" });
  }
};

export default cancelJobApplication;
