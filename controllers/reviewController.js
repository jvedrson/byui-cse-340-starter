const reviewModel = require("../models/review-model")
const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const reviewCont = {}

/* ***************************
 *  Build add review view
 * ************************** */
reviewCont.buildAddReview = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  const account_id = res.locals.accountData?.account_id
  
  if (!account_id) {
    req.flash("notice", "Please log in to leave a review.")
    return res.redirect(`/inv/detail/${inv_id}`)
  }
  
  let nav = await utilities.getNav()
  const itemData = await invModel.getInventoryByInvId(inv_id)
  
  if (!itemData) {
    req.flash("notice", "Vehicle not found.")
    return res.redirect("/inv/")
  }
  
  // Check if user already has a review for this vehicle
  const existingReview = await reviewModel.getReviewByAccountAndInvId(account_id, inv_id)
  
  if (existingReview) {
    res.render("./inventory/add-review", {
      title: "Edit Review",
      nav,
      inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      review: existingReview,
      isEdit: true,
      errors: null,
    })
  } else {
    res.render("./inventory/add-review", {
      title: "Add Review",
      nav,
      inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      review: null,
      isEdit: false,
      errors: null,
    })
  }
}

/* ***************************
 *  Process new review
 * ************************** */
reviewCont.addReview = async function (req, res, next) {
  let nav = await utilities.getNav()
  const { inv_id, review_text, review_rating } = req.body
  const account_id = res.locals.accountData?.account_id
  
  if (!account_id) {
    req.flash("notice", "Please log in to leave a review.")
    return res.redirect(`/inv/detail/${inv_id}`)
  }
  
  // Check if user already has a review
  const existingReview = await reviewModel.getReviewByAccountAndInvId(account_id, inv_id)
  
  if (existingReview) {
    req.flash("notice", "You have already left a review for this vehicle. You can edit it instead.")
    return res.redirect(`/inv/detail/${inv_id}`)
  }
  
  try {
    const regResult = await reviewModel.addReview(
      parseInt(inv_id),
      account_id,
      review_text,
      parseInt(review_rating)
    )
    
    if (regResult.rows && regResult.rows.length > 0) {
      req.flash("notice", "Thank you! Your review has been added.")
      res.redirect(`/inv/detail/${inv_id}`)
    } else {
      req.flash("notice", "Sorry, the review could not be added.")
      res.redirect(`/inv/detail/${inv_id}`)
    }
  } catch (error) {
    console.error("Error adding review:", error)
    req.flash("notice", "Sorry, there was an error adding your review.")
    res.redirect(`/inv/detail/${inv_id}`)
  }
}

/* ***************************
 *  Process review update
 * ************************** */
reviewCont.updateReview = async function (req, res, next) {
  let nav = await utilities.getNav()
  const { review_id, review_text, review_rating } = req.body
  const account_id = res.locals.accountData?.account_id
  
  if (!account_id) {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
  
  const review = await reviewModel.getReviewById(review_id)
  
  if (!review) {
    req.flash("notice", "Review not found.")
    return res.redirect("/inv/")
  }
  
  // Verify user owns the review
  if (review.account_id !== account_id) {
    req.flash("notice", "You can only edit your own reviews.")
    return res.redirect(`/inv/detail/${review.inv_id}`)
  }
  
  try {
    const updateResult = await reviewModel.updateReview(
      parseInt(review_id),
      review_text,
      parseInt(review_rating),
      account_id
    )
    
    if (updateResult) {
      req.flash("notice", "Your review has been updated.")
      res.redirect(`/inv/detail/${review.inv_id}`)
    } else {
      req.flash("notice", "Sorry, the review could not be updated.")
      res.redirect(`/inv/detail/${review.inv_id}`)
    }
  } catch (error) {
    console.error("Error updating review:", error)
    req.flash("notice", "Sorry, there was an error updating your review.")
    res.redirect(`/inv/detail/${review.inv_id}`)
  }
}

/* ***************************
 *  Process review deletion
 * ************************** */
reviewCont.deleteReview = async function (req, res, next) {
  let nav = await utilities.getNav()
  const review_id = parseInt(req.body.review_id)
  const account_id = res.locals.accountData?.account_id
  
  if (!account_id) {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
  
  const review = await reviewModel.getReviewById(review_id)
  
  if (!review) {
    req.flash("notice", "Review not found.")
    return res.redirect("/inv/")
  }
  
  // Verify user owns the review
  if (review.account_id !== account_id) {
    req.flash("notice", "You can only delete your own reviews.")
    return res.redirect(`/inv/detail/${review.inv_id}`)
  }
  
  try {
    const deleteResult = await reviewModel.deleteReview(review_id, account_id)
    
    if (deleteResult && deleteResult.rowCount === 1) {
      req.flash("notice", "Your review has been deleted.")
      res.redirect(`/inv/detail/${review.inv_id}`)
    } else {
      req.flash("notice", "Sorry, the review could not be deleted.")
      res.redirect(`/inv/detail/${review.inv_id}`)
    }
  } catch (error) {
    console.error("Error deleting review:", error)
    req.flash("notice", "Sorry, there was an error deleting your review.")
    res.redirect(`/inv/detail/${review.inv_id}`)
  }
}

/* ***************************
 *  Return reviews as JSON
 * ************************** */
reviewCont.getReviewsJSON = async (req, res, next) => {
  const inv_id = parseInt(req.params.inv_id)
  try {
    const reviews = await reviewModel.getReviewsByInvId(inv_id)
    const ratingData = await reviewModel.getAverageRatingByInvId(inv_id)
    
    if (reviews) {
      return res.json({
        reviews,
        ratingData
      })
    } else {
      next(new Error("No reviews found"))
    }
  } catch (error) {
    next(error)
  }
}

module.exports = reviewCont

