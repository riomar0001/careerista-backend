import { db } from "../../config/db.js";

/**
 * @desc    Get job information by ID with company name
 * @route   GET /jobs/:id
 * @access  Public
 */
const getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    const [job] = await db.query(
      `SELECT job_posting.*, company.company_name
       FROM job_posting
       JOIN company ON job_posting.company_id = company.company_id
       WHERE job_posting.job_posting_id = ?`,
      [id]
    );

    if (job.length === 0) {
      return res.status(404).send({ error: "Job not found" });
    }

    res.status(200).send(job[0]);
  } catch (error) {
    res.status(500).send({ error: "Failed to fetch job information" });
  }
};

export default getJobById;
