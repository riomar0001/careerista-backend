import { db } from "../../config/db.js";
import jwt from "jsonwebtoken";

/**
 * @desc    Get all jobs for a specific company
 * @route   GET /jobs/company
 * @access  Private
 */
const getJobByCompany = async (req, res) => {
  try {
    // Get company_id from the token
    const company_token = req.cookies.company_access_token;
    const company_token_info = jwt.verify(
      company_token,
      process.env.JWT_SECRET_COMPANY
    );

    const company_id = company_token_info.company.company_id;

    // Query jobs by company_id
    const [jobs] = await db.query(`
      SELECT job_posting.*, company.company_name
      FROM job_posting
      JOIN company ON job_posting.company_id = company.company_id
      WHERE company.company_id = ?
    `, [company_id]);

    if (jobs.length === 0) {
      return res.status(404).send({ message: "No jobs found for this company" });
    }

    res.status(200).send(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Failed to fetch jobs" });
  }
};

export default getJobByCompany;
