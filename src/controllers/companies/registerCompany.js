import hashPassword from "../../utils/hashPassword.js";
import generateCompanyToken from "../../utils/generateCompanyToken.js";
import cloudinary from "../../config/cloudinaryConfig.js";
import { v4 as uuidv4 } from "uuid";
import { db } from "../../config/db.js";
import jwt from "jsonwebtoken";

/**
 * @description Registration of a new company
 * @route POST /api/companies/
 * @access Public
 */
export const registerCompany = async (req, res) => {
  try {
    const { email, company_name, password, description } = req.body;

    if (!email || !company_name || !password || !description) {
      return res.status(400).send({ error: "Please fill all required fields" });
    }

    const [companyExist] = await db.query(
      "SELECT COUNT(*) AS count FROM company WHERE email = ?",
      [email]
    );

    if (companyExist[0].count > 0) {
      return res.status(400).send({ error: "Company already exists" });
    }

    const hashedPassword = await hashPassword(password);
    const newCompanyID = uuidv4();

    await db.query(
      `INSERT INTO company 
        (company_id, email, password, company_name, description, created_at, updated_at) 
        VALUES ( ?, ?, ?, ?, ?, NOW(), NOW())`,
      [newCompanyID, email, hashedPassword, company_name, description]
    );

    const [newCompanyAccount] = await db.query(
      "SELECT company_id, email, company_name, description, done_onboarding FROM company WHERE company_id = ?",
      [newCompanyID]
    );

    const company = newCompanyAccount[0];

    generateCompanyToken(res, company);

    return res.status(201).send({
      message: "Company successfully registered",
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

/**
 * @description Register a new company with address, contact, logo, and industry details.
 * If the industry doesn't exist, create it.
 * @route POST /api/company/onbaording/:company_id
 * @access Private
 */
export const onboardingCompany = async (req, res) => {
  try {
    const company_token = req.cookies.company_access_token;

    const company_token_info = jwt.verify(
      company_token,
      process.env.JWT_SECRET_COMPANY
    );

    const company_id = company_token_info.company.company_id;

    const { address, contact_no, email, industry_name } = req.body;

    const logo = req.files.logo?.[0]?.path || null;

    if (
      !address ||
      !contact_no ||
      !email ||
      !industry_name ||
      industry_name === "undefined"
    ) {
      return res.status(400).json({
        error:
          "Please provide all required fields (company_id, address, contact_no, email, industry_name).",
      });
    }

    if (!logo) {
      return res.status(400).json({
        error: "Logo is required.",
      });
    }

    const companyAddressId = uuidv4();
    const companyContactId = uuidv4();
    const companyLogoId = uuidv4();
    const companyIndustryId = uuidv4();

    const logoUploadResult = await cloudinary.uploader.upload(logo, {
      folder: "company_logos",
      public_id: `company_logo_${company_id}`,
      overwrite: true,
    });

    let industryId;

    const [industry] = await db.query(
      `SELECT industry_id FROM industry WHERE industry_name = ?`,
      [industry_name]
    );

    if (industry.length > 0) {
      industryId = industry[0].industry_id;
    } else {
      industryId = uuidv4();
      await db.query(
        `INSERT INTO industry (industry_id, industry_name, created_at, updated_at)
         VALUES (?, ?, NOW(), NOW())`,
        [industryId, industry_name]
      );
    }

    await db.query(
      `INSERT INTO company_address 
        (company_address_id, company_id, address, created_at, updated_at) 
        VALUES (?, ?, ?, NOW(), NOW())`,
      [companyAddressId, company_id, address]
    );

    await db.query(
      `INSERT INTO company_contact 
        (company_contact_id, company_id, contact_no, email, created_at, updated_at) 
        VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [companyContactId, company_id, contact_no, email]
    );

    await db.query(
      `INSERT INTO company_logo 
        (company_logo_id, company_id, logo, created_at, updated_at) 
        VALUES (?, ?, ?, NOW(), NOW())`,
      [companyLogoId, company_id, logoUploadResult.secure_url]
    );

    await db.query(
      `INSERT INTO company_industry 
        (company_industry_id, company_id, industry_id, created_at, updated_at) 
        VALUES (?, ?, ?, NOW(), NOW())`,
      [companyIndustryId, company_id, industryId]
    );

    await db.query(
      `UPDATE company 
        SET done_onboarding = 1, updated_at = NOW() 
        WHERE company_id = ?`,
      [company_id]
    );

    return res.status(201).json({
      message: "Company registered successfully with associated details.",
    });
  } catch (error) {
    console.error(error);

    if (error.code === "ER_NO_SUCH_TABLE") {
      return res.status(500).json({
        error: `Database error: Table '${error.sqlMessage}' does not exist.`,
      });
    }
    return res.status(500).json({
      error: "An error occurred while registering the company.",
    });
  }
};
