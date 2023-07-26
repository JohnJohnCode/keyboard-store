const express = require("express");
const router = express.Router();

// Require controller modules.
const category_controller = require("../controllers/categoryController");
const manufacturer_controller = require("../controllers/manufacturerController");
const keyboard_controller = require("../controllers/keyboardController");

/// KEYBOARD ROUTES ///

// GET catalog home page.
router.get("/", keyboard_controller.index);

// GET request for creating a keyboard.
router.get("/keyboard/create", keyboard_controller.keyboard_create_get);

// POST request for creating keyboard.
router.post("/keyboard/create", keyboard_controller.keyboard_create_post);

// GET request to delete keyboard.
router.get("/keyboard/:id/delete", keyboard_controller.keyboard_delete_get);

// POST request to delete keyboard.
router.post("/keyboard/:id/delete", keyboard_controller.keyboard_delete_post);

// GET request to update keyboard.
router.get("/keyboard/:id/update", keyboard_controller.keyboard_update_get);

// POST request to update keyboard.
router.post("/keyboard/:id/update", keyboard_controller.keyboard_update_post);

// GET request for one keyboard.
router.get("/keyboard/:id", keyboard_controller.keyboard_detail);

// GET request for list of all keyboard items.
router.get("/keyboards", keyboard_controller.keyboard_list);

/// MANUFACTURER ROUTES ///

// GET request for creating manufacturer.
router.get("/manufacturer/create", manufacturer_controller.manufacturer_create_get);

// POST request for creating manufacturer.
router.post("/manufacturer/create", manufacturer_controller.manufacturer_create_post);

// GET request to delete manufacturer.
router.get("/manufacturer/:id/delete", manufacturer_controller.manufacturer_delete_get);

// POST request to delete manufacturer.
router.post("/manufacturer/:id/delete", manufacturer_controller.manufacturer_delete_post);

// GET request to update manufacturer.
router.get("/manufacturer/:id/update", manufacturer_controller.manufacturer_update_get);

// POST request to update manufacturer.
router.post("/manufacturer/:id/update", manufacturer_controller.manufacturer_update_post);

// GET request for one manufacturer.
router.get("/manufacturer/:id", manufacturer_controller.manufacturer_detail);

// GET request for list of all manufacturer.
router.get("/manufacturers", manufacturer_controller.manufacturer_list);

/// CATEGORY ROUTES ///

// GET request for creating a category.
router.get("/category/create", category_controller.category_create_get);

//POST request for creating category.
router.post("/category/create", category_controller.category_create_post);

// GET request to delete category.
router.get("/category/:id/delete", category_controller.category_delete_get);

// POST request to delete category.
router.post("/category/:id/delete", category_controller.category_delete_post);

// GET request to update category.
router.get("/category/:id/update", category_controller.category_update_get);

// POST request to update category.
router.post("/category/:id/update", category_controller.category_update_post);

// GET request for one category.
router.get("/category/:id", category_controller.category_detail);

// GET request for list of all category.
router.get("/categories", category_controller.category_list);

module.exports = router;
