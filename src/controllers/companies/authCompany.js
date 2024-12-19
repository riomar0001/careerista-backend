import bcrypt from "bcryptjs";
import generateCompanyToken from "../../utils/generateCompanyToken.js";
import { db } from "../../config/db.js";

/**
 * @description Authenticate Company
 * @route POST /api/companies/auth
 * @access Public
 */
const authCompany = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send({ error: "Please fill all fields" });
    }

    const [companyResult] = await db.query(
      "SELECT company_id, email, company_name, description, done_onboarding, password FROM company WHERE email = ? ",
      [email]
    );

    if (companyResult.length === 0) {
      return res.status(400).send({ error: "Invalid Email or Username" });
    }

    const company = companyResult[0];

    const passwordMatched = await bcrypt.compare(password, company.password);

    if (!passwordMatched) {
      return res.status(400).send({ error: "Invalid Password" });
    }

    delete company.password;

    generateCompanyToken(res, company);

    return res.status(200).send({
      account_type: "company",
      id: company.company_id,
      email: company.email,
      company_name: company.company_name,
      done_onboarding: company.done_onboarding === 1 ? true : false,
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

export default authCompany;
