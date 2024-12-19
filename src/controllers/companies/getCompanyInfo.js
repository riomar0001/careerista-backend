import { db } from "../../config/db.js";
import jwt from "jsonwebtoken";

/**
 * @desc    Get company details
 * @route   GET /api/company/:companyId
 * @access  Private
 */
const getCompanyInfo = async (req, res) => {
  const company_token = req.cookies.company_access_token;

  const company_token_info = jwt.verify(
    company_token,
    process.env.JWT_SECRET_COMPANY
  );

  const company_id = company_token_info.company.company_id;

  try {
    const [[company]] = await db.query(
      `SELECT 
          c.company_id,
          c.email,
          c.company_name,
          c.description,
          c.done_onboarding,
          c.created_at,
          c.updated_at,
          ca.address,
          cc.contact_no,
          cc.email AS contact_email,
          cl.logo
        FROM company c
        LEFT JOIN company_address ca ON c.company_id = ca.company_id
        LEFT JOIN company_contact cc ON c.company_id = cc.company_id
        LEFT JOIN company_logo cl ON c.company_id = cl.company_id
        WHERE c.company_id = ?`,
      [company_id]
    );

    if (!company) {
      return res.status(404).json({ error: "Company not found." });
    }

    const [industries] = await db.query(
      `SELECT i.industry_id, i.industry_name
         FROM company_industry ci
         INNER JOIN industry i ON ci.industry_id = i.industry_id
         WHERE ci.company_id = ?`,
      [company_id]
    );

    return res.status(200).json({
      company: {
        company_id: company.company_id,
        email: company.email,
        company_name: company.company_name,
        description: company.description,
        done_onboarding: company.done_onboarding,
        created_at: company.created_at,
        updated_at: company.updated_at,
        address: company.address,
        contact: {
          contact_no: company.contact_no,
          email: company.contact_email,
        },
        logo: company.logo,
        industries: industries.map((industry) => ({
          industry_id: industry.industry_id,
          industry_name: industry.industry_name,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching company details:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while fetching company details." });
  }
};

export default getCompanyInfo;
