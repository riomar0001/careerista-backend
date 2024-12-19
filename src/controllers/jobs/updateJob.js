// Update Job Posting (PUT /jobs/:job_posting_id)
import { db } from "../../config/db.js";
import jwt from "jsonwebtoken";

/**
 * @desc    Update job posting
 * @route   PUT /jobs/:job_posting_id
 * @access  Private
 */
const updateJob = async (req, res) => {
  try {
    const company_token = req.cookies.company_access_token;
    const company_token_info = jwt.verify(
      company_token,
      process.env.JWT_SECRET_COMPANY
    );
    const company_id = company_token_info.company.company_id;

    console.log(company_id);
    

    const { job_posting_id } = req.params;

    console.log(job_posting_id);
    

    // Check if the job posting exists and belongs to the company
    const [jobExists] = await db.query(
      "SELECT company_id FROM job_posting WHERE job_posting_id = ?",
      [job_posting_id]
    );

    if (!jobExists.length) {
      return res.status(404).send({ error: "Job posting not found" });
    }

    if (jobExists[0].company_id !== company_id) {
      return res.status(403).send({ error: "You do not have permission to update this job posting" });
    }

    const {
      position,
      job_description,
      job_address,
      job_category,
      salary_range,
      work_schedule,
    } = req.body;

    // Update job posting details
    await db.query(
      `UPDATE job_posting
       SET position = ?, job_description = ?, job_address = ?, job_category = ?, salary_range = ?, work_schedule = ?, updated_at = NOW()
       WHERE job_posting_id = ?`,
      [
        position,
        job_description,
        job_address,
        job_category,
        salary_range,
        work_schedule,
        job_posting_id,
      ]
    );

    res.status(200).send({ message: "Job posting updated successfully" });
  } catch (error) {
    res.status(500).send({ error: "Failed to update job posting" });
  }
};

export default updateJob;
