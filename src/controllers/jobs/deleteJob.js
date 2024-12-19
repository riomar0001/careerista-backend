import { db } from "../../config/db.js";
/**
 * @desc    Delete a job posting
 * @route   DELETE /jobs/:id
 * @access  Private
 */
const deleteJob = async (req, res) => {
    try {
      const { id } = req.params;
  
      await db.query("DELETE FROM job_posting WHERE job_posting_id = ?", [id]);
  
      res.status(200).send({ message: "Job deleted successfully" });
    } catch (error) {
      res.status(500).send({ error: "Failed to delete job" });
    }
  };
  
  export default deleteJob;