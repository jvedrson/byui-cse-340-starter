// Needed Resources
const express = require("express")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const utilities = require("../utilities/")
const regValidate = require('../utilities/account-validation')

// Route to build login view
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// Route to build registration view
router.get("/register", utilities.handleErrors(accountController.buildRegister));

// Route to build account management view
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildAccountManagement));

// Process the registration data
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Process the login request
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

// Route to build account update view
router.get("/update/:account_id", utilities.checkLogin, utilities.handleErrors(accountController.buildAccountUpdate));

// Process the account update
router.post(
  "/update",
  utilities.checkLogin,
  regValidate.accountUpdateRules(),
  regValidate.checkAccountUpdateData,
  utilities.handleErrors(accountController.updateAccount)
)

// Process the password update
router.post(
  "/update-password",
  utilities.checkLogin,
  regValidate.passwordUpdateRules(),
  regValidate.checkPasswordUpdateData,
  utilities.handleErrors(accountController.updatePassword)
)

// Route to process logout
router.get("/logout", utilities.handleErrors(accountController.accountLogout))

module.exports = router;

