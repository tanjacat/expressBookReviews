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


public_users.get('/', (req, res) => {
    // async callback function
    (async function fetchBooks() {
      try {
        const allBooks = await Promise.resolve(books);
        res.status(200).json(allBooks);
      } catch (err) {
        res.status(500).json({ message: "Error fetching books" });
      }
    })();
  });
  




  public_users.get('/isbn/:isbn', (req, res) => {
    const isbn = req.params.isbn;
  
    new Promise((resolve, reject) => {
      if (books[isbn]) {
        resolve(books[isbn]);
      } else {
        reject({ message: "Book not found" });
      }
    })
      .then((book) => res.status(200).json(book))
      .catch((err) => res.status(404).json(err));
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
