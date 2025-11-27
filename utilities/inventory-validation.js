const utilities = require(".")
const { body, validationResult } = require("express-validator")
const invModel = require("../models/inventory-model")
const validate = {}

/*  **********************************
  *  Classification Data Validation Rules
  * ********************************* */
validate.classificationRules = () => {
  return [
    // classification_name is required and must not contain spaces or special characters
    body("classification_name")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a classification name.")
      .matches(/^[a-zA-Z0-9]+$/)
      .withMessage("Classification name cannot contain spaces or special characters."),
  ]
}

/* ******************************
 * Check classification data and return errors or continue
 * ***************************** */
validate.checkClassificationData = async (req, res, next) => {
  const { classification_name } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.locals.classification_name = classification_name
    res.render("inventory/add-classification", {
      errors,
      title: "Add New Classification",
      nav,
    })
    return
  }
  next()
}

/*  **********************************
  *  Inventory Data Validation Rules
  * ********************************* */
validate.inventoryRules = () => {
  return [
    // inv_make is required
    body("inv_make")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a make."),

    // inv_model is required
    body("inv_model")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a model."),

    // inv_year is required and must be 4 characters
    body("inv_year")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 4, max: 4 })
      .withMessage("Please provide a valid year (4 digits).")
      .isNumeric()
      .withMessage("Year must be numeric."),

    // inv_description is required
    body("inv_description")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a description."),

    // inv_image is required
    body("inv_image")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide an image path."),

    // inv_thumbnail is required
    body("inv_thumbnail")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a thumbnail path."),

    // inv_price is required and must be numeric
    body("inv_price")
      .trim()
      .notEmpty()
      .isNumeric()
      .withMessage("Please provide a valid price."),

    // inv_miles is required and must be numeric
    body("inv_miles")
      .trim()
      .notEmpty()
      .isInt({ min: 0 })
      .withMessage("Please provide valid mileage (must be a positive number)."),

    // inv_color is required
    body("inv_color")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a color."),

    // classification_id is required
    body("classification_id")
      .trim()
      .notEmpty()
      .withMessage("Please select a classification."),
  ]
}

/* ******************************
 * Check inventory data and return errors or continue
 * ***************************** */
validate.checkInventoryData = async (req, res, next) => {
  const { 
    inv_make, 
    inv_model, 
    inv_year, 
    inv_description, 
    inv_image, 
    inv_thumbnail, 
    inv_price, 
    inv_miles, 
    inv_color, 
    classification_id 
  } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList(classification_id)
    res.locals.inv_make = inv_make
    res.locals.inv_model = inv_model
    res.locals.inv_year = inv_year
    res.locals.inv_description = inv_description
    res.locals.inv_image = inv_image
    res.locals.inv_thumbnail = inv_thumbnail
    res.locals.inv_price = inv_price
    res.locals.inv_miles = inv_miles
    res.locals.inv_color = inv_color
    res.locals.classificationList = classificationList
    res.render("inventory/add-inventory", {
      errors,
      title: "Add New Inventory Item",
      nav,
    })
    return
  }
  next()
}

/* ******************************
 * Check update data and return errors or continue
 * ***************************** */
validate.checkUpdateData = async (req, res, next) => {
  const { 
    inv_id,
    inv_make, 
    inv_model, 
    inv_year, 
    inv_description, 
    inv_image, 
    inv_thumbnail, 
    inv_price, 
    inv_miles, 
    inv_color, 
    classification_id 
  } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    res.locals.inv_id = inv_id
    res.locals.inv_make = inv_make
    res.locals.inv_model = inv_model
    res.locals.inv_year = inv_year
    res.locals.inv_description = inv_description
    res.locals.inv_image = inv_image
    res.locals.inv_thumbnail = inv_thumbnail
    res.locals.inv_price = inv_price
    res.locals.inv_miles = inv_miles
    res.locals.inv_color = inv_color
    res.locals.classification_id = classification_id
    res.render("inventory/edit-inventory", {
      errors,
      title: "Edit " + itemName,
      nav,
      classificationSelect,
    })
    return
  }
  next()
}

module.exports = validate

