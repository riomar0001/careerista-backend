import { db } from "../../config/db.js";

/**
 * @desc    Get recent 6 jobs with company name
 * @route   GET /jobs/recent
 * @access  Public
 */
const getRecentJobs = async (req, res) => {
  try {
    const [jobs] = await db.query(
      `SELECT job_posting.*, company.company_name
       FROM job_posting
       JOIN company ON job_posting.company_id = company.company_id
       WHERE is_closed = false
       ORDER BY created_at DESC
       LIMIT 6`
    );

    res.status(200).send(jobs);
  } catch (error) {
    res.status(500).send({ error: "Failed to fetch recent jobs" });
  }
};

export default getRecentJobs;
