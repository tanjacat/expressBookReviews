const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


// Register a new user
public_users.post("/register", (req, res) => {
    // Get username and password from request body
    const { username, password } = req.body;

    // Check if username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    // Check if the username already exists
    if (users.find(user => user.username === username)) {
        return res.status(409).json({ message: "Username already exists" });
    }

    // Add the new user to the users array
    users.push({ username: username, password: password });

    // Return success message
    return res.status(201).json({ message: "User registered successfully" });
});


public_users.get('/', async function (req, res) {
    try {
        const allBooks = await new Promise((resolve, reject) => {
            resolve(books);
        });
        return res.status(200).json(allBooks);
    } catch (err) {
        return res.status(500).json({ message: "Error fetching books" });
    }
});




// Get book details based on ISBN using async/await + Axios
public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;

    try {
        // Create a promise to fetch the book by ISBN
        const bookDetails = await new Promise((resolve, reject) => {
            if (books[isbn]) {
                resolve(books[isbn]); // Resolve with book details if found
            } else {
                reject("Book not found"); // Reject if book does not exist
            }
        });

        // Send the book details as JSON
        return res.status(200).json(bookDetails);
    } catch (error) {
        // If promise is rejected, return 404 with error message
        return res.status(404).json({ message: error });
    }
});


  
// Get book details based on Author using async/await + Axios
public_users.get('/author/:author', async function (req, res) {
    const authorName = req.params.author.toLowerCase();

    try {
        // Create a promise to fetch books by author
        const booksByAuthor = await new Promise((resolve, reject) => {
            let results = [];

            // Iterate over all books and collect matches
            for (let isbn in books) {
                if (books[isbn].author.toLowerCase() === authorName) {
                    results.push({ isbn: isbn, ...books[isbn] });
                }
            }

            // Check if any books were found
            if (results.length > 0) {
                resolve(results); // Resolve with array of books
            } else {
                reject("No books found for this author"); // Reject if none found
            }
        });

        // Send matching books as JSON
        return res.status(200).json(booksByAuthor);
    } catch (error) {
        // Handle promise rejection
        return res.status(404).json({ message: error });
    }
});


// Get book details based on title (async/await)
public_users.get('/title/:title', async function (req, res) {
    const titleName = req.params.title.toLowerCase();

    try {
        const booksByTitle = await new Promise((resolve, reject) => {
            let results = [];
            for (let isbn in books) {
                if (books[isbn].title.toLowerCase() === titleName) {
                    results.push({ isbn: isbn, ...books[isbn] });
                }
            }
            resolve(results);
        });

        if (booksByTitle.length === 0) {
            return res.status(404).json({ message: "No books found with this title" });
        }

        return res.status(200).json(booksByTitle);
    } catch (err) {
        return res.status(500).json({ message: "Error fetching books by title" });
    }
});



// Get book reviews based on ISBN
public_users.get('/review/:isbn', function (req, res) {
    // Get ISBN from request parameters
    const isbn = req.params.isbn;

    // Check if the book exists
    if (books[isbn]) {
        // Return the reviews object
        return res.status(200).json(books[isbn].reviews);
    } else {
        // If book not found, return 404
        return res.status(404).json({ message: "Book not found" });
    }
});


module.exports.general = public_users;
