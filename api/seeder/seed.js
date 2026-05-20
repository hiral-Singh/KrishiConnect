const mongoose = require("mongoose");
const dotenv = require("dotenv");

const User = require("../models/UserModel");
const Category = require("../models/CategoryModel");
const Product = require("../models/ProductModel");
const FarmerProfile = require("../models/FarmerProfileModel");

const categoryData = require("./categories");
const userData = require("./users");
const farmerProfileData = require("./farmerProfiles");
const productData = require("./products");

dotenv.config();

// CONNECT DATABASE
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

// IMPORT DATA
const importData = async () => {
  try {
    // DELETE OLD DATA
    await Product.deleteMany();
    await FarmerProfile.deleteMany();
    await Category.deleteMany();
    await User.deleteMany();

    console.log("Old data deleted");

    // CREATE CATEGORIES
    const createdCategories = await Category.insertMany(categoryData);

    console.log("Categories seeded");

    // CREATE USERS
    const createdUsers = [];

    for (const user of userData) {
      const createdUser = await User.create(user);
      createdUsers.push(createdUser);
    }

    console.log("Users seeded");

    // GET FARMERS
    const farmers = createdUsers.filter(
      (user) => user.role === "farmer"
    );

    // CREATE FARMER PROFILES
    const farmerProfiles = farmerProfileData.map((profile, index) => ({
      ...profile,
      user: farmers[index]._id,
    }));

    await FarmerProfile.insertMany(farmerProfiles);

    console.log("Farmer profiles seeded");

    // GET CATEGORY REFERENCES
    const vegetablesCategory = createdCategories.find(
      (cat) => cat.name === "Vegetables"
    );

    const grainsCategory = createdCategories.find(
      (cat) => cat.name === "Grains"
    );

    const fruitsCategory = createdCategories.find(
      (cat) => cat.name === "Fruits"
    );

    // CREATE PRODUCTS
    const products = [
      {
        ...productData[0],
        farmer: farmers[0]._id,
        category: vegetablesCategory._id,
      },

      {
        ...productData[1],
        farmer: farmers[1]._id,
        category: grainsCategory._id,
      },

      {
        ...productData[2],
        farmer: farmers[0]._id,
        category: fruitsCategory._id,
      },
    ];

    await Product.insertMany(products);

    console.log("Products seeded");
    console.log("DATABASE SEEDED SUCCESSFULLY");

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

// START
const start = async () => {
  await connectDB();
  await importData();
};

start();