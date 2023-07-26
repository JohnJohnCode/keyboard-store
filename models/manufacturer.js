const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ManufacturerSchema = new Schema({
  name: { type: String, required: true, maxLength: 100 },
  description: { type: String, required: true, maxLength: 300 },
});

// Virtual for manufacturer's URL
ManufacturerSchema.virtual("url").get(function () {
  return `/catalog/manufacturer/${this._id}`;
});

// Export model
module.exports = mongoose.model("Manufacturer", ManufacturerSchema);
