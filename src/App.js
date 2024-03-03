import React, { useEffect, useState } from "react";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import "./App.css";
import * as BooksAPI from "./BooksAPI";
import Book from "./components/Book";
import Header from "./components/Header";
import Shelves from "./components/Shelves";

const BooksApp = () => {
  const [books, setBooks] = useState([]);
  const [searchBooks, setSearchBooks] = useState([]);
  const [query, setQuery] = useState("");
  const [mergedBooks, setMergedBooks] = useState([]);
  const [mapOfIdToBooks, setMapOfIdToBooks] = useState(new Map());

  // useEffect to handle get all books api
  useEffect(() => {
    BooksAPI.getAll().then((data) => {
      setBooks(data);
      setMapOfIdToBooks(createMapOfBook(data));
    });
  });

  // useEffect to handle search Api
  useEffect(() => {
    let isActive = true;
    if (query) {
      BooksAPI.search(query).then((data) => {
        if (data.error) {
          setSearchBooks([]);
        } else {
          if (isActive) {
            setSearchBooks(data);
          }
        }
      });
    }
    return () => {
      isActive = false;
      setSearchBooks([]);
    };
  }, [query]);

  useEffect(() => {
    const combined = searchBooks.map((book) => {
      if (mapOfIdToBooks.has(book.id)) {
        return mapOfIdToBooks.get(book.id);
      } else {
        return book;
      }
    });
    setMergedBooks(combined);
  }, [searchBooks, mapOfIdToBooks]);

  // Update Book Shelf Function
  const updateBookShelf = (book, whereTo) => {
    const updateBooks = books.map((b) => {
      if (b.id === book.id) {
        book.shelf = whereTo;
        return book;
      }
      return b;
    });
    setBooks(updateBooks);
    BooksAPI.update(book, whereTo);
  };

  const createMapOfBook = (books) => {
    const map = new Map();
    books.map((book) => map.set(book.id, book));
    return map;
  };

  return (
    <div className="app">
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <div className="list-books">
                <Header />
                <div className="list-books-content">
                  <Shelves books={books} updateBookShelf={updateBookShelf} />
                </div>
                <div className="open-search">
                  <Link to="/search">
                    <button>Add a book</button>
                  </Link>
                </div>
              </div>
            }
          ></Route>
          <Route
            path="/search"
            element={
              <div className="search-books">
                <div className="search-books-bar">
                  <Link className="close-search" to="/">
                    Close
                  </Link>
                  <div className="search-books-input-wrapper">
                    <input
                      type="text"
                      placeholder="Search by title or author"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="search-books-results">
                  <ol className="books-grid">
                    {mergedBooks.map((b) => (
                      <li key={b.id}>
                        <Book book={b} changeBookShelf={updateBookShelf} />
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            }
          ></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default BooksApp;
