const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;

function requireUser(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ message: "Authorization token is missing" });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    req.user = decoded;
    next();
  });
}

module.exports = {
  requireUser,
};
