import { db } from "../../config/db.js";

/**
 * @description Get a specific applicant with related contact, CV, and experience data
 * @route GET /api/applicants/:id
 * @access Private
 */
const getApplicantBasicInfo = async (req, res) => {
  try {
    const { applicant_id } = req.params;

    // Query for applicant data (excluding experience)
    const queryApplicant = `
      SELECT 
        a.applicant_id, 
        a.username, 
        a.first_name, 
        a.last_name, 
        a.date_of_birth, 
        ac.applicant_contact_id, 
        ac.contact_no, 
        ac.email AS contact_email, 
        acv.cv_file
      FROM applicant a
      LEFT JOIN applicant_contact ac ON a.applicant_id = ac.applicant_id
      LEFT JOIN applicant_cv acv ON a.applicant_id = acv.applicant_id
      WHERE a.applicant_id = ?
    `;

    const [applicantData] = await db.query(queryApplicant, [applicant_id]);

    if (applicantData.length === 0) {
      return res.status(404).send({ message: "Applicant not found" });
    }

    if (applicantData[0].done_onboarding === 0) {
      return res
        .status(404)
        .send({ message: "Applicant has not completed onboarding" });
    }

    const queryExperience = `
    SELECT company, address, position, years_of_stay FROM experience WHERE applicant_id = ?
  `;

    const [experienceData] = await db.query(queryExperience, [applicant_id]);

    const formattedApplicant = {
      first_name: applicantData[0].first_name,
      last_name: applicantData[0].last_name,
      date_of_birth: applicantData[0].date_of_birth,
      contact: applicantData
        .filter((curr) => curr.applicant_contact_id)
        .map((curr) => ({
          contact_no: curr.contact_no,
          contact_email: curr.contact_email,
        })),
      cv_file: applicantData[0].cv_file,
      experience: experienceData,
    };

    return res.status(200).send(formattedApplicant);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: "Server error" });
  }
};

export default getApplicantBasicInfo;
