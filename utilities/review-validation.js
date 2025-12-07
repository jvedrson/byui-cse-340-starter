const utilities = require(".")
const { body, validationResult } = require("express-validator")
const invModel = require("../models/inventory-model")
const reviewModel = require("../models/review-model")
const validate = {}

/*  **********************************
  *  Review Data Validation Rules
  * ********************************* */
validate.reviewRules = () => {
  return [
    // review_text is required and must be between 10 and 1000 characters
    body("review_text")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a review.")
      .isLength({ min: 10 })
      .withMessage("Review must be at least 10 characters long.")
      .isLength({ max: 1000 })
      .withMessage("Review must not exceed 1000 characters."),

    // review_rating is required and must be between 1 and 5
    body("review_rating")
      .trim()
      .notEmpty()
      .withMessage("Please provide a rating.")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5."),

    // inv_id is required and must exist in database
    body("inv_id")
      .trim()
      .notEmpty()
      .withMessage("Vehicle ID is required.")
      .isInt()
      .withMessage("Vehicle ID must be a number.")
      .custom(async (value) => {
        const vehicle = await invModel.getInventoryByInvId(value)
        if (!vehicle) {
          throw new Error("Vehicle not found.")
        }
        return true
      }),
  ]
}

/* ******************************
 * Check review data and return errors or continue
 * ***************************** */
validate.checkReviewData = async (req, res, next) => {
  const { review_text, review_rating, inv_id } = req.body
  let errors = []
  errors = validationResult(req)
  
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    const itemData = await invModel.getInventoryByInvId(inv_id)
    const reviews = await reviewModel.getReviewsByInvId(inv_id)
    const ratingData = await reviewModel.getAverageRatingByInvId(inv_id)
    
    res.locals.review_text = review_text
    res.locals.review_rating = review_rating
    res.locals.inv_id = inv_id
    
    res.render("inventory/add-review", {
      errors,
      title: "Add Review",
      nav,
      inv_id,
      inv_make: itemData?.inv_make,
      inv_model: itemData?.inv_model,
      review: null,
      isEdit: false,
    })
    return
  }
  next()
}

/*  **********************************
  *  Update Review Data Validation Rules
  * ********************************* */
validate.updateReviewRules = () => {
  return [
    body("review_text")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a review.")
      .isLength({ min: 10 })
      .withMessage("Review must be at least 10 characters long.")
      .isLength({ max: 1000 })
      .withMessage("Review must not exceed 1000 characters."),

    body("review_rating")
      .trim()
      .notEmpty()
      .withMessage("Please provide a rating.")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5."),

    body("review_id")
      .trim()
      .notEmpty()
      .withMessage("Review ID is required.")
      .isInt()
      .withMessage("Review ID must be a number."),
  ]
}

/* ******************************
 * Check update review data and return errors or continue
 * ***************************** */
validate.checkUpdateReviewData = async (req, res, next) => {
  const { review_text, review_rating, review_id } = req.body
  let errors = []
  errors = validationResult(req)
  
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    const review = await reviewModel.getReviewById(review_id)
    
    if (!review) {
      req.flash("notice", "Review not found.")
      return res.redirect("/inv/")
    }
    
    const itemData = await invModel.getInventoryByInvId(review.inv_id)
    
    res.locals.review_text = review_text
    res.locals.review_rating = review_rating
    res.locals.review_id = review_id
    
    res.render("inventory/add-review", {
      errors,
      title: "Edit Review",
      nav,
      inv_id: review.inv_id,
      inv_make: itemData?.inv_make,
      inv_model: itemData?.inv_model,
      review,
      isEdit: true,
    })
    return
  }
  next()
}

module.exports = validate
