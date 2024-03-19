import {useWeb3ModalAccount, useWeb3ModalProvider} from "@web3modal/ethers/react";
import {BrowserProvider} from "ethers";

export const Authenticated = () => {
  const {walletProvider} = useWeb3ModalProvider()
  const {address} = useWeb3ModalAccount()


  const onMint = async (): Promise<void> => {
    console.log("onMint")

    if (!walletProvider) return
    const ethersProvider = new BrowserProvider(walletProvider)
    const signer = await ethersProvider.getSigner()
  }

  return <div>
    <button
      className="border-2 px-5 py-2 border-white hover:bg-white hover:text-black duration-150"
      onClick={onMint}
    >
      Mint
    </button>
  </div>
}