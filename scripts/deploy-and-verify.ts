import { ethers } from "hardhat"

export async function main() {
  const wallet = new ethers.Wallet(
    process.env.ACCOUNT_PRIVATE_KEY as string,
    ethers.provider
  )
  await hre.run('print', { message: `Deploying BookLibrary contract with account: ${wallet.address}` })

  const Book_Library_Factory = await ethers.getContractFactory("BookLibrary")
  const bookLibrary = await Book_Library_Factory.connect(wallet).deploy()

  await bookLibrary.deployed()
  await hre.run('print', { message: `The BookLibrary contract is deployed to ${bookLibrary.address}` })

  const owner = await bookLibrary.owner()

  await hre.run('print', { message: `The BookLibrary contract owner is ${owner}` })
  await hre.run('print', { message: "Waiting for 10 confirmations..." })
  await bookLibrary.deployTransaction.wait(10)

  await hre.run('print', { message: "Verifying contract on Etherscan..." })
  await hre.run("verify:verify", {
    address: bookLibrary.address,
    constructorArguments: [],
  })
  await hre.run('print', { message: "Done!" })
}
