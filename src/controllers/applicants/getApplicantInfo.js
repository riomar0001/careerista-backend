import { db } from "../../config/db.js";
import jwt from "jsonwebtoken";

/**
 * @description Get a specific applicant with related contact, CV, and experience data
 * @route GET /api/applicants/:id
 * @access Private
 */
const getApplicantInfo = async (req, res) => {
  try {
    const applicant_token = req.cookies.applicant_access_token;

    const applicant_token_info = jwt.verify(
      applicant_token,
      process.env.JWT_SECRET_APPLICANT
    );

    const applicant_id = applicant_token_info.applicant.applicant_id;


    // Query for applicant data (excluding experience)
    const queryApplicant = `
      SELECT 
        a.applicant_id, 
        a.username, 
        a.first_name, 
        a.last_name, 
        a.email, 
        a.done_onboarding,
        a.created_at AS applicant_created_at, 
        a.updated_at AS applicant_updated_at,
        ac.applicant_contact_id, 
        ac.contact_no, 
        ac.email AS contact_email, 
        ac.created_at AS contact_created_at, 
        ac.updated_at AS contact_updated_at,
        acv.applicant_cv_id, 
        acv.cv_file, 
        acv.created_at AS cv_created_at, 
        acv.updated_at AS cv_updated_at
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
    SELECT 
      experience_id, 
      company, 
      address, 
      position, 
      years_of_stay, 
      created_at, 
      updated_at
    FROM experience 
    WHERE applicant_id = ?
  `;

    const [experienceData] = await db.query(queryExperience, [applicant_id]);

    const formattedApplicant = {
      applicant_id: applicantData[0].applicant_id,
      username: applicantData[0].username,
      first_name: applicantData[0].first_name,
      last_name: applicantData[0].last_name,
      email: applicantData[0].email,
      created_at: applicantData[0].applicant_created_at,
      updated_at: applicantData[0].applicant_updated_at,
      contact: applicantData
        .filter((curr) => curr.applicant_contact_id)
        .map((curr) => ({
          applicant_contact_id: curr.applicant_contact_id,
          contact_no: curr.contact_no,
          contact_email: curr.contact_email,
          created_at: curr.contact_created_at,
          updated_at: curr.contact_updated_at,
        })),
      cv: applicantData
        .filter((curr) => curr.applicant_cv_id)
        .map((curr) => ({
          applicant_cv_id: curr.applicant_cv_id,
          cv_file: curr.cv_file,
          created_at: curr.cv_created_at,
          updated_at: curr.cv_updated_at,
        })),
      experience: experienceData,
    };

    return res.status(200).send(formattedApplicant);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: "Server error" });
  }
};

export default getApplicantInfo;
