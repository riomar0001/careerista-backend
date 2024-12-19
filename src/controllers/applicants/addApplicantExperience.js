import { v4 as uuidv4 } from "uuid";
import { db } from "../../config/db.js";
import jwt from "jsonwebtoken";

/**
 * @description registration of a new user
 * @route POST /api/applcants/onboarding
 * @access Private
 */
const addApplicantExperience = async (req, res) => {
  try {
    const applicant_token = req.cookies.applicant_access_token;

    const applicant_token_info = jwt.verify(
      applicant_token,
      process.env.JWT_SECRET_APPLICANT
    );

    const applicant_id = applicant_token_info.applicant.applicant_id;

    const { company, address, position, years_of_stay } = req.body;

    if (!company || !address || !position || !years_of_stay) {
      return res
        .status(400)
        .send({ error: "Please provide all required fields" });
    }

    const experienceId = uuidv4();

    // Insert experience data into the database
    await db.query(
      `INSERT INTO experience 
          (experience_id, applicant_id, company, address, position, years_of_stay, created_at, updated_at) 
          VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [experienceId, applicant_id, company, address, position, years_of_stay]
    );

    return res.status(201).send({
      message: "Applicant experience added successfully",
    });
  } catch (error) {
    console.error(error);
    if (error.code === "ER_NO_SUCH_TABLE") {
      return res
        .status(500)
        .send({ error: `Database error: Table '${error.sqlMessage}'` });
    }
    return res.status(500).send({ error: "Server Error" });
  }
};

export default addApplicantExperience;
