import express from "express";
import { protectCompany } from "../middlewares/authCompanyMiddleware.js";
import { protectApplicant } from "../middlewares/authApplicantMiddleware.js";
import postJob from "../controllers/jobs/postJob.js";
import getAllJobs from "../controllers/jobs/getAllJobs.js";
import getJobById from "../controllers/jobs/getJobById.js";
import deleteJob from "../controllers/jobs/deleteJob.js";
import getRecentJobs from "../controllers/jobs/getRecentJobs.js";
import closeJob from "../controllers/jobs/closeJob.js";
import updateJob from "../controllers/jobs/updateJob.js";
import applyJob from "../controllers/jobs/applyJob.js";
import getAppliedJobs from "../controllers/jobs/getAppliedJobs.js";
import cancelJobApplication from "../controllers/jobs/cancelJobApplication.js";
import checkIfApplied from "../controllers/jobs/checkIfApplied.js";
import getJobByCompany from "../controllers/jobs/getJobByCompany.js";
import getApplicantsByJobId from "../controllers/jobs/getApplicantsByJobId.js";

const router = express.Router();

router.post("/", protectCompany, postJob);
router.post("/apply/:job_posting_id", protectApplicant, applyJob);

router.get("/", getAllJobs);
router.get("/:id", getJobById);
router.get("/all/recent", getRecentJobs);
router.get("/applicant/jobs", protectApplicant, getAppliedJobs);
router.get("/applied/:job_posting_id", protectApplicant, checkIfApplied);
router.get("/applicants/:job_posting_id", protectCompany, getApplicantsByJobId);
router.get("/company/jobs", protectCompany, getJobByCompany);


router.delete("/:id", protectCompany, deleteJob);
router.delete(
  "/cancel/:job_posting_id",
  protectApplicant,
  cancelJobApplication
);

router.patch("/close/:id", closeJob);
router.put("/:job_posting_id", updateJob);

export default router;
