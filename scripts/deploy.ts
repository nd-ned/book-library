import { ethers } from "hardhat"

export async function main() {
  const BookLibrary = await ethers.getContractFactory("BookLibrary")
  const bookLibrary = await BookLibrary.deploy()

  await bookLibrary.deployed()

  console.log("BookLibrary deployed to:", bookLibrary.address)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
