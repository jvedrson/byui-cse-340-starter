const express = require("express")
const router = new express.Router()
const reviewController = require("../controllers/reviewController")
const utilities = require("../utilities/")
const reviewValidate = require("../utilities/review-validation")

// Route to build add review view
router.get("/add/:inv_id", utilities.checkLogin, utilities.handleErrors(reviewController.buildAddReview))

// Route to process new review
router.post(
  "/add",
  utilities.checkLogin,
  reviewValidate.reviewRules(),
  reviewValidate.checkReviewData,
  utilities.handleErrors(reviewController.addReview)
)

// Route to process review update
router.post(
  "/update",
  utilities.checkLogin,
  reviewValidate.updateReviewRules(),
  reviewValidate.checkUpdateReviewData,
  utilities.handleErrors(reviewController.updateReview)
)

// Route to process review deletion
router.post("/delete", utilities.checkLogin, utilities.handleErrors(reviewController.deleteReview))

// Route to get reviews as JSON
router.get("/:inv_id", utilities.handleErrors(reviewController.getReviewsJSON))

module.exports = router

