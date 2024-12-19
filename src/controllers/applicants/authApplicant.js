import bcrypt from "bcryptjs";
import generateApplicantToken from "../../utils/generateApplicantToken.js";
import { db } from "../../config/db.js";


/**
 * @description Authenticate User
 * @route POST /api/users/auth
 * @access Public
 */
const authUser = async (req, res) => {
  try {
    const { email_username, password } = req.body;

    if (!email_username || !password) {
      return res.status(400).send({ error: "Please fill all fields" });
    }

    const [applicantResult] = await db.query(
      "SELECT applicant_id, first_name, last_name, email, username, password, done_onboarding FROM applicant WHERE email = ? OR username = ?",
      [email_username, email_username]
    );

    if (applicantResult.length === 0) {
      return res.status(400).send({ error: "Invalid Email or Username" });
    }

    const applicant = applicantResult[0];

    const passwordMatched = await bcrypt.compare(password, applicant.password);

    if (!passwordMatched) {
      return res.status(400).send({ error: "Invalid Password" });
    }

    delete applicant.password;
    

    generateApplicantToken(res, applicant);

    return res.status(200).send({
      message: "Login Successfully",
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

export default authUser;
