const invModel = require("../models/inventory-model")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  try {
    let data = await invModel.getClassifications()
    let list = "<ul>"
    list += '<li><a href="/" title="Home page">Home</a></li>'
    if (data && data.rows) {
      data.rows.forEach((row) => {
        list += "<li>"
        list +=
          '<a href="/inv/type/' +
          row.classification_id +
          '" title="See our inventory of ' +
          row.classification_name +
          ' vehicles">' +
          row.classification_name +
          "</a>"
        list += "</li>"
      })
    }
    list += "</ul>"
    return list
  } catch (error) {
    console.error("Error getting navigation:", error)
    // Return basic navigation if database fails
    return '<ul><li><a href="/" title="Home page">Home</a></li></ul>'
  }
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid = ''
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* **************************************
* Build the detail view HTML
* ************************************ */
Util.buildDetailHTML = async function(data){
  let html = ''
  if(data){
    html = '<div class="detail-container">'
    html += '<div class="detail-image">'
    html += '<img src="' + data.inv_image + '" alt="Image of ' + data.inv_make + ' ' + data.inv_model + ' on CSE Motors" />'
    html += '</div>'
    html += '<div class="detail-info">'
    html += '<h2>' + data.inv_make + ' ' + data.inv_model + '</h2>'
    html += '<p class="detail-year">Year: ' + data.inv_year + '</p>'
    html += '<p class="detail-price">Price: $' + new Intl.NumberFormat('en-US').format(data.inv_price) + '</p>'
    html += '<p class="detail-miles">Mileage: ' + new Intl.NumberFormat('en-US').format(data.inv_miles) + ' miles</p>'
    html += '<p class="detail-color">Color: ' + data.inv_color + '</p>'
    html += '<p class="detail-description">' + data.inv_description + '</p>'
    html += '</div>'
    html += '</div>'
  } else {
    html = '<p class="notice">Sorry, no matching vehicle could be found.</p>'
  }
  return html
}

/* **************************************
* Build the classification select list
* ************************************ */
Util.buildClassificationList = async function (classification_id = null) {
  try {
    let data = await invModel.getClassifications()
    let classificationList = '<select name="classification_id" id="classification_id" required>'
    classificationList += "<option value=''>Choose a Classification</option>"
    if (data && data.rows) {
      data.rows.forEach((row) => {
        classificationList += '<option value="' + row.classification_id + '"'
        if (
          classification_id != null &&
          row.classification_id == classification_id
        ) {
          classificationList += " selected "
        }
        classificationList += ">" + row.classification_name + "</option>"
      })
    }
    classificationList += "</select>"
    return classificationList
  } catch (error) {
    console.error("Error building classification list:", error)
    return '<select name="classification_id" id="classification_id" required><option value="">Choose a Classification</option></select>'
  }
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
 if (req.cookies.jwt) {
  jwt.verify(
   req.cookies.jwt,
   process.env.ACCESS_TOKEN_SECRET,
   function (err, accountData) {
    if (err) {
     req.flash("notice", "Please log in")
     res.clearCookie("jwt")
     return res.redirect("/account/login")
    }
    res.locals.accountData = accountData
    res.locals.loggedin = 1
    next()
   })
 } else {
  next()
 }
}

/* ****************************************
 * Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
 if (res.locals.loggedin) {
  next()
 } else {
  req.flash("notice", "Please log in.")
  return res.redirect("/account/login")
 }
}

module.exports = Util
