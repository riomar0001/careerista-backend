// Apply for Job (POST /jobs/:job_posting_id/apply)
import { db } from "../../config/db.js";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";

/**
 * @desc    Apply for job posting
 * @route   POST /job/:job_posting_id/apply
 * @access  Private
 */
const applyJob = async (req, res) => {
  try {
    const applicant_token = req.cookies.applicant_access_token;
    const applicant_token_info = jwt.verify(
      applicant_token,
      process.env.JWT_SECRET_APPLICANT
    );
    const applicant_id = applicant_token_info.applicant.applicant_id;
  
    const { job_posting_id } = req.params;


    // Check if the job posting exists and is open
    const [jobExists] = await db.query(
      "SELECT is_closed FROM job_posting WHERE job_posting_id = ?",
      [job_posting_id]
    );

    if (!jobExists.length) {
      return res.status(404).send({ error: "Job posting not found" });
    }

    if (jobExists[0].is_closed) {
      return res.status(400).send({ error: "Job posting is closed" });
    }

    // Check if the applicant has already applied for this job
    const [existingApplication] = await db.query(
      "SELECT * FROM job_posting_candidates WHERE job_posting_id = ? AND applicant_id = ?",
      [job_posting_id, applicant_id]
    );

    if (existingApplication.length > 0) {
      return res.status(400).send({ error: "You have already applied for this job" });
    }

    // Add the application to the job_posting_candidates table
    const candidates_id = uuidv4(); // Generate a unique candidate ID

    await db.query(
      `INSERT INTO job_posting_candidates (candidates_id, job_posting_id, applicant_id, created_at, updated_at)
       VALUES (?, ?, ?, NOW(), NOW())`,
      [candidates_id, job_posting_id, applicant_id]
    );

    res.status(201).send({ message: "Successfully applied for the job" });
  } catch (error) {
    console.log(error);
    
    res.status(500).send({ error: "Failed to apply for the job" });
  }
};

export default applyJob;
