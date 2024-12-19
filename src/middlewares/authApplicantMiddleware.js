import jwt from "jsonwebtoken";
import { db } from "../config/db.js";

export const protectApplicant = async (req, res, next) => {
  let applicant_token = req.cookies.applicant_access_token;  
  

  if (!applicant_token) {
    return res.status(403).send({ forbidden: "Access Denied" });
  }

  try {
    const applicant_token_info = jwt.verify(
      applicant_token,
      process.env.JWT_SECRET_APPLICANT
    );

    const applicant_id = applicant_token_info.applicant.applicant_id;

    const [applicantExist] = await db.query(
      "SELECT COUNT(*) AS count FROM applicant WHERE applicant_id = ? ",
      [applicant_id]
    );

    if (applicantExist[0].count > 1) {
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
