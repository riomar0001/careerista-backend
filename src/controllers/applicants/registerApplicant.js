import hashPassword from "../../utils/hashPassword.js";
import generateApplicantToken from "../../utils/generateApplicantToken.js";
import cloudinary from "../../config/cloudinaryConfig.js";
import { v4 as uuidv4 } from "uuid";
import { db } from "../../config/db.js";
import jwt from "jsonwebtoken";

/**
 * @description registration of a new user
 * @route POST /api/applcants/
 * @access Public
 */
export const registerApplicant = async (req, res) => {
  try {
    const { username, email, first_name, last_name, password } =
      req.body;

    if (
      !username ||
      !email ||
      !first_name ||
      !last_name ||
      !password
    ) {
      return res.status(400).send({ error: "Please fill all fields" });
    }

    const [applicantExist] = await db.query(
      "SELECT COUNT(*) AS count FROM applicant WHERE email = ? OR username = ?",
      [email, username]
    );

    if (applicantExist[0].count > 0) {
      return res.status(400).send({ error: "User already exists" });
    }

    const hashedPassword = await hashPassword(password);
    const newApplicantID = uuidv4();

    await db.query(
      `INSERT INTO applicant 
        (applicant_id, username, password, first_name, last_name, email, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        newApplicantID,
        username,
        hashedPassword,
        first_name,
        last_name,
        email,
      ]
    );

    const [newApplicantAccount] = await db.query(
      "SELECT applicant_id, first_name, last_name, email, username, done_onboarding FROM applicant WHERE applicant_id = ?",
      [newApplicantID]
    );

    const applicant = newApplicantAccount[0];
    

    generateApplicantToken(res, applicant);

    return res.status(201).send({
      message: "User successfully created",
      account_type: "applicant",
      id: applicant.applicant_id,
      username: applicant.username,
      email: applicant.email,
      name: `${applicant.first_name} ${applicant.last_name}`,
      done_onboarding: applicant.done_onboarding === 1? true : false,
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

/**
 * @description registration of a new user
 * @route POST /api/applcants/onboarding
 * @access Private
 */
export const onboardingApplicant = async (req, res) => {
  try {
    const applicant_token = req.cookies.applicant_access_token;

    const applicant_token_info = jwt.verify(
      applicant_token,
      process.env.JWT_SECRET_APPLICANT
    );

    console.log(applicant_token_info);
    

    const applicant_id = applicant_token_info.applicant.applicant_id;
    
    const {

      // Contact
      contact_no,
      email,


      // Experience
      company,
      address,
      position,
      years_of_stay,
    } = req.body;

    const cv_file = req.files.cv_file?.[0]?.path || null;

    if (

      // Contact
      !contact_no ||
      !email 
    ) {
      return res
        .status(400)
        .send({ error: "Please provide all required fields" });
    }

    if (!cv_file) {
      return res.status(400).json({
        error: "CV is required.",
      });
    }

    const applicantContactId = uuidv4();
    const applicantCvId = uuidv4();
    const experienceId = uuidv4();

    const cvUploadResult = await cloudinary.uploader.upload(
      cv_file,
      {
        folder: "applicant_cv",
        public_id: `cv_${applicant_id}`,
        overwrite: true,
      }
    );

    if (!cvUploadResult) {
      return res.status(400).json({ error: "Failed to upload images" });
    }

    // Insert contact data into the database
    await db.query(
      `INSERT INTO applicant_contact 
        (applicant_contact_id, applicant_id, contact_no, email, created_at, updated_at) 
        VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [applicantContactId, applicant_id, contact_no, email]
    );

    // Insert CV data into the database
    await db.query(
      `INSERT INTO applicant_cv 
        (applicant_cv_id, applicant_id, cv_file, created_at, updated_at) 
        VALUES (?, ?, ?, NOW(), NOW())`,
      [applicantCvId, applicant_id, cvUploadResult.secure_url]
    );



    if (company && address && position && years_of_stay) {
      // Insert experience data into the database
      await db.query(
        `INSERT INTO applicant_experience 
          (experience_id, applicant_id, company, address, position, years_of_stay, created_at, updated_at) 
          VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [experienceId, applicant_id, company, address, position, years_of_stay]
      );
    }

    await db.query(
      `UPDATE applicant 
        SET done_onboarding = 1, updated_at = NOW() 
        WHERE applicant_id = ?`,
      [applicant_id]
    );

    return res.status(201).send({
      message: "Applicant details added successfully",
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
