import contract_info from "./contracts/contract_info.json";
import { ethers, BigNumber } from "ethers";
import { useEffect, useState } from "react";
import LARCollection from "./contracts/LARCollection.json";
import { toDecimal, ether } from "./helpers";
import { usePromiseTracker, trackPromise } from "react-promise-tracker";
import { LoadingSpinerComponent } from "./Spinner";
import Loader from "./components/Loader";

function App() {
  const { promiseInProgress } = usePromiseTracker();

  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [properties, setProperties] = useState({});
  const [counter, setCounter] = useState(1);
  const [currentPrice, setCurrentPrice] = useState();
  const [mintingResult, setMintingResult] = useState(null);
  const [mintingError, setMintingError] = useState(null);
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    const connectAccount = async () => {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(accounts[0]);
      }
    };

    const getContract = async () => {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(
          contract_info.address[0],
          LARCollection.abi,
          signer
        );

        setContract(contract);

        try {
          const maxSupply = await contract.maxSupply();
          // const maxPerWallet = await contract.maxPerWallet()
          const price = await contract.cost();
          const maxMintAmount = await contract.maxMintAmount();
          const totalSupply = await contract.totalSupply();

          const properties = {
            maxSupply: maxSupply.toString(),
            price: (price / 10 ** 18).toString(),
            maxMintAmount: maxMintAmount.toString(),
            totalSupply: totalSupply.toString(),
            // maxPerWallet: maxPerWallet.toString()
          };

          setCurrentPrice(Number(price / 10 ** 18).toFixed(3));

          setProperties(properties);
        } catch (err) {
          console.log(err);
        }
      }
    };

    connectAccount();
    getContract();
  }, []);

  const mint = async () => {
    setMintingError(null);
    setMintingResult(null);

    try {
      const mintingResult = await trackPromise(
        contract.mint(account, counter.toString(), {
          value: ether(currentPrice),
        })
      );

      const receipt = await trackPromise(mintingResult.wait(1));

      setMintingResult(mintingResult);
      setReceipt(receipt);

      console.log(mintingResult);
    } catch (err) {
      console.log(err);
      setMintingError(err);
    }
  };

  useEffect(() => {
    setCurrentPrice(counter * Number(properties.price));
  }, [counter]);

  return (
    <div className="flex md:flex-row flex-col bg-yellow-100 h-screen p-4">
      <div className="md:w-5/12">
        <div className="px-4 sm:px-0">
          <h3 className="text-lg font-medium md:text-gray-900 text-yellow-100 leading-6 text-gray-900">
            Show Images here
          </h3>
          <p className="mt-1 text-sm text-gray-600"></p>
        </div>
      </div>
      <div className="md:w-7/12 flex flex-col">
        <div className="flex md:w-8/12 flex-col items-center">
          <h1 className="text-2xl font-bold">Special Sale for Presale</h1>
          <div className="flex justify-between w-full py-3">
            <div className="flex flex-col items-center">
              <p className="font-medium text-xl">Supply</p>
              <p className="text-base font-medium text-gray-600">
                {properties.maxSupply ? (
                  `${Number(properties.maxSupply)}`
                ) : (
                  <Loader />
                )}
              </p>
            </div>
            <div className="flex flex-col items-center">
              <p className="font-medium text-xl">Price</p>
              <p className="text-base font-medium text-gray-600">
                {properties.price ? (
                  `${Number(properties.price)} BNB`
                ) : (
                  <Loader />
                )}
              </p>
            </div>
            <div className="flex flex-col items-center">
              <p className="font-medium text-xl">Max</p>
              <p className="text-base font-medium text-gray-600">
                {properties.price ? "6 per wallet" : <Loader />}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-5 flex flex-col md:mt-0 md:w-8/12">
          <div className="shadow sm:rounded-md sm:overflow-hidden">
            <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
              <h1 className="block text-2xl font-medium text-black">
                LIMITED SALES
              </h1>
              <div className="mt-1 flex border border-yellow-500 justify-between p-3 rounded-md">
                <div className="flex">
                  <button
                    className="px-2 font-medium text-3xl text-gray-600"
                    onClick={() => {
                      setCounter((prevCounter) => {
                        if (prevCounter > 1) {
                          let newCounter = prevCounter - 1;
                          setCounter(newCounter);
                        } else {
                          setCounter(1);
                        }
                      });
                    }}
                  >
                    -
                  </button>
                  <p className="font-medium text-3xl">{counter}</p>
                  <button
                    className="px-2 font-medium text-3xl text-gray-600"
                    onClick={() => {
                      setCounter((prevCounter) => {
                        if (Number(properties.maxMintAmount) > prevCounter) {
                          let newCounter = prevCounter + 1;
                          setCounter(newCounter);
                        } else {
                          setCounter(properties.maxMintAmount);
                        }
                      });
                    }}
                  >
                    +
                  </button>
                </div>
                <button className="p-2 bg-yellow-500 rounded-md font-medium text-white">
                  Set Max
                </button>
              </div>
              <div className="flex p-2 justify-between border border-r-0 border-l-0 border-yellow-500">
                <h1 className="font-bold text-2xl">Total</h1>
                <h1 className="font-medium text-2xl">
                  {properties.price ? (
                    `${toDecimal(currentPrice, 3)} BNB`
                  ) : (
                    <Loader />
                  )}
                </h1>
              </div>
              <div className="item-center">
                <button
                  disabled={promiseInProgress}
                  onClick={mint}
                  className={` text-white text-sm py-2 px-3 rounded-md self-center font-medium ${
                    promiseInProgress ? "bg-yellow-300" : "bg-yellow-500"
                  } `}
                >
                  <LoadingSpinerComponent
                    buttonText="Mint"
                    loadingMessage="Minting in progress"
                  />
                </button>
                <p className="mt-2">
                  {properties.totalSupply && properties.maxSupply ? (
                    `${properties.totalSupply} / ${properties.maxSupply}`
                  ) : (
                    <Loader />
                  )}
                </p>

                {mintingResult?.hash && (
                  <button
                    className="bg-green-600 rounded-md text-white p-2 font-medium mt-2"
                    onClick={() => {
                      window.open(
                        `https://testnet.bscscan.com/tx/${mintingResult.hash}`,
                        "_blank"
                      );
                    }}
                  >
                    View NFT on BSC Scan
                  </button>
                )}

                {mintingError && (
                  <div className="bg-red-400 text-sm p-2 text-white font-medium mt-2 rounded-md">
                    An error occured. Try again
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
