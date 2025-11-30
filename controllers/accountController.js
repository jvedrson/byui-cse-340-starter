const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

const accountController = {}

/* ****************************************
*  Deliver login view
* *************************************** */
accountController.buildLogin = async function(req, res, next) {
  let nav = await utilities.getNav(req, res)
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null
  })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
accountController.buildRegister = async function(req, res, next) {
  let nav = await utilities.getNav(req, res)
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
accountController.registerAccount = async function(req, res) {
  let nav = await utilities.getNav(req, res)
  const { account_firstname, account_lastname, account_email, account_password } = req.body
  
  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
    return
  }
  
  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )
  
  if (regResult.rows) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render('account/login', {
      title: 'Login',
      nav,
      errors: null,
    });
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    })
  }
}

/* ****************************************
*  Process login request
* ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav(req, res)
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

accountController.accountLogin = accountLogin

/* ****************************************
*  Deliver account management view
* *************************************** */
accountController.buildAccountManagement = async function(req, res, next) {
  let nav = await utilities.getNav(req, res)
  const accountData = res.locals.accountData
  res.render("account/management", {
    title: "Account Management",
    nav,
    errors: null,
    accountData,
  })
}

/* ****************************************
*  Deliver account update view
* *************************************** */
accountController.buildAccountUpdate = async function(req, res, next) {
  let nav = await utilities.getNav(req, res)
  const loggedInAccountId = res.locals.accountData?.account_id
  const requestedAccountId = req.params.account_id
  
  // Ensure user can only update their own account
  if (requestedAccountId && requestedAccountId != loggedInAccountId) {
    req.flash("notice", "You can only update your own account.")
    return res.redirect("/account/")
  }
  
  const account_id = requestedAccountId || loggedInAccountId
  const accountData = await accountModel.getAccountById(account_id)
  
  if (!accountData) {
    req.flash("notice", "Account not found.")
    return res.redirect("/account/")
  }
  
  res.render("account/update", {
    title: "Update Account",
    nav,
    errors: null,
    accountData,
  })
}

/* ****************************************
*  Process account update
* *************************************** */
accountController.updateAccount = async function(req, res, next) {
  let nav = await utilities.getNav(req, res)
  const { account_firstname, account_lastname, account_email, account_id } = req.body
  const loggedInAccountId = res.locals.accountData?.account_id
  
  // Ensure user can only update their own account
  if (account_id != loggedInAccountId) {
    req.flash("notice", "You can only update your own account.")
    return res.redirect("/account/")
  }
  
  const updateResult = await accountModel.updateAccountInfo(
    account_firstname,
    account_lastname,
    account_email,
    account_id
  )
  
  if (updateResult.rows) {
    const accountData = await accountModel.getAccountById(account_id)
    req.flash("notice", "Account information updated successfully.")
    res.render("account/management", {
      title: "Account Management",
      nav,
      errors: null,
      accountData,
    })
  } else {
    req.flash("notice", "Sorry, the account update failed.")
    const accountData = await accountModel.getAccountById(account_id)
    res.render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
      accountData,
    })
  }
}

/* ****************************************
*  Process password update
* *************************************** */
accountController.updatePassword = async function(req, res, next) {
  let nav = await utilities.getNav(req, res)
  const { account_password, account_id } = req.body
  const loggedInAccountId = res.locals.accountData?.account_id
  
  // Ensure user can only update their own account
  if (account_id != loggedInAccountId) {
    req.flash("notice", "You can only update your own account.")
    return res.redirect("/account/")
  }
  
  // Hash the password before storing
  let hashedPassword
  try {
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the password update.')
    const accountData = await accountModel.getAccountById(account_id)
    res.render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
      accountData,
    })
    return
  }
  
  const updateResult = await accountModel.updateAccountPassword(hashedPassword, account_id)
  
  if (updateResult.rows) {
    const accountData = await accountModel.getAccountById(account_id)
    req.flash("notice", "Password updated successfully.")
    res.render("account/management", {
      title: "Account Management",
      nav,
      errors: null,
      accountData,
    })
  } else {
    req.flash("notice", "Sorry, the password update failed.")
    const accountData = await accountModel.getAccountById(account_id)
    res.render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
      accountData,
    })
  }
}

/* ****************************************
*  Process logout
* *************************************** */
accountController.accountLogout = async function(req, res, next) {
  res.clearCookie("jwt")
  req.flash("notice", "You have been logged out.")
  res.redirect("/")
}

module.exports = accountController

