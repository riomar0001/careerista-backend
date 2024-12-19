import { db } from "../../config/db.js";

/**
 * @desc    Get all applicants for a job posting with additional details
 * @route   GET /jobs/:job_posting_id/applicants
 * @access  Private
 */
const getApplicantsByJobId = async (req, res) => {
  try {
    const { job_posting_id } = req.params;

    // Check if the job posting exists
    const [jobExists] = await db.query(
      "SELECT * FROM job_posting WHERE job_posting_id = ?",
      [job_posting_id]
    );

    if (!jobExists.length) {
      return res.status(404).send({ error: "Job posting not found" });
    }

    // Query to get all applicants with additional details
    const [applicants] = await db.query(
      `
      SELECT 
        a.applicant_id,
        a.username,
        a.first_name,
        a.last_name,
        a.email AS applicant_email,
        a.done_onboarding,
        a.created_at AS applicant_created_at,
        ac.contact_no,
        ac.email AS contact_email,
        cv.cv_file,
        e.company,
        e.address,
        e.position,
        e.years_of_stay
      FROM job_posting_candidates jpc
      JOIN applicant a ON jpc.applicant_id = a.applicant_id
      LEFT JOIN applicant_contact ac ON a.applicant_id = ac.applicant_id
      LEFT JOIN applicant_cv cv ON a.applicant_id = cv.applicant_id
      LEFT JOIN experience e ON a.applicant_id = e.applicant_id
      WHERE jpc.job_posting_id = ?
      ORDER BY a.created_at DESC
      `,
      [job_posting_id]
    );

    if (!applicants.length) {
      return res
        .status(404)
        .send({ message: "No applicants for this job posting" });
    }

    // Group experience rows under each applicant_id
    const applicantMap = {};

    applicants.forEach((applicant) => {
      const {
        applicant_id,
        username,
        first_name,
        last_name,
        date_of_birth,
        applicant_email,
        done_onboarding,
        applicant_created_at,
        contact_no,
        contact_email,
        cv_file,
        company,
        address,
        position,
        years_of_stay,
      } = applicant;

      if (!applicantMap[applicant_id]) {
        applicantMap[applicant_id] = {
          applicant_id,
          username,
          first_name,
          last_name,
          date_of_birth,
          email: applicant_email,
          done_onboarding,
          created_at: applicant_created_at,
          contact: {
            contact_no,
            email: contact_email,
          },
          cv: cv_file,
          experiences: [],
        };
      }

      if (company && address && position) {
        applicantMap[applicant_id].experiences.push({
          company,
          address,
          position,
          years_of_stay,
        });
      }
    });

    // Convert grouped data back to an array
    const formattedApplicants = Object.values(applicantMap);

    res.status(200).send({ applicants: formattedApplicants });
  } catch (error) {
    console.error("getApplicantsByJobId Error:", error);
    res.status(500).send({ error: "Failed to fetch applicants" });
  }
};

export default getApplicantsByJobId;
