import { useWeb3ModalAccount, useWeb3ModalProvider } from "@web3modal/ethers/react";
import { BrowserProvider, Contract, ethers, TransactionReceipt, getAddress, id } from "ethers";
import ContentEditable from "react-contenteditable";
import { useCallback, useEffect, useRef, useState } from "react";
import { FONT_BOLD } from "@/fonts/fonts";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { Gallery, Nft } from "@/components/Gallery";
import { ABI } from "@/types/network";

const HTML_REGULAR =
  /<(?!img|table|\/table|thead|\/thead|tbody|\/tbody|tr|\/tr|td|\/td|th|\/th|br|\/br).*?>/gi

export const Authenticated = () => {
  const { walletProvider } = useWeb3ModalProvider();
  const { address, chainId } = useWeb3ModalAccount();

  const textAreaRef = useRef<HTMLElement>(null);
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [isMintingLoading, setIsMintingLoading] = useState(false);

  const [_, setUserNftsCount] = useState<number>(0);
  const userNfts = useRef<Nft[]>([]);

  const [otherNfts, setOtherNfts] = useState<Nft[]>([]);

  const [isUserNftsLoading, setIsUserNftsLoading] = useState<boolean>(false);
  const [isOtherNftsLoading, setIsOtherNftsLoading] = useState<boolean>(false);
  const [tweets, setTweets] = useState<{ link: string }[]>([]); // Store tweets

  useEffect(() => {
    console.log("Updated tweets:", tweets);
  }, [tweets]);

  useEffect(() => {
    getUserNfts();
    getOtherNfts();
  }, [chainId]);

  const getUserNfts = async () => {
    if (!walletProvider || !address) return;
    setIsUserNftsLoading(true);
    const ethersProvider = new BrowserProvider(walletProvider);
    const signer = await ethersProvider.getSigner();
    const contract = new Contract(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "", ABI, signer);
    let indexedUserNfts: Nft[] = [];
    for (let i = 0; i < 5; i++) {
      if ((userNfts.current || []).length > 5) break;
      try {
        const token = await contract.tokenOfOwnerByIndex(address, i);
        if (token !== undefined) {
          const tokenUri = await contract.tokenURI(token);
          console.log("Token URI:", tokenUri);
          if (tokenUri) indexedUserNfts = [{ tokenUri }, ...indexedUserNfts];
        }
      } catch (e) {
        break;
      }
    }
    userNfts.current = [...userNfts.current, ...indexedUserNfts];
    setUserNftsCount(userNfts.current.length);
    setIsUserNftsLoading(false);
  };

  const getOtherNfts = async () => {
    if (!walletProvider || !address) return;
    setIsOtherNftsLoading(true);
    const ethersProvider = new BrowserProvider(walletProvider);
    const signer = await ethersProvider.getSigner();
    const contract = new Contract(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "", ABI, signer);
    let indexedNfts: Nft[] = [];
    try {
      const totalSupply = await contract.totalSupply();
      if (!totalSupply) return;
      for (let i = Number(totalSupply) - 1; i >= 0; i--) {
        if (indexedNfts.length > 5 || otherNfts.length > 5) break;
        try {
          const tokenUri = await contract.tokenURI(i);
          if (tokenUri) indexedNfts = [...indexedNfts, { tokenUri }];
        } catch (e) {
          break;
        }
      }
      setOtherNfts(indexedNfts);
    } catch (e) {
    }

    setIsOtherNftsLoading(false);
  };

  const onMint = useCallback(
    async (e: any) => {
      const input = (textAreaRef.current?.innerHTML?.replace(HTML_REGULAR, '') || '')
        .replace(/(<br\s*\/?>\s*)+$/, '');
      if (!walletProvider || !input) return;

      setIsLoading(true);
      setIsMintingLoading(true);

      try {
        const ethersProvider = new BrowserProvider(walletProvider);
        const signer = await ethersProvider.getSigner();
        const contract = new Contract(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "", ABI, signer);

        // Send the minting transaction
        const tx = await contract.initializeMint(input);
        const receipt = await tx.wait();
        setMessage("");

        // Parse the tokenId from the receipt logs
        const tokenId = getNftId(receipt, contract);
        console.log('Minted Token ID:', tokenId);  // Debugging

        if (tokenId !== undefined) {
          const tokenUri = await pollTokenUri(contract, tokenId);
          console.log("Token URI:", tokenUri);  // Debugging

          if (tokenUri) {
            userNfts.current = [
              { tokenUri, txHash: receipt.hash },
              ...userNfts.current,
            ];
            setUserNftsCount(userNfts.current.length);

            const message = `A new NFT was minted! Check it out: ${tokenUri} #memecoin #cryptomemes #NewCoin #FairLaunch`;
            console.log("Constructed tweet message:", message);  // Debugging

            const response = await fetch('/api/postTweet', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                imageUrl: tokenUri,  // Send the image URL for the media upload
                message: `A new NFT was minted! Check it out: ${tokenUri} #memecoin #cryptomemes #NewCoin #FairLaunch`,  // Send the tweet message
              }),
            });

            const result = await response.json();
            if (!response.ok) {
              console.error('Failed to post tweet:', result.error || 'Unknown error');
            } else if (result.success) {
              console.log('Tweet posted successfully:', result);
              const tweetText = result?.tweet?.data?.text;
              console.log(tweetText);

              setTweets((prevTweets) => {
                console.log("Previous tweets:", prevTweets);
                console.log("New tweet link:", tweetText);
                return [...prevTweets, { link: tweetText }];
              });
            } else {
              console.error('Failed to post tweet:', result.error);
            }
          } else {
            console.error("Failed to retrieve token URI");
          }
        }
      } catch (error) {
        console.error('Error during minting:', error);  // Error logging
      } finally {
        setIsLoading(false);
        setIsMintingLoading(false);
      }
    },
    [walletProvider, isLoading]
  );

  const getNftId = (receipt: TransactionReceipt, contract: Contract): number | undefined => {
    let nftId
    for (const log of receipt.logs) {
      try {
        const parsedLog = contract.interface.parseLog(log)
        if (parsedLog && parsedLog.name === "MintInputCreated") {
          // Second event argument
          nftId = ethers.toNumber(parsedLog.args[1])
        }
      } catch (error) {
        // This log might not have been from your contract, or it might be an anonymous log
        console.log("Could not parse log:", log)
      }
    }
    return nftId;
  }
  const pollTokenUri = async (contract: Contract, tokenId: number): Promise<string | undefined> => {
    // max amount of time to wait
    for (let i = 0; i < 120; i++) {
      try {
        const uri = await contract.tokenURI(tokenId);
        if (uri) return uri;
      } catch (e) {
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  const handleKeypress = useCallback(
    (e: any) => {
      if (e.keyCode == 13 && !e.shiftKey) {
        onMint(e);
        e.preventDefault();
      }
    },
    [onMint]
  );

  return <div className="w-full px-2 md:px-20 flex flex-col gap-16 text-textGray">
    <div>
      <div className="pb-4">
        Describe your image
      </div>
      <div className="flex flex-row">
        <div
          className="rt-TextAreaRoot rt-r-size-1 rt-variant-surface flex-1 chat-textarea bg-white text-black rounded-lg border border-gray-300"
        >
          <ContentEditable
            innerRef={textAreaRef}
            style={{
              minHeight: "50px",
              maxHeight: "200px",
              overflowY: "auto",
              fontSize: "18px",
              paddingTop: "13px",
              paddingBottom: "13px",
            }}
            className="rt-TextAreaInput text-base focus:outline-none flex px-2 "
            html={message}
            disabled={isLoading}
            onChange={(e) => {
              setMessage(e.target.value.replace(HTML_REGULAR, ''))
            }}
            onKeyDown={(e) => {
              handleKeypress(e)
            }}
          />
          <div className="rt-TextAreaChrome"></div>
        </div>
        <button
          className={"flex flex-row items-center gap-2 px-5 py-2 hover:bg-[#FFFF99] hover:text-black duration-150  text-black bg-[#EEDFFF] text-4xl rounded-lg " + FONT_BOLD.className}
          onClick={onMint}
        >

          {isLoading && <AiOutlineLoading3Quarters className="animate-spin size-4" />}
          Generate
        </button>
      </div>
    </div>

    <div>
      <div className="text-xl">My NFTs</div>
      <Gallery
        isMintingLoading={isMintingLoading}
        isLoading={isUserNftsLoading}
        nfts={userNfts.current}
        type={"user"}
      />
    </div>
    <div>
      <div className="text-xl mb-4">My Tweets</div>
      {tweets.length === 0 ? (
        <p className="text-gray-500">Your tweet will appear here once posted.</p>
      ) : (
        <div>
          <p>{tweets[0]?.link}</p> {/* Display the tweet text */}
        </div>
      )}
    </div>

    <div>
      <div className="text-xl">Exlore New Mints</div>

      <Gallery
        isMintingLoading={false}
        isLoading={isOtherNftsLoading}
        nfts={otherNfts}
        type={"other"}
      />
    </div>

  </div >
}
