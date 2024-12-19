// Insert Job Posting (POST /jobs)
import { db } from "../../config/db.js";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

/**
 * @desc    Insert job posting
 * @route   POST /jobs
 * @access  Private
 */
const postJob = async (req, res) => {
  try {
    const company_token = req.cookies.company_access_token;
    const company_token_info = jwt.verify(
      company_token,
      process.env.JWT_SECRET_COMPANY
    );
    const company_id = company_token_info.company.company_id;

    const [companyExist] = await db.query(
      "SELECT COUNT(*) AS count FROM company WHERE company_id = ?",
      [company_id]
    );

    if (companyExist[0].count === 0) {
      return res.status(404).send({ error: "Company not found" });
    }

    const {
      position,
      job_description,
      job_address,
      job_category,
      salary_range,
      work_schedule,
    } = req.body;

    if (
      !position ||
      !job_description ||
      !job_address ||
      !job_category ||
      !salary_range ||
      !work_schedule
    ) {
      return res.status(400).send({ error: "Please fill in all fields" });
    }

    const job_posting_id = uuidv4();

    await db.query(
      `INSERT INTO job_posting (job_posting_id, company_id, position, job_description, job_address, job_category, salary_range, work_schedule, is_closed, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, false, NOW(), NOW())`,
      [
        job_posting_id,
        company_id,
        position,
        job_description,
        job_address,
        job_category,
        salary_range,
        work_schedule,
      ]
    );

    res
      .status(201)
      .send({ message: "Job posted successfully", job_posting_id });
  } catch (error) {
    res.status(500).send({ error: "Failed to post job" });
  }
};

export default postJob;
