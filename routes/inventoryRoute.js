// Needed Resources
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const invValidate = require("../utilities/inventory-validation")

// Route to build management view
router.get("/", utilities.checkAccountType, utilities.handleErrors(invController.buildManagement));

// Route to build add classification view
router.get("/add-classification", utilities.checkAccountType, utilities.handleErrors(invController.buildAddClassification));

// Route to process new classification
router.post(
  "/add-classification",
  utilities.checkAccountType,
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
);

// Route to build add inventory view
router.get("/add-inventory", utilities.checkAccountType, utilities.handleErrors(invController.buildAddInventory));

// Route to process new inventory item
router.post(
  "/add-inventory",
  utilities.checkAccountType,
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
);

// Route to process inventory update
router.post(
  "/update",
  utilities.checkAccountType,
  invValidate.inventoryRules(),
  invValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
);

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route to build inventory by inv_id view
router.get("/detail/:invId", utilities.handleErrors(invController.buildByInvId));

// Route to build edit inventory view
router.get("/edit/:inv_id", utilities.checkAccountType, utilities.handleErrors(invController.editInventoryView));

// Route to build delete confirmation view
router.get("/delete/:inv_id", utilities.checkAccountType, utilities.handleErrors(invController.deleteInventoryView));

// Route to process inventory deletion
router.post("/delete", utilities.checkAccountType, utilities.handleErrors(invController.deleteInventory));

// Route to get inventory by classification as JSON
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON));

// Route to trigger intentional error
router.get("/error", utilities.handleErrors(invController.triggerError));

module.exports = router;

