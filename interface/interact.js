const { ethers } = require("ethers")

const BookLibrary = require("../artifacts/contracts/BookLibrary.sol/BookLibrary.json")

const main = async function ({ network, contractAddress }) {
  let provider

  if (network === "localhost") {
    provider = new ethers.providers.JsonRpcProvider("http://localhost:8545")
  } else if (network === "mumbai") {
    if (!process.env.MUMBAI_RPC_URL) {
      throw new Error(".env MUMBAI_RPC_URL is not defined")
    }

    provider = ethers.providers.InfuraProvider(
      "mumbai",
      process.env.MUMBAI_RPC_URL
    )
  } else {
    throw new Error("Invalid network")
  }

  const wallet = new ethers.Wallet(process.env.ACCOUNT_PRIVATE_KEY, provider)

  const balance = await provider.getBalance(wallet.address)

  console.log(ethers.utils.formatEther(balance, { commify: true }))

  const contract = new ethers.Contract(contractAddress, BookLibrary.abi, wallet)

  global.contract = contract
  global.wallet = wallet

  console.log("Creates a book")
  const book1tx = await contract.addBook("Book 1", 5)
  await book1tx.wait()

  const book2tx = await contract.addBook("Book 2", 10)
  await book2tx.wait()

  console.log("Checks all available books")
  const bookCount = await contract.currBookId()
  for (let i = 1; i <= bookCount; i++) {
    const book = await contract.books(i)
    console.log(
      `Book ID: ${book.id}, Title: ${book.title}, Copies: ${book.numCopies}, Borrowed: ${book.numBorrowed}`
    )
  }

  console.log("Rents a book")
  try {
    const rentTx = await contract.borrowBook(1)
    await rentTx.wait()
  } catch (e) {
    console.log(e)
  }

  console.log("Checks that it is rented")
  const book = await contract.books(1)
  console.log(
    `Book ID: ${book.id}, Title: ${book.title}, Copies: ${book.numCopies}, Borrowed: ${book.numBorrowed}`
  )

  console.log("Returns the book")
  const returnTx = await contract.returnBook(1)
  await returnTx.wait()

  console.log("Checks the availability of the book")
  const book2 = await contract.books(1)
  console.log(
    `Book ID: ${book2.id}, Title: ${book2.title}, Copies: ${book2.numCopies}, Borrowed: ${book2.numBorrowed}`
  )
}

module.exports = { main }
