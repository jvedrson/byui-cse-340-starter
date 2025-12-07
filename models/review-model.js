const pool = require("../database/")

/* ***************************
 *  Add new review
 * ************************** */
async function addReview(inv_id, account_id, review_text, review_rating) {
  try {
    const sql = 'INSERT INTO public.reviews (inv_id, account_id, review_text, review_rating) VALUES ($1, $2, $3, $4) RETURNING *'
    return await pool.query(sql, [
      inv_id,
      account_id,
      review_text,
      review_rating
    ])
  } catch (error) {
    console.error("addReview error: " + error)
    throw error
  }
}

/* ***************************
 *  Get all reviews by inventory id
 * ************************** */
async function getReviewsByInvId(inv_id) {
  try {
    const data = await pool.query(
      `SELECT r.review_id, r.inv_id, r.account_id, r.review_text, r.review_rating, r.review_date, a.account_firstname, a.account_lastname
      FROM public.reviews AS r
      INNER JOIN public.account AS a ON r.account_id = a.account_id
      WHERE r.inv_id = $1
      ORDER BY r.review_date DESC`,
      [inv_id]
    )
    return data.rows
  } catch (error) {
    console.error("getReviewsByInvId error " + error)
  }
}

/* ***************************
 *  Get average rating by inventory id
 * ************************** */
async function getAverageRatingByInvId(inv_id) {
  try {
    const data = await pool.query(
      'SELECT COALESCE(AVG(review_rating), 0) AS average_rating, COUNT(*) AS review_count FROM public.reviews WHERE inv_id = $1',
      [inv_id]
    )
    return {
      averageRating: parseFloat(data.rows[0].average_rating).toFixed(1),
      reviewCount: parseInt(data.rows[0].review_count)
    }
  } catch (error) {
    console.error("getAverageRatingByInvId error " + error)
  }
}

/* ***************************
 *  Get review by account and inventory id
 * ************************** */
async function getReviewByAccountAndInvId(account_id, inv_id) {
  try {
    const data = await pool.query(
      'SELECT * FROM public.reviews WHERE account_id = $1 AND inv_id = $2',
      [account_id, inv_id]
    )
    return data.rows[0] || null
  } catch (error) {
    console.error("getReviewByAccountAndInvId error " + error)
  }
}

/* ***************************
 *  Get review by review id
 * ************************** */
async function getReviewById(review_id) {
  try {
    const data = await pool.query(
      `SELECT r.*, a.account_firstname, a.account_lastname
      FROM public.reviews AS r
      INNER JOIN public.account AS a ON r.account_id = a.account_id
      WHERE r.review_id = $1`,
      [review_id]
    )
    return data.rows[0] || null
  } catch (error) {
    console.error("getReviewById error " + error)
  }
}

/* ***************************
 *  Update review
 * ************************** */
async function updateReview(review_id, review_text, review_rating, account_id) {
  try {
    const sql = 'UPDATE public.reviews SET review_text = $1, review_rating = $2, review_date = CURRENT_TIMESTAMP WHERE review_id = $3 AND account_id = $4 RETURNING *'
    const data = await pool.query(sql, [
      review_text,
      review_rating,
      review_id,
      account_id
    ])
    return data.rows[0] || null
  } catch (error) {
    console.error("updateReview error " + error)
  }
}

/* ***************************
 *  Delete review
 * ************************** */
async function deleteReview(review_id, account_id) {
  try {
    const sql = 'DELETE FROM public.reviews WHERE review_id = $1 AND account_id = $2'
    const data = await pool.query(sql, [review_id, account_id])
    return data
  } catch (error) {
    console.error("Delete Review Error: " + error)
    throw new Error("Delete Review Error")
  }
}

module.exports = {
  addReview,
  getReviewsByInvId,
  getAverageRatingByInvId,
  getReviewByAccountAndInvId,
  getReviewById,
  updateReview,
  deleteReview
}

