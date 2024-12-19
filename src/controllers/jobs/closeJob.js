import { db } from "../../config/db.js";
/**
 * @desc    Close a job posting
 * @route   PATCH /jobs/:id/close
 * @access  Private
 */
const closeJob = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(
      "UPDATE job_posting SET is_closed = true, updated_at = NOW() WHERE job_posting_id = ?",
      [id]
    );

    res.status(200).send({ message: "Job closed successfully" });
  } catch (error) {
    console.log(error);

    res.status(500).send({ error: "Failed to close job" });
  }
};

export default closeJob;
