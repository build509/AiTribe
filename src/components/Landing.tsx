"use client"

import {useState} from "react"
import {FONT} from "@/fonts/fonts";
import {useWeb3Modal, useWeb3ModalAccount, useWeb3ModalProvider} from '@web3modal/ethers/react'
// import {BuildWithGaladriel} from "./buildwithgaladriel";
// import Addresses from "./addresses";
import {BrowserProvider, Contract, ethers} from "ethers";
import {Authenticated} from "@/components/authenticated/Authenticated";

// import {ABI} from "@/types/network";


export function Landing() {
  const {open} = useWeb3Modal()
  const {walletProvider} = useWeb3ModalProvider()

  const {address} = useWeb3ModalAccount()

  const [isGameStartLoading, setIsGameStartLoading] = useState<boolean>(false)

  const [gameId, setGameId] = useState<number | undefined>()


  // const onStartGame = async (): Promise<void> => {
  //   if (!address || !walletProvider) {
  //     console.log("Not connected")
  //     return
  //   }
  //   setIsGameStartLoading(true)
  //   const ethersProvider = new BrowserProvider(walletProvider)
  //   const signer = await ethersProvider.getSigner()
  //   const contract = new Contract(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "", ABI, signer)
  //   const tx = await contract.startGame()
  //   const receipt = await tx.wait()
  //   let newGameId
  //   for (const log of receipt.logs) {
  //     try {
  //       const parsedLog = contract.interface.parseLog(log)
  //       if (parsedLog && parsedLog.name === "GameCreated") {
  //         newGameId = ethers.toNumber(parsedLog.args[1])
  //       }
  //     } catch (error) {
  //       // This log might not have been from your contract, or it might be an anonymous log
  //       console.log("Could not parse log:", log);
  //     }
  //   }
  //   if (newGameId !== undefined && !gameId) {
  //     setGameId(newGameId)
  //   }
  //   setIsGameStartLoading(false)
  // }

  return (
    <main className="flex min-h-screen flex-col items-center gap-20 p-2 lg:p-12 justify-between z-2 relative">

      {!address ?
        <>
          <div
            className={"flex flex-col gap-6 text-center text-xl " + FONT.className}
          >
            <div className="text-7xl">
              <div>
                Battle with on-chain AI “VitAIlik”
              </div>
            </div>
            <div className="pt-[100px]">
              <button
                onClick={() => open()}
                className={"p-4 bg-[#00FF66] text-3xl text-black hover:bg-[#00b548] duration-200 " + FONT.className}
              >
                Connect wallet to Battle
              </button>
            </div>
            <div className="text-4xl pt-12">
              To play, visit our <a href="https://discord.gg/4UuffUbkjb" target="_blank"
                                    className="px-2 underline">Discord</a> to get testnet funds
            </div>
          </div>
        </>
        : <Authenticated/>
        // <>
        //   {gameId === undefined ?
        //     <>
        //       <div
        //         className="bg-brand-bluedark p-5 lg:p-10 border-t-2 border-white"
        //       >
        //         <div className="max-w-[1000px]">
        //           <div className="">
        //             <div className={"text-4xl " + FONT.className}>
        //               Ah, brave wanderer, welcome to my realm!
        //             </div>
        //             <div className={"p-2 pt-6"}>
        //               <div>
        //                 <VoicePlayer/>
        //               </div>
        //               <img
        //                 className="w-full h-auto md:float-right md:w-1/3 md:pl-2"
        //                 src="/vitailik.png"
        //                 alt="pixels"
        //               />
        //               <div className="md:w-2/3">
        //                 <div className="my-5">
        //                   I am VitAIlik, your AI foe and guardian of the Web3 galaxy!
        //                 </div>
        //                 <div className="my-5">
        //                   Your goal: drain my 10,000 HP before I deplete yours. Triumph, and your remaining HP boosts
        //                   your score on the scoreboard.
        //                 </div>
        //                 <div className="my-5">
        //                   Choose from four actions each turn but beware, every move is a double-edged sword. Choose
        //                   wisely, for each action you take will influence the tide of battle, affecting both our HPs.
        //                   Remember, in this arena, every move can lead to victory or defeat and every attack you
        //                   unleash comes with its own risks.
        //                 </div>
        //                 <div className="my-5">
        //                   The crowd roars in anticipation. Ready your arms, brave challenger. Let the battle begin!
        //                 </div>
        //               </div>
        //               <div className="text-center pt-6">
        //                 <button
        //                   onClick={() => {
        //                     if (!isGameStartLoading) {
        //                       onStartGame()
        //                     }
        //                   }}
        //                   className={"pl-12 pr-12 p-4 bg-[#00FF66] text-3xl text-black hover:bg-[#00b548] duration-200 " + FONT.className}
        //                 >
        //                   {isGameStartLoading ? "Loading" : "GO!"}
        //                 </button>
        //               </div>
        //             </div>
        //           </div>
        //         </div>
        //       </div>
        //     </>
        //     :
        //     <>
        //       <div className={"text-7xl text-center " + FONT.className}>
        //         <div>
        //           Battle with on-chain AI “VitAIlik”
        //         </div>
        //         <MusicPlayer/>
        //       </div>
        //       <div
        //         className="flex flex-col grow gap-4 max-w-8xl w-full relative place-items-center h-full">
        //
        //         {gameId !== undefined &&
        //           <RunExplorer
        //             gameId={gameId}
        //             connectedAccount={address}
        //           />
        //         }
        //       </div>
        //     </>
        //   }
        // </>
      }


      <div
        className={"flex w-full flex-col lg:flex-row lg:justify-between items-end text-xl p-4 lg:p-0"}>
        {/*<Addresses/>*/}
        {/*<BuildWithGaladriel/>*/}
      </div>
    </main>
  )
}
