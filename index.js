const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req, res, next) {
    // Get the token from the Authorization header
    const token = req.headers['authorization'];

    // If no token is provided, deny access
    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
        // Verify the JWT token
        const decoded = jwt.verify(token.split(" ")[1], "fingerprint_customer");


        // Attach the user data to the request object
        req.user = decoded;

        // Call the next middleware or route handler
        next();
    } catch (err) {
        // If token is invalid, return Unauthorized error
        return res.status(401).json({ message: "Invalid token." });
    }
});

 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
