// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";

error Unauthorized();

contract BookLibrary is Ownable {
    uint currBookId = 1;

    struct Book {
        uint id;
        string title;
        uint numCopies;
        uint numBorrowed;
    }

    mapping (uint => Book) public books;
    mapping (uint => address[]) public bookBorrowers;
    mapping (uint => mapping (address => bool)) private borrowerMapping;

    function addBook(string memory title, uint numCopies) public onlyOwner {
        Book memory newBook = Book(currBookId, title, numCopies, 0);
        books[currBookId] = newBook;
        currBookId++;
    }

    function borrowBook(uint id) public {
        Book storage book = books[id];
        require(book.id != 0, "This book doesn't exist");
        require(book.numBorrowed < book.numCopies, "There are no available copies of this book");
        require(!borrowerMapping[id][msg.sender], "You have already borrowed this book");

        book.numBorrowed++;
        bookBorrowers[id].push(msg.sender);
        borrowerMapping[id][msg.sender] = true;
    }

    function returnBook(uint id) public {
        Book storage book = books[id];
        require(book.id != 0, "This book doesn't exist");
        require(borrowerMapping[id][msg.sender], "You haven't borrowed this book");

        book.numBorrowed--;
        borrowerMapping[id][msg.sender] = false;
    }

    function getBorrowers(uint id) public view returns(address[] memory) {
        return bookBorrowers[id];
    }
}
