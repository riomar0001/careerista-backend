import { db } from "../../config/db.js";
import jwt from "jsonwebtoken";

const deleteCompany = async (req, res) => {
  const company_token = req.cookies.company_access_token;

  const company_token_info = jwt.verify(
    company_token,
    process.env.JWT_SECRET_COMPANY
  );

  const company_id = company_token_info.company.company_id;

  try {
    const [result] = await db.query(
      "DELETE FROM company WHERE company_id = ?",
      [company_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Company not found" });
    }

    res.status(200).json({ message: "Company deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete company" });
  }
};

export default deleteCompany;