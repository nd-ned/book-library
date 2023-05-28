import { ethers } from "hardhat"
import { expect } from "chai"
import { BookLibrary } from "../typechain-types/contracts/BookLibrary"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"

describe("BookLibrary", function () {
  let bookLibrary: BookLibrary
  let owner: SignerWithAddress
  let borrower1: SignerWithAddress
  let borrower2: SignerWithAddress

  before(async function () {
    const BookLibrary = await ethers.getContractFactory("BookLibrary")
    ;[owner, borrower1, borrower2] = await ethers.getSigners()
    bookLibrary = await BookLibrary.deploy()

    await bookLibrary.deployed()
  })

  it("Should add a book", async function () {
    const title = "Book 1"
    const numCopies = 2

    await bookLibrary.connect(owner).addBook(title, numCopies)

    const book = await bookLibrary.books(1)

    expect(book.id).to.equal(1)
    expect(book.title).to.equal(title)
    expect(book.numCopies).to.equal(numCopies)
    expect(book.numBorrowed).to.equal(0)
  })

  it("Should borrow a book", async function () {
    const bookId = 1

    await bookLibrary.connect(borrower1).borrowBook(bookId)

    const book = await bookLibrary.books(bookId)
    expect(book.numBorrowed).to.equal(1)
    expect(await bookLibrary.getBorrowers(bookId)).to.deep.equal([
      borrower1.address,
    ])
  })

  it("Should not allow non-owners to add books", async function () {
    const title = "Book 2"
    const numCopies = 2

    await expect(
      bookLibrary.connect(borrower1).addBook(title, numCopies)
    ).to.be.revertedWith("Ownable: caller is not the owner")
  })

  it("Should not allow borrowing the same book twice", async function () {
    const bookId = 1

    await expect(
      bookLibrary.connect(borrower1).borrowBook(bookId)
    ).to.be.revertedWith("You have already borrowed this book")
  })

  it("Should not allow borrowing more copies than available", async function () {
    const bookId = 1

    await bookLibrary.connect(borrower2).borrowBook(bookId)

    await expect(
      bookLibrary.connect(borrower2).borrowBook(bookId)
    ).to.be.revertedWith("There are no available copies of this book")
  })

  it("Should not allow borrowing non-existent books", async function () {
    const bookId = 2

    await expect(
      bookLibrary.connect(borrower2).borrowBook(bookId)
    ).to.be.revertedWith("This book doesn't exist")
  })

  it("Should not return a non-existent book", async function () {
    const bookId = 2

    await expect(
      bookLibrary.connect(borrower2).returnBook(bookId)
    ).to.be.revertedWith("This book doesn't exist")
  })

  it("Should return a borrowed book", async function () {
    const bookId = 1

    const returnedBookTx = await bookLibrary
      .connect(borrower1)
      .returnBook(bookId)

    await returnedBookTx.wait(1)
    await ethers.provider.waitForTransaction(returnedBookTx.hash)
  })

  it("Should not allow returning a book that hasn't been borrowed", async function () {
    const bookId = 1

    await expect(
      bookLibrary.connect(borrower1).returnBook(bookId)
    ).to.be.revertedWith("You haven't borrowed this book")
  })
})
