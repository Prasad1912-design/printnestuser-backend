const mongoose = require('mongoose');

const url = "mongodb+srv://Print_Nest2025:PrintNestDatabase2025@printnestcluster.bxcsimc.mongodb.net/PrintNestDB?retryWrites=true&w=majority&appName=PrintNestCluster";

const connectDB = async () => {
  try {
    await mongoose.connect(url, {
      serverSelectionTimeoutMS: 5000
    });
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);
    // Do NOT stop server while developing
    // process.exit(1);
  }
};

module.exports = connectDB;
