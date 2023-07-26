const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const KeyboardSchema = new Schema({
  name: { type: String, required: true, maxLength: 100 },
  manufacturer: { type: Schema.Types.ObjectId, ref: "Manufacturer", required: true },
  category: [{ type: Schema.Types.ObjectId, ref: "Category", required: true }],
  description: { type: String, required: true, maxLength: 300 },
  price: { type: Number, required: true, maxLength: 9 },
  stock: { type: Number, required: true, maxLength: 9 }
});

// Virtual for keyboard's URL
KeyboardSchema.virtual("url").get(function () {
  return `/catalog/keyboard/${this._id}`;
});

// Export model
module.exports = mongoose.model("Keyboard", KeyboardSchema);
