const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

// Users array to store registered users
let users = [];

// Helper function: Check if username exists
const isValid = (username) => {
    return users.some(user => user.username === username);
}

// Helper function: Authenticate user
const authenticatedUser = (username, password) => {
    return users.some(user => user.username === username && user.password === password);
}


regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    // Check if username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    // Check if user exists and password matches
    if (authenticatedUser(username, password)) {
        // Generate JWT token
        const accessToken = jwt.sign(
            { username: username },
            "fingerprint_customer",
            { expiresIn: '1h' }
        );

        // Return success message with token
        return res.status(200).json({ message: "User logged in successfully", token: accessToken });
    } else {
        return res.status(401).json({ message: "Invalid username or password" });
    }
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.body.review;

    // Check if book exists
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Get username from JWT (set by auth middleware)
    const username = req.user.username;

    // Add or update the review
    books[isbn].reviews[username] = review;

    return res.status(200).json({
        message: `Review for book ${isbn} added/updated successfully`,
        reviews: books[isbn].reviews
    });
});
// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;

    // Check if book exists
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Get username from JWT (set by auth middleware)
    const username = req.user.username;

    // Check if the user has a review
    if (!books[isbn].reviews[username]) {
        return res.status(404).json({ message: "No review by this user for this book" });
    }

    // Delete the user's review
    delete books[isbn].reviews[username];

    return res.status(200).json({
        message: `Review for book ${isbn} deleted successfully`,
        reviews: books[isbn].reviews
    });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
