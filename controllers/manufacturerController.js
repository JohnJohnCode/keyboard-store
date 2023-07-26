const Keyboard = require("../models/keyboard");
const Manufacturer = require("../models/manufacturer");
const { body, validationResult } = require("express-validator");
const async = require("async");

// Display list of all manufacturers.
exports.manufacturer_list = (req, res) => {
  Manufacturer.find({})
  .sort({ name: 1 })
  .exec((err, results) => {
    if (err) return next(err);
    res.render("manufacturer_list", { title: "List of manufacturers", manufacturer_list: results });
  });
};

// Display detail page for a specific manufacturer.
exports.manufacturer_detail = (req, res) => {
  Manufacturer.findById(req.params.id)
  .exec((err, results) => {
    if (err) return next(err);
    res.render("manufacturer_detail", { title: "Manufacturer detail", manufacturer: results });
  });
};

// Display manufacturer create form on GET.
exports.manufacturer_create_get = (req, res) => {
  Manufacturer.find()
  .exec((err, results) => {
    if (err) return next(err);
    res.render("manufacturer_form", { title: "Create manufacturer", manufacturer: results });
  });
};

// Handle manufacturer create on POST.
exports.manufacturer_create_post = [
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

    // Create a manufacturer object with escaped and trimmed data.
    const manufacturer = new Manufacturer({
      name: req.body.name,
      description: req.body.description,
    });
    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      Manufacturer.find()
      .exec((err, results) => {
        if (err) return next(err);
        res.render("manufacturer_form", { 
          title: "Create manufacturer", 
          manufacturer: results, 
          errors: errors.array()
        });
      });
      return;
    } else {
      // Data from form is valid.
      // Check if manufacturer with same name already exists.
      Manufacturer.findOne({ name: req.body.name }).exec((err, found_manufacturer) => {
        if (err) {
          return next(err);
        }

        if (found_manufacturer) {
          // Manufacturer exists, redirect to its detail page.
          res.redirect(found_manufacturer.url);
        } else {
          manufacturer.save((err) => {
            if (err) {
              return next(err);
            }
            // Manufacturer saved. Redirect to manufacturer detail page.
            res.redirect(manufacturer.url);
          });
        }
      });
    }
  },
];

// Display manufacturer delete form on GET.
exports.manufacturer_delete_get = (req, res) => {
  async.parallel(
    {
      manufacturer(callback) {
        Manufacturer.findById(req.params.id).exec(callback);
      },
      manufacturer_keyboards(callback) {
        Keyboard.find({ manufacturer: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.manufacturer == null) {
        // No results.
        res.redirect("/catalog/manufacturers");
      }
      // Successful, so render.
      res.render("manufacturer_delete", {
        title: "Delete manufacturer",
        manufacturer: results.manufacturer,
        manufacturer_keyboards: results.manufacturer_keyboards,
      });
    }
  );
};

// Handle manufacturer delete on POST.
exports.manufacturer_delete_post = (req, res) => {
  async.parallel(
    {
      manufacturer(callback) {
        Manufacturer.findById(req.params.id).exec(callback);
      },
      manufacturer_keyboards(callback) {
        Keyboard.find({ manufacturer: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      // Success
      if (results.manufacturer_keyboards.length > 0) {
        // Manufacturer has keyboards. Render in same way as for GET route.
        res.render("manufacturer_delete", {
          title: "Delete manufacturer",
          manufacturer: results.manufacturer,
          manufacturer_keyboards: results.manufacturer_keyboards,
        });
        return;
      }
      // Manufacturer has no keyboards. Delete object and redirect to the list of manufacturers.
      Manufacturer.findByIdAndRemove(req.body.manufacturerid, (err) => {
        if (err) {
          return next(err);
        }
        // Success - go to manufacturer list
        res.redirect("/catalog/manufacturers");
      });
    }
  );
};

// Display manufacturer update form on GET.
exports.manufacturer_update_get = (req, res) => {
  async.parallel(
    {
      manufacturer(callback) {
        Manufacturer.findById(req.params.id).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        // Error in API usage.
        return next(err);
      }
      if (results.manufacturer == null) {
        // No results.
        const err = new Error("Manufacturer not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render.
      res.render("manufacturer_form", {
        title: "Update manufacturer",
        manufacturer: results.manufacturer,
      });
    }
  );
};

// Handle manufacturer update on POST.
exports.manufacturer_update_post = [
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

    // Create a Manufacturer object with escaped/trimmed data and old id.
    const manufacturer = new Manufacturer({
      name: req.body.name,
      description: req.body.description,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      async.parallel(
        {
          manufacturer(callback) {
            Manufacturer.findById(req.params.id).exec(callback);
          },
        },
        (err, results) => {
          if (err) {
            // Error in API usage.
            return next(err);
          }
          if (results.manufacturer == null) {
            // No results.
            const err = new Error("Manufacturer not found");
            err.status = 404;
            return next(err);
          }
          // Successful, so render.
          res.render("manufacturer_form", {
            title: "Update manufacturer",
            manufacturer: results.manufacturer,
            errors: errors.array()
          });
        }
      );
      return;
    }

    // Data from form is valid. Update the record.
    Manufacturer.findByIdAndUpdate(req.params.id, manufacturer, {}, (err, themanufacturer) => {
      if (err) {
        return next(err);
      }
      // Successful - redirect to new manufacturer record.
      res.redirect(themanufacturer.url);
    });
  },
];
