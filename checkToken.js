require("dotenv").config();
const CompanyDb = require("./EntityClasses/beforeLogin_entites/Domain_Company_Schema");

// checkToken.js
const jwt = require("jsonwebtoken");

function checkToken(req, res, next) {
  const authHeader = req.headers.authorization; // check Authorization header
  if (!authHeader) {
    return res.status(401).json({ success: false, message: "No Token Authentication found" });
  }

  const token = authHeader.split(" ")[1]; // Bearer <token>
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // verify token
    req.user = decoded; // attach decoded info to request
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: "Token Invalid or Expired" });
  }
}

module.exports = checkToken;