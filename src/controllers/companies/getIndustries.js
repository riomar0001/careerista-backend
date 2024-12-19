import { db } from "../../config/db.js";

/**
 * @description Get all industries
 * @route GET /api/industries
 * @access Public
 */
const getIndustries = async (req, res) => {
  try {
    const [industries] = await db.query("SELECT * FROM industry");

    return res.status(200).send({
      industries,
    });
  } catch (error) {
    console.error(error);
    if (error.code === "ER_NO_SUCH_TABLE") {
      return res
        .status(500)
        .send({ error: `Database error: Table '${error.sqlMessage}'` });
    }
    return res.status(500).send({ error: "Server Error" });
  }
};

export default getIndustries;