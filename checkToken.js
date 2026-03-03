require("dotenv").config();
const jwt = require("jsonwebtoken");
const CompanyDb = require("./EntityClasses/beforeLogin_entites/Domain_Company_Schema");

const checkToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authorization token missing"
    });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      // 🔑 Handle expiry cleanly
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token expired",
          tokenExpired: true
        });
      }

      return res.status(401).json({
        success: false,
        message: "Invalid token"
      });
    }

    try {
      const companyId = decoded.companyId;

      if (!companyId) {
        return res.status(403).json({
          success: false,
          message: "Company ID not found in token"
        });
      }

      const companyDetails = await CompanyDb.findById(companyId);

      if (!companyDetails) {
        return res.status(404).json({
          success: false,
          message: "No registered organization"
        });
      }

      // Attach data to request
      req.user = decoded;
      req.company = companyDetails;

      next();

    } catch (dbError) {
      return res.status(500).json({
        success: false,
        message: "Server authentication error"
      });
    }
  });
};

module.exports = checkToken;
