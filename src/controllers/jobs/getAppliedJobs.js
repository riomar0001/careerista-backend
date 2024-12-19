// Get Applied Jobs (GET /applicant/jobs)
import { db } from "../../config/db.js";
import jwt from "jsonwebtoken";

/**
 * @desc    Get all jobs an applicant has applied to
 * @route   GET /applicant/jobs
 * @access  Private
 */
const getAppliedJobs = async (req, res) => {
  try {
    // Get the applicant's JWT token from the cookies
    const applicant_token = req.cookies.applicant_access_token;
    
    // Verify the JWT token
    const applicant_token_info = jwt.verify(
      applicant_token,
      process.env.JWT_SECRET_APPLICANT
    );
    
    // Extract the applicant ID from the token
    const applicant_id = applicant_token_info.applicant.applicant_id;

    // Fetch the applied jobs from the database, including company details
    const [appliedJobs] = await db.query(
      `SELECT 
          jp.job_posting_id, 
          jp.company_id, 
          jp.position, 
          jp.is_closed, 
          jp.created_at, 
          jp.updated_at, 
          jp.job_description, 
          jp.job_address, 
          jp.job_category, 
          jp.salary_range, 
          jp.work_schedule, 
          c.company_name
       FROM job_posting_candidates jpc
       JOIN job_posting jp ON jpc.job_posting_id = jp.job_posting_id
       JOIN company c ON jp.company_id = c.company_id
       WHERE jpc.applicant_id = ?`,
      [applicant_id]
    );

    // If no jobs are found, return a 404 error
    if (appliedJobs.length === 0) {
      return res.status(404).send({ message: "No jobs found for this applicant" });
    }

    // If jobs are found, return them in the response
    res.status(200).send({ appliedJobs });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Failed to fetch applied jobs" });
  }
};

export default getAppliedJobs;
