import { db } from "../../config/db.js";
import jwt from "jsonwebtoken";

/**
 * @desc    Get jobs based on company ID
 * @route   GET /jobs/company
 * @access  Private
 */
const getJobsByCompanyId = async (req, res) => {
  try {
    const company_token = req.cookies.company_access_token;
    const company_token_info = jwt.verify(
      company_token,
      process.env.JWT_SECRET_COMPANY
    );
    const company_id = company_token_info.company.company_id;

    const [jobs] = await db.query(
      "SELECT * FROM job_posting WHERE company_id = ?",
      [company_id]
    );

    res.status(200).send(jobs);
  } catch (error) {
    res.status(500).send({ error: "Failed to fetch jobs for the company" });
  }
};

export default getJobsByCompanyId;