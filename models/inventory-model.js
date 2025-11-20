const pool = require("../database/")

/* ************************
 * Get all classifications
 * ************************ */
async function getClassifications(){
  return await pool.query('SELECT * FROM public."classification" ORDER BY "classification_name"')
}

module.exports = {getClassifications}

