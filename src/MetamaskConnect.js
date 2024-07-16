import React, { useState, useEffect } from "react";
import Web3 from "web3";
import detectEthereumProvider from "@metamask/detect-provider";
import contractDetail from "./contracts/contract.json";

const charityAddress = "0xfBfaB4ccC0Ae887D2ff7F1617Ee89eAD6fFfF92C";
const MetaMaskConnect = () => {
  const [account, setAccount] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [totalFund, setTotalFund] = useState(null);
  const [totalFundUser, setTotalFundUser] = useState(null);

  const [amount, setAmount] = useState(0);

  useEffect(() => {
    const connectMetaMask = async () => {
      const provider = await detectEthereumProvider();
      if (provider) {
        const web3Instance = new Web3(provider);
        setWeb3(web3Instance);

        const accounts = await provider.request({
          method: "eth_requestAccounts",
        });
        setAccount(accounts[0]);

        const contractInstance = new web3Instance.eth.Contract(
          contractDetail.ABI,
          contractDetail.contract
        );
        setContract(contractInstance);

        provider.on("accountsChanged", (accounts) => {
          setAccount(accounts[0]);

        });

        if (contractInstance) {
          handleGetData(contractInstance);
          handleGetDataUSer(contractInstance,accounts[0])

        }

        provider.on("chainChanged", () => {
          window.location.reload();
        });
      } else {
        console.log("Please install MetaMask!", web3);
      }
    };

    connectMetaMask();
  }, []);

  const handleSetData = async () => {
    if (amount) {
      let amt18 = parseFloat(amount) * 10 ** 18;

      await contract.methods
        .transferFunds(charityAddress)
        .send({ from: account, value: amt18 });
    } else {
      console.log("------------------Enter amount pls");
    }
  };

  const handleGetData = async (instance) => {
    let data = await instance.methods.getTotalCollectedFund().call();

    data = parseInt(data) / 10 ** 18;

    setTotalFund(data);

  };

  const handleGetDataUSer = async (instance,acc) => {

    let dataUSer = acc ? await instance.methods.getTotalDunatedByUser(acc).call() : "0";

    dataUSer =dataUSer ? parseFloat(dataUSer) / 10 ** 18 :"0"

    setTotalFundUser(dataUSer);
  };

  return (
    <div>
      {account ? (
        <form>
          <div className="container">
            <h1>Charity DApp</h1>
            <p> Connected account: {account}</p>
            <p>Recipient : U-Topia</p>
            <p> Address :{charityAddress}</p>
            <hr />
            {totalFund && <p>TotalFund Donated : {totalFund}</p>}
            {totalFundUser && (
              <p>Total Fund Donated By User: {totalFundUser}</p>
            )}

            <label htmlFor="amount">
              <b>Enter donation amount in (ETH) : </b>
            </label>
            <input
              type="text"
              placeholder="Enter Amount"
              name="amount"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
              }}
              id="amount"
            />
            <hr />

            <button
              type="submit"
              className="registerbtn"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSetData();
              }}
            >
              Donate
            </button>
          </div>

          {}
        </form>
      ) : (
        <button
          onClick={() =>
            window.ethereum.request({ method: "eth_requestAccounts" })
          }
        >
          Connect MetaMask
        </button>
      )}
    </div>
  );
};

export default MetaMaskConnect;
