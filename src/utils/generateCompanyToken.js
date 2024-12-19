import jwt from "jsonwebtoken";

const generateCompanyToken = (res, company) => {
  const token = jwt.sign({ company  }, process.env.JWT_SECRET_COMPANY, {
    expiresIn: "3h",
  });

  res.cookie("company_access_token", token, {
    httpOnly: true, 
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
};

export default generateCompanyToken;