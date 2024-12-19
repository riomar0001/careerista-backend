import { db } from "../../config/db.js";
import jwt from "jsonwebtoken";

// Get company details
const getCompanyInformation = async (req, res) => {
  try {
    const company_token = req.cookies.company_access_token;
    const company_token_info = jwt.verify(
      company_token,
      process.env.JWT_SECRET_COMPANY
    );
    const company_id = company_token_info.company.company_id;

    const [companyDetails] = await db.query(
      "SELECT * FROM company WHERE company_id = ?",
      [company_id]
    );

    const [addressDetails] = await db.query(
      "SELECT * FROM company_address WHERE company_id = ?",
      [company_id]
    );

    const [contactDetails] = await db.query(
      "SELECT * FROM company_contact WHERE company_id = ?",
      [company_id]
    );

    res.status(200).json({
      company: companyDetails,
      address: addressDetails,
      contact: contactDetails,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving company details" });
  }
};

export default getCompanyInformation;
