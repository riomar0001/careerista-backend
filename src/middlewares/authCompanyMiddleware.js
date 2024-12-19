import jwt from "jsonwebtoken";
import { db } from "../config/db.js";

export const protectCompany = async (req, res, next) => {
  let company_token = req.cookies.company_access_token;

  if (!company_token) {
    return res.status(403).send({ forbidden: "Access Denied" });
  }

  try {
    const company_token_info = jwt.verify(
      company_token,
      process.env.JWT_SECRET_COMPANY
    );

    const company_id = company_token_info.company.company_id;

    const [companyExist] = await db.query(
      "SELECT COUNT(*) AS count FROM company WHERE company_id = ? ",
      [company_id]
    );

    if (companyExist[0].count > 1) {
      return res.status(403).send({ forbidden: "Unauthorized Invalid Account" });
    }

    next();
  } catch (error) {
    console.error(error);

    if (error.name === "TokenExpiredError") {
      return res.status(403).send({ forbidden: "Unauthorized, token has expired" });
    }

    return res.status(500).send({ error: "Server Error" });
  }
};
