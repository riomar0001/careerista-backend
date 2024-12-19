import express from "express";

import {
  registerApplicant,
  onboardingApplicant,
} from "../controllers/applicants/registerApplicant.js";
import authApplicant from "../controllers/applicants/authApplicant.js";
import logoutApplicant from "../controllers/applicants/logoutApplicant.js";
import getApplicantInfo from "../controllers/applicants/getApplicantInfo.js";
import getApplicantBasicInfo from "../controllers/applicants/getApplicantBasicInfo.js";
import addApplicantExperience from "../controllers/applicants/addApplicantExperience.js";
import updateApplicant from "../controllers/applicants/updateApplicant.js";
import updateApplicantContact from "../controllers/applicants/updateApplicantContact.js";
import updateApplicantCV from "../controllers/applicants/updateApplicantCV.js";
import updateApplicantExperience from "../controllers/applicants/updateApplicantExperience.js";
import deleteApplicant from "../controllers/applicants/deleteApplicant.js";
import checkApplicantAuth from "../controllers/applicants/checkApplicantAuth.js";
import deleteApplicantExperience from "../controllers/applicants/deleteApplicantExperience.js";
import UpdateApplicantPassword from "../controllers/applicants/UpdateApplicantPassword.js";

import upload from "../middlewares/uploadDocumentMiddleware.js";

import { protectApplicant } from "../middlewares/authApplicantMiddleware.js";

const router = express.Router();

router.post("/", registerApplicant);
router.post(
  "/onboarding",
  protectApplicant,
  upload.fields([{ name: "cv_file", maxCount: 1 }]),
  onboardingApplicant
);
router.post("/auth", authApplicant);
router.post("/experience", protectApplicant, addApplicantExperience);
router.post("/logout", protectApplicant, logoutApplicant);

router.get("/", protectApplicant, getApplicantInfo);
router.get("/info/:applicant_id", protectApplicant, getApplicantBasicInfo);
router.get("/auth", checkApplicantAuth);

router.put("/", protectApplicant, updateApplicant);
router.put("/contact", protectApplicant, updateApplicantContact);
router.put(
  "/cv",
  protectApplicant,
  upload.fields([{ name: "cv_file", maxCount: 1 }]),
  updateApplicantCV
);
router.put("/experience/:experience_id", protectApplicant, updateApplicantExperience);
router.put("/password", protectApplicant, UpdateApplicantPassword);

router.delete("/", protectApplicant, deleteApplicant);
router.delete("/experience/:id", protectApplicant, deleteApplicantExperience);

export default router;
