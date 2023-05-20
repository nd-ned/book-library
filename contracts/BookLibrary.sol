// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";


error Unauthorized();

contract BookLibrary is Ownable {
    uint currBookId = 1;

    struct Book {
        uint id;
        string title;
        uint numCopies;
        uint numBorrowed;
        address[] borrowers;
    }

    mapping (uint => Book) public books;
    mapping (uint => address[]) public bookBorrowers;

    function addBook(string memory title, uint numCopies) public onlyOwner {
        Book memory newBook = Book(currBookId, title, numCopies, 0, new address[](0));
        books[currBookId] = newBook;
        currBookId++;
    }

    function borrowBook(uint id) public {
        Book storage book = books[id];
        require(book.id != 0, "This book doesn't exist");
        require(book.numBorrowed < book.numCopies, "There are no available copies of this book");
        require(!hasBorrowed(msg.sender, id), "You have already borrowed this book");

        book.numBorrowed++;
        book.borrowers.push(msg.sender);
        bookBorrowers[id].push(msg.sender);
    }

    function returnBook(uint id) public {
        Book storage book = books[id];
        require(book.id != 0, "This book doesn't exist");
        require(hasBorrowed(msg.sender, id), "You haven't borrowed this book");

        book.numBorrowed--;
        removeBorrower(id, msg.sender);
    }

    // Temporary make the function public for testing
    // function hasBorrowed(address borrower, uint id) private view returns(bool) {
    function hasBorrowed(address borrower, uint id) public view returns(bool) {
        Book storage book = books[id];
        for (uint i = 0; i < book.borrowers.length; i++) {
            if (book.borrowers[i] == borrower) {
                return true;
            }
        }
        return false;
    }

    // Temporary make the function public for testing
    // function removeBorrower(Book storage book, address borrower) private {
    function removeBorrower(uint bookId, address borrower) public {
        Book storage book = books[bookId];
        for (uint i = 0; i < book.borrowers.length; i++) {
            if (book.borrowers[i] == borrower) {
                book.borrowers[i] = book.borrowers[book.borrowers.length - 1];
                book.borrowers.pop();
                return;
            }
        }
    }

    function getBorrowers(uint id) public view returns(address[] memory) {
        return bookBorrowers[id];
    }
}
