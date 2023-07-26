const Keyboard = require("../models/keyboard");
const Category = require("../models/category");
const Manufacturer = require("../models/manufacturer");
const async = require("async");
const { body, validationResult } = require("express-validator");


// Display index page.
exports.index = (req, res) => {
  async.parallel({
    category_count(callback) {
      Category.countDocuments({}, callback);
    },
    manufacturer_count(callback) {
      Manufacturer.countDocuments({}, callback);
    },
    keyboard_count(callback) {
      Keyboard.countDocuments({}, callback);
    }
  },
    (err, results) => {
      res.render("index", { title: "KBStore Catalog", error: err, data: results })
    }
  );
};

// Display list of all keyboards.
exports.keyboard_list = (req, res) => {
  Keyboard.find({})
  .sort({ name: 1 })
  .populate("manufacturer")
  .populate("category")
  .exec((err, results) => {
    if (err) return next(err);
    res.render("keyboard_list", { title: "List of keyboards", keyboard_list: results });
  });
};

// Display detail page for a specific keyboard.
exports.keyboard_detail = (req, res) => {
  Keyboard.findById(req.params.id)
  .populate("manufacturer")
  .populate("category")
  .exec((err, results) => {
    if (err) return next(err);
    res.render("keyboard_detail", { title: "Keyboard detail", keyboard: results });
  });
};

// Display keyboard create form on GET.
exports.keyboard_create_get = (req, res) => {
   // Get all manufacturers and categories, which we can use for adding to our keyboard.
   async.parallel(
    {
      manufacturers(callback) {
        Manufacturer.find(callback);
      },
      categories(callback) {
        Category.find(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      res.render("keyboard_form", {
        title: "Create keyboard",
        manufacturers: results.manufacturers,
        categories: results.categories,
      });
    }
  );
};

// Handle keyboard create on POST.
exports.keyboard_create_post = [
  // Convert the category to an array.
  (req, res, next) => {
    if (!Array.isArray(req.body.category)) {
      req.body.category =
        typeof req.body.category === "undefined" ? [] : [req.body.category];
    }
    next();
  },

  // Validate and sanitize fields.
  body("name", "Name must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("manufacturer", "Manufacturer must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("description", "Description must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("price", "Price must not be empty")
    .isDecimal()
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("stock", "Stock must not be empty")
    .isNumeric({no_symbols: false})
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("category.*").escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a keyboard object with escaped and trimmed data.
    const keyboard = new Keyboard({
      name: req.body.name,
      manufacturer: req.body.manufacturer,
      category: req.body.category,
      description: req.body.description,
      price: req.body.price,
      stock: req.body.stock,
    });
    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all manufacturers and categories for form.
      async.parallel(
        {
          manufacturers(callback) {
            Manufacturer.find(callback);
          },
          categories(callback) {
            Category.find(callback);
          },
        },
        (err, results) => {
          if (err) {
            return next(err);
          }

          // Mark our selected categories as checked.
          for (const category of results.categories) {
            if (keyboard.category.includes(category._id)) {
              category.checked = "true";
            }
          }
          res.render("keyboard_form", {
            title: "Create keyboard",
            manufacturers: results.manufacturers,
            categories: results.categories,
            keyboard,
            errors: errors.array(),
          });
        }
      );
      return;
    } else {
      // Data from form is valid.
      // Check if keyboard with same name already exists.
      Keyboard.findOne({ name: req.body.name }).exec((err, found_keyboard) => {
        if (err) {
          return next(err);
        }

        if (found_keyboard) {
          // Keyboard exists, redirect to its detail page.
          res.redirect(found_keyboard.url);
        } else {
          keyboard.save((err) => {
            if (err) {
              return next(err);
            }
            // Keyboard saved. Redirect to keyboard detail page.
            res.redirect(keyboard.url);
          });
        }
      });
    }
  },
];

// Display keyboard delete form on GET.
exports.keyboard_delete_get = (req, res) => {
  Keyboard.findById(req.params.id)
    .populate("manufacturer")
    .populate("category")
    .exec((err, results) => {
      if (err) return next(err);
      if (Keyboard == null) {
        res.redirect("/catalog/keyboards");
      }
      res.render("keyboard_delete", { 
        title: "Delete keyboard", 
        keyboard: results 
      });
    });
};

// Handle keyboard delete on POST.
exports.keyboard_delete_post = (req, res) => {
  Keyboard.findById(req.body.keyboardid)
    .exec((err, results) => {
      if (err) return next(err);
      if (Keyboard == null) {
        res.redirect("/catalog/keyboards");
      }
      Keyboard.findByIdAndRemove(req.body.keyboardid, (err) => {
        if (err) {
          next(err);
        }
        res.redirect("/catalog/keyboards")
      });
    });
};

// Display keyboard update form on GET.
exports.keyboard_update_get = (req, res) => {
  // Get keyboard, manufacturers and categories for form.
  async.parallel(
    {
      keyboard(callback) {
        Keyboard.findById(req.params.id)
          .populate("manufacturer")
          .populate("category")
          .exec(callback);
      },
      manufacturers(callback) {
        Manufacturer.find(callback);
      },
      categories(callback) {
        Category.find(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.keyboard == null) {
        // No results.
        const err = new Error("Keyboard not found");
        err.status = 404;
        return next(err);
      }
      // Success.
      // Mark our selected categories as checked.
      for (const category of results.categories) {
        for (const keyboardCategory of results.keyboard.category) {
          if (category._id.toString() === keyboardCategory._id.toString()) {
            category.checked = "true";
          }
        }
      }
      res.render("keyboard_form", {
        title: "Update keyboard",
        manufacturers: results.manufacturers,
        categories: results.categories,
        keyboard: results.keyboard,
      });
    }
  );
};

// Handle keyboard update on POST.
exports.keyboard_update_post = [
  // Convert the categories to an array
  (req, res, next) => {
    if (!Array.isArray(req.body.category)) {
      req.body.category =
        typeof req.body.category === "undefined" ? [] : [req.body.category];
    }
    next();
  },

  // Validate and sanitize fields.
  body("name", "Name must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("manufacturer", "Manufacturer must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("description", "Description must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("price")
    .isDecimal()
    .withMessage("Price must be a number.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("stock")
    .isNumeric({no_symbols: false})
    .withMessage("Stock must be a number.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("category.*").escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a keyboard object with escaped and trimmed data.
    const keyboard = new Keyboard({
      name: req.body.name,
      manufacturer: req.body.manufacturer,
      category: typeof req.body.category === "undefined" ? [] : req.body.category,
      description: req.body.description,
      price: req.body.price,
      stock: req.body.stock,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all manufacturers and categories for form.
      async.parallel(
      {
        manufacturers(callback) {
          Manufacturer.find(callback);
        },
        categories(callback) {
          Category.find(callback);
        },
      },
      (err, results) => {
        if (err) {
          return next(err);
        }

        // Mark our selected categories as checked.
        for (const category of results.categories) {
          if (keyboard.category.includes(category._id)) {
            category.checked = "true";
          }
        }
        res.render("keyboard_form", {
          title: "Update keyboard",
          manufacturers: results.manufacturers,
          categories: results.categories,
          keyboard: keyboard,
          errors: errors.array()
        });
      });
      return;
    }

    // Data from form is valid. Update the record.
    Keyboard.findByIdAndUpdate(req.params.id, keyboard, {}, (err, thekeyboard) => {
      if (err) {
        return next(err);
      }

      // Successful: redirect to keyboard detail page.
      res.redirect(thekeyboard.url);
    });
  },
];