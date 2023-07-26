const Keyboard = require("../models/keyboard");
const Category = require("../models/category");
const async = require("async");
const { body, validationResult } = require("express-validator");

// Display list of all categories.
exports.category_list = (req, res) => {
  Category.find({})
  .sort({ name: 1 })
  .exec((err, results) => {
    if (err) return next(err);
    res.render("category_list", { title: "List of categories", category_list: results });
  });
};

// Display detail page for a specific category.
exports.category_detail = (req, res) => {
  async.parallel(
    {
      category(callback) {
        Category.findById(req.params.id).exec(callback);
      },
      category_keyboards(callback) {
        Keyboard.find({ category: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      // Success
      res.render("category_detail", { 
        title: "Category detail",
        category: results.category,
        keyboard_list: results.category_keyboards
      });
    }
  );
}

// Display category create form on GET.
exports.category_create_get = (req, res) => {
  Category.find()
  .exec((err, results) => {
    if (err) return next(err);
    res.render("category_form", { title: "Create category", category: results });
  });
};

// Handle category create on POST.
exports.category_create_post = [

  // Validate and sanitize fields.
  body("name", "Name must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("description", "Description must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a category object with escaped and trimmed data.
    const category = new Category({
      name: req.body.name,
      description: req.body.description,
    });
    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.
      if (err) return next(err);

      res.render("category_form", { 
        title: "Create category", 
        category: results, 
        errors: errors.array()
      });
      return;
    } else {
      // Data from form is valid.
      // Check if category with same name already exists.
      Category.findOne({ name: req.body.name }).exec((err, found_category) => {
        if (err) {
          return next(err);
        }

        if (found_category) {
          // Category exists, redirect to its detail page.
          res.redirect(found_category.url);
        } else {
          category.save((err) => {
            if (err) {
              return next(err);
            }
            // Category saved. Redirect to category detail page.
            res.redirect(category.url);
          });
        }
      });
    }
  },
];

// Display category delete form on GET.
exports.category_delete_get = (req, res) => {
  async.parallel(
    {
      category(callback) {
        Category.findById(req.params.id).exec(callback);
      },
      category_keyboards(callback) {
        Keyboard.find({ category: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.category == null) {
        // No results.
        res.redirect("/catalog/categories");
      }
      // Successful, so render.
      res.render("category_delete", {
        title: "Delete category",
        category: results.category,
        category_keyboards: results.category_keyboards,
      });
    }
  );
};

// Handle category delete on POST.
exports.category_delete_post = (req, res) => {
  async.parallel(
    {
      category(callback) {
        Category.findById(req.params.id).exec(callback);
      },
      category_keyboards(callback) {
        Keyboard.find({ category: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      // Success
      if (results.category_keyboards.length > 0) {
        // Category has keyboards. Render in same way as for GET route.
        res.render("category_delete", {
          title: "Delete category",
          category: results.category,
          category_keyboards: results.category_keyboards,
        });
        return;
      }
      // Category has no keyboards. Delete object and redirect to the list of categories.
      Category.findByIdAndRemove(req.body.categoryid, (err) => {
        if (err) {
          return next(err);
        }
        // Success - go to category list
        res.redirect("/catalog/categories");
      });
    }
  );
};

// Display category update form on GET.
exports.category_update_get = (req, res) => {
  Category.findById(req.params.id).exec((err, category) => {
    if (err) {
      next(err);
    }
    res.render("category_form", { 
      title: "Update category",
      category: category,
    });
  });
};

// Handle category update on POST.
exports.category_update_post = [
  // Validate and sanitize fields.
  body("name", "Name must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("description", "Description must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a category object with escaped and trimmed data.
    const category = new Category({ 
      name: req.body.name,
      description: req.body.description, 
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render("category_form", {
        title: "Update category",
        category,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid. Update DB.
      Category.findByIdAndUpdate(req.params.id, category, {}, (err, thecategory) => {
        if (err) {
          return next(err);
        }
        res.redirect(thecategory.url);
      });   
    }
  },
];
