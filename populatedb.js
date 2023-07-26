#! /usr/bin/env node

console.log('This script populates some test books, authors, genres and bookinstances to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async')
var Category = require('./models/category')
var Manufacturer = require('./models/manufacturer')
var Keyboard = require('./models/keyboard')


var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var categories = []
var manufacturers = []
var keyboards = []

function categoryCreate(name, description, cb) {
  categorydetail = { name: name , description: description }
  
  var category = new Category(categorydetail);
       
  category.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Category: ' + category);
    categories.push(category)
    cb(null, category)
  }  );
}

function manufacturerCreate(name, description, cb) {
  var manufacturer = new Manufacturer({ name: name, description: description });
       
  manufacturer.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Manufacturer: ' + manufacturer);
    manufacturers.push(manufacturer);
    cb(null, manufacturer);
  }   );
}

function keyboardCreate(name, manufacturer, category, description, price, stock, cb) {
  keyboarddetail = { 
    name: name,
    manufacturer: manufacturer,
    category: category,
    description: description,
    price: price,
    stock: stock
  };
  if (category != false) keyboarddetail.category = category;
    
  var keyboard = new Keyboard(keyboarddetail);    
  keyboard.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Keyboard: ' + keyboard);
    keyboards.push(keyboard);
    cb(null, keyboard);
  }  );
}
1
function createCategoriesManufacturers(cb) {
    async.series([
        function(callback) {
          manufacturerCreate('Logitech', `Logitech International S.A. is a Swiss multinational manufacturer of computer peripherals and software, with headquarters in Lausanne, Switzerland, and Newark, California.`, callback);
        },
        function(callback) {
          manufacturerCreate('Roccat', `Roccat GmbH is a German computer accessories manufacturer based in Hamburg. It was also the titular sponsor of former German professional esports organization Team ROCCAT. `, callback);
        },
        function(callback) {
          manufacturerCreate('HyperX', `HyperX is the gaming division of a American multination computer technology company Kingston Technology.`, callback);
        },
        function(callback) {
          manufacturerCreate('Razer', `Razer Inc. is an American-Singaporean multinational technology company that designs, develops, and sells consumer electronics, financial services, and gaming hardware.`, callback);
        },
        function(callback) {
          manufacturerCreate('Dell', `Dell is an American technology company that develops, sells, repairs, and supports computers and related products and services and is owned by its parent company, Dell Technologies. `, callback);
        },
        function(callback) {
          categoryCreate("Wireless", `Relying on a radio frequency antenna or infrared to keep you connected, wireless RF keyboards offer a bit of freedom in your computing activities.`, callback);
        },
        function(callback) {
          categoryCreate("Wired", `The "traditional" keyboard with a wire, sacrificing comfort for stability and speed.`, callback);
        },
        function(callback) {
          categoryCreate("Mechanical", `Designed in the likeness of old-fashioned typewriters, QWERTY is the most common keyboard layout. Generations of typists have come to know the QWERTY keyboard, and most students learn to type with this kind keyboard layout.`, callback);
        },
        function(callback) {
          categoryCreate("Membrane", `Membrane keyboards are designed without space between the individual keys. The keys are pressure-sensitive, with the different characters outlined on a flat surface.`, callback);
        },
      ],
  // optional callback
  cb);
}


function createKeyboards(cb) {
    async.parallel([
        function(callback) {
          keyboardCreate('Razer BlackWidow V3 Mechanical Gaming Keyboard',  manufacturers[3], [categories[1],categories[2]], 
          `Razer Yellow Mechanical Switches: Built for speed with an actuation point of just 1.2mm, these smooth switches have no tactile feedback and include sound dampeners to reduce its already low sound profile even further.`, 139.99, 5, callback);
        },
        function(callback) {
          keyboardCreate("Logitech G613 LIGHTSPEED Wireless Mechanical Gaming Keyboard", manufacturers[0], [categories[0],categories[2]], 
          `Romer G mechanical switches deliver quiet, precise mechanical performance and 70 million click life for incredible feel and durability `, 87.99, 6, callback);
        },
        function(callback) {
          keyboardCreate("Logitech G PRO Mechanical Gaming Keyboard", manufacturers[0], [categories[1],categories[2]],
          `Built with and for esports athletes for competition-level performance, speed and precision.`, 120.99, 10, callback);
        },
        function(callback) {
          keyboardCreate("ROCCAT Vulcan TKL", manufacturers[1], [categories[1],categories[2]],
          `TITAN SWITCH MECHANICAL (TACTILE) - Designed and built entirely by ROCCAT engineers and developed for gamers who love the feel of mechanical switches, but demand the feel of the crisp, tactile bump and instant responsiveness `, 129.99, 2, callback);
        },
        function(callback) {
          keyboardCreate("Dell Wired Keyboard - Black KB216", manufacturers[4], [categories[1],categories[3]],
          `The Dell Wired Keyboard provides a convenient keyboard solution for everyday home or office computing uses. `, 25.99, 5, callback);
        },
        function(callback) {
          keyboardCreate('Logitech K350', manufacturers[0], [categories[0],categories[3]],
          `Wave design with Constant Curve layout: Curved layout guides hands into just the right position `, 27.99, 9, callback);
        },
        function(callback) {
          keyboardCreate('Test Keyboard', manufacturers[3], [categories[0],categories[3]], 'Description of test keyboard', 5.99, 3, callback)
        }
      ],
  // optional callback
  cb);
}

async.series([
    createCategoriesManufacturers,
    createKeyboards,
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    else {
        console.log('Keyboards: '+keyboards);
        
    }
    // All done, disconnect from database
    mongoose.connection.close();
});




