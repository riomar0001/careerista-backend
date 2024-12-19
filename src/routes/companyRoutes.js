import express from "express";
import upload from "../middlewares/uploadImageMiddleware.js";
import { protectCompany } from "../middlewares/authCompanyMiddleware.js";
import {
  registerCompany,
  onboardingCompany,
} from "../controllers/companies/registerCompany.js";
import checkApplicantAuth from "../controllers/companies/checkCompanyAuth.js";
import updateCompany from "../controllers/companies/updateCompany.js";
import authCompany from "../controllers/companies/authCompany.js";
import logoutCompany from "../controllers/companies/logoutCompany.js";
import getIndustries from "../controllers/companies/getIndustries.js";
import getCompanyInfo from "../controllers/companies/getCompanyInfo.js";

import updateCompanyAddress from "../controllers/companies/updateCompanyAddress.js";
import updateCompanyContact from "../controllers/companies/updateCompanyContact.js";
import updateCompanyIndustry from "../controllers/companies/updateCompanyIndustry.js";
import updateCompanyLogo from "../controllers/companies/updateCompanyLogo.js";

import updateCompanyAccountPassword from "../controllers/companies/UpdateCompanyAccountPassword.js";
import deleteCompany from "../controllers/companies/deleteCompany.js";
 import UpdateCompanyAccountEmail from "../controllers/companies/UpdateCompanyAccountEmail.js";
import UpdateCompanyAccount from "../controllers/companies/UpdateCompanyAccount.js";

import getCompanyInformation from "../controllers/companies/getCompanyInformation.js";

const router = express.Router();

router.post("/", registerCompany);
router.post("/auth", authCompany);
router.post("/logout", protectCompany, logoutCompany);
router.post(
  "/onboarding",
  protectCompany,
  upload.fields([{ name: "logo", maxCount: 1 }]),
  onboardingCompany
);
router.get("/auth", checkApplicantAuth);
router.get("/industries", getIndustries);
router.get("/", protectCompany, getCompanyInfo);
router.delete("/", protectCompany, deleteCompany);

router.put("/update", protectCompany, updateCompany);
router.put("/email", protectCompany, UpdateCompanyAccountEmail);
router.put("/address", protectCompany, updateCompanyAddress);
router.put("/contact", protectCompany, updateCompanyContact);
router.put("/industry", protectCompany, updateCompanyIndustry);
router.put("/password", protectCompany, updateCompanyAccountPassword);
router.put("/logo", protectCompany, updateCompanyLogo);

export default router;
