import ProgressBar from "@/components/ProgressBar";

interface Props {
  isMintingLoading: boolean
  isLoading: boolean
  // Need tokenIds and stuff?
  nfts: string[]
  type: "user" | "other"
}

export const Gallery = ({isMintingLoading, isLoading, nfts, type}: Props) => {

  return <div className="w-full py-6">
    {isLoading ?
      <div>Loading...</div>
      :
      <div className="flex flex-col md:flex-row gap-10 items-center">
        {isMintingLoading &&
          <div
            className="md:basis-1/5 square relative"
          >
            <MintLoading/>
          </div>
        }
        {(nfts || []).slice(0, isMintingLoading ? 4 : 5).map((nft, i) =>
          <div
            key={`nft_${type}_${i}`}
            className="basis-1/5"
          >
            <img
              src={nft}
              alt={`nft_${type}_${i}`}
            />
          </div>
        )}
        {(!(nfts || []).length && !isMintingLoading) && <div>No NFTs yet</div>}
      </div>
    }
  </div>
}

const MintLoading = () => {
  return <div className="square-content bg-[#B6B6B6] flex flex-col justify-end text-sm text-black">
    <div className="p-2">
      Generating & minting image...
    </div>
    <ProgressBar duration={10}/>
  </div>
}