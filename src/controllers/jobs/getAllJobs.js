import { db } from "../../config/db.js";

/**
 * @desc    Get all jobs with company name where is_closed is false
 * @route   GET /jobs
 * @access  Public
 */
const getAllJobs = async (req, res) => {
  try {
    const [jobs] = await db.query(`
      SELECT job_posting.*, company.company_name
      FROM job_posting
      JOIN company ON job_posting.company_id = company.company_id
      WHERE job_posting.is_closed = false
    `);

    res.status(200).send(jobs);
  } catch (error) {
    res.status(500).send({ error: "Failed to fetch jobs" });
  }
};

export default getAllJobs;
