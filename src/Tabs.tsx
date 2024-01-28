import { Button } from "@/components/ui/button";
import { DotLoader, HashLoader} from "react-spinners"; 
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// Adders

import { Toaster, toast } from "react-hot-toast";

import { useWeb3ModalProvider, useWeb3ModalAccount } from '@web3modal/ethers5/react'
import { ethers } from 'ethers'
import { useState, useEffect } from "react";
import TopABI from "./components/contractABI"
import StakeABI from "./components/stakeABI"
import uniswapV2RouterABI from "./components/routerABI";

const TopAddress = '0x59D2079c9398b1f9293fC6C2cF1a23364f95eEEC'
const stakingAddress  = '0xa3cbbDc5D4E139DcCF5A8d7e7357750624145341'

// The ERC-20 Contract ABI, which is a common contract interface
// for tokens (this is the Human-Readable ABI format)

export function Stake() {

  const [userBalance, setUserBalance] = useState("");
  const [userStakingBalance, setUserStakingBalance] = useState("");
  const [userReward, setUserReward] = useState("");
  const [stakeAmount, setStakeAmount] = useState("");
  const [unstakeAmount, setUnstakeAmount] = useState("");
  const [BNBWorth, setBNBWorth] = useState("");
  const [isStaking, setIsStaking] = useState(false);
  const [isUnstaking, setIsUnstaking] = useState(false);
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  

  const { address, chainId, isConnected } = useWeb3ModalAccount()
  const { walletProvider } = useWeb3ModalProvider()

  const refetchData = async () => {
    if (isConnected) {
      await getBalance();
      await getRewardBalance();
    }
  };

  async function getBalance() {
    if (!isConnected || !walletProvider) {
      console.error("Wallet is not connected or provider is not available");
      return;
    }

    try{
    const ethersProvider = new ethers.providers.Web3Provider(walletProvider)
    const signer = await ethersProvider.getSigner()
    // The Contract object
    const USDTContract = new ethers.Contract(TopAddress, TopABI, signer)
    const USDTBalance = await USDTContract.balanceOf(address)
    

    const formattedBal = ethers.utils.formatUnits(USDTBalance, 18)
    const roundedBal = parseFloat(formattedBal).toFixed(3)
    setUserBalance(roundedBal)
    console.log("ChainID:", chainId)
    console.log("Rounded Balance:", roundedBal)
    }
    catch (error) {
      console.error("Error fetching balance:", error);
    }
    
  }

  const handleMaxStake = () => {
    setStakeAmount(userBalance); // 
  };

  // Function to handle the Max button for unstaking
  const handleMaxUnstake = () => {
    setUnstakeAmount(userStakingBalance); // 
  };

  async function getRewardBalance() {
    if (!isConnected || !walletProvider) {
      console.error("Wallet is not connected or provider is not available");
      return;
    }

    try{
    const ethersProvider = new ethers.providers.Web3Provider(walletProvider)
    const signer = await ethersProvider.getSigner()
    // The Contract object
    const contract = new ethers.Contract(stakingAddress, StakeABI, signer);
    const stakeBalance = await contract.balanceOf(address)
    const rewardBalance = await contract.calculateReward(address)
    

    const formattedStakeBal = ethers.utils.formatUnits(stakeBalance, 18)
    const roundedBal = parseFloat(formattedStakeBal).toFixed(3)
    const formattedBal = ethers.utils.formatUnits(rewardBalance, 18)

    
    setUserStakingBalance(roundedBal)
    setUserReward(formattedBal)
    console.log("User Reward Balance:", formattedBal)
    }
    catch (error) {
      console.error("Error fetching balance:", error);
    }
    
  }

  //box box -1
  async function getAmountOut() {
    if (!isConnected || !walletProvider) {
      console.error("Wallet is not connected or provider is not available");
      return;
    }

    const uniswapV2RouterAddress = "0x10ED43C718714eb63d5aA57B78B54704E256024E";
    const uniswapTokenAddress = "0x59D2079c9398b1f9293fC6C2cF1a23364f95eEEC";
    const wethTokenAddress = "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c";

    try{
    const ethersProvider = new ethers.providers.Web3Provider(walletProvider)
    const signer = await ethersProvider.getSigner()
    // The Contract object
    const routerContract = new ethers.Contract(uniswapV2RouterAddress, uniswapV2RouterABI, signer);
    // const stakeBalance = await contract.balanceOf(address)
    
    // Define the path and amount
    const buyPath = [wethTokenAddress, uniswapTokenAddress];
    const amountOfTokensToBuy  = ethers.utils.parseUnits(userStakingBalance, 18)
    const amounts = await routerContract.getAmountsIn(amountOfTokensToBuy, buyPath);

    console.log(amounts)
    const wBNBTokenAmount = amounts[0];
    const topTokenAmount = amounts[1];
    
    const FormattedwBNBTokenAmount = ethers.utils.formatUnits(wBNBTokenAmount, 18);
    const FormattedTopTokenAmount = ethers.utils.formatUnits(topTokenAmount, 18);
    
    console.log(
      `For ${FormattedTopTokenAmount} Top tokens you get ${FormattedwBNBTokenAmount} BNB`
    );
    
    setBNBWorth(FormattedwBNBTokenAmount);
    
    }
    catch (error) {
      console.error("Error fetching output amount:", error);
    }
    
  }

  // box box 0.000427271931643376 

  const HandlePremiumEligible = async(): Promise<void>=> {
    if (!isConnected || !walletProvider) {
      console.error("Wallet is not connected or provider is not available");
      return;
    }

    try{
      if (userStakingBalance == "0.000"){
        console.log("No tokens have been staked")
      } else{
        await getAmountOut(); 
        const ethersProvider = new ethers.providers.Web3Provider(walletProvider)
        const signer = await ethersProvider.getSigner()
        // The Contract object
        const contract = new ethers.Contract(stakingAddress, StakeABI, signer);

        const bnbworth = ethers.utils.parseUnits(BNBWorth, "ether") // prod
        // const bnbworth = ethers.utils.parseUnits("4000000000000000000", "ether") // tst
        
        const topTokenAmount  = ethers.utils.parseUnits(userStakingBalance, 18)

        const tx = await contract.checkPremuimEligible(bnbworth, topTokenAmount, address )
        await tx.wait();
        console.log(` Transaction successful with hash: ${tx.hash}`);
        const isPremiumEligible = await contract.IsPremiumEligible(address)
        setIsPremiumUser(isPremiumEligible)
        setBNBWorth("")

        
        console.log("User Premium eligibility:", isPremiumEligible)
        toast.success(`Eligibility Check success`)
      }
    }
    catch (error) {
      console.error("Error fetching balance:", error);
      toast.error("Eligibility Check Error");
    }
    
  }

  // next Box 

  const handleApprove = async (amount: string): Promise<void>=> {
    if (!isConnected || !walletProvider || !address) {
      toast.error("Please connect your wallet");
      console.error("Wallet is not connected or provider is not available");
      return;
    }

    try {
      const ethersProvider = new ethers.providers.Web3Provider(walletProvider);
      const signer = ethersProvider.getSigner();
      const tokenContract = new ethers.Contract(TopAddress, TopABI, signer);
      const spender = stakingAddress;

      const tx = await tokenContract.approve(spender, ethers.utils.parseUnits(amount, 18));
      await tx.wait();

      console.log(`Approve Transaction successful with hash: ${tx.hash}`);
      toast.success(`Tokens successfully Approved`)
    } catch (error) {
      console.error("Approve Transaction failed:", error);
      toast.error("Error Approving tokens");
    }
  };



  const stakeTokens = async () => {
    if (!isConnected || !walletProvider) {
      console.error("Wallet is not connected or provider is not available");
      toast.error("Please connect your wallet");
      return;
    }

    if (!stakeAmount || stakeAmount == "0") {
      console.error("Please enter a stake amount");
      toast.error("Please enter a valid stake amount");
      setStakeAmount("");
      return;
    }
    
    try {

      setIsStaking(true);

      await handleApprove(stakeAmount);
      // Convert the stake amount to the appropriate format (e.g., Wei for Ethereum)
      const formattedAmount = ethers.utils.parseUnits(stakeAmount, 'ether'); // Adjust the unit based on your token

      // Create a new provider and signer
      const provider = new ethers.providers.Web3Provider(walletProvider);
      const signer = provider.getSigner();

      // Create a new instance of the contract
      const contract = new ethers.Contract(stakingAddress, StakeABI, signer);

      // Manually specify the gas limit
      const gasLimit = ethers.BigNumber.from("200000");

      // Call the stake function
      const tx = await contract.stake(formattedAmount, { gasLimit: gasLimit });
      await tx.wait();

      console.log('Stake transaction successful:', tx.hash);
      toast.success(`${stakeAmount} $TOP Tokens was successfully staked!`)
      setStakeAmount("");
      // Additional logic after successful staking

      // await HandlePremiumEligible();

      await refetchData();

    } catch (error) {
      console.error('Error staking tokens:', error);
      toast.error("Error staking tokens");
    } finally {
      setIsStaking(false);
    }
  };


  const UnstakeTokens = async () => {
    if (!isConnected || !walletProvider) {
      console.error("Wallet is not connected or provider is not available");
      toast.error("Please connect your wallet");
      return;
    }

    if (!unstakeAmount || unstakeAmount == "0") {
      console.error("Please enter an unstake amount");
      toast.error("Please enter a valid amount");

      setUnstakeAmount("");
      return;
    }

    try {
      setIsUnstaking(true);
      // Convert the stake amount to the appropriate format (e.g., Wei for Ethereum)
      const formattedAmount = ethers.utils.parseUnits(unstakeAmount, 'ether'); // Adjust the unit based on your token

      // Create a new provider and signer
      const provider = new ethers.providers.Web3Provider(walletProvider);
      const signer = provider.getSigner();

      // Create a new instance of the contract
      const contract = new ethers.Contract(stakingAddress, StakeABI, signer);

      // Manually specify the gas limit
      const gasLimit = ethers.BigNumber.from("200000");

      // Call the withdraw function
      const tx = await contract.withdraw(formattedAmount, { gasLimit: gasLimit });
      await tx.wait();

      console.log('Withdraw transaction successful:', tx.hash);
      toast.success(`${unstakeAmount} $TOP Tokens was successfully Withdrawn!`)
      setUnstakeAmount("");
      // Additional logic after successful Withdrawal
      // await HandlePremiumEligible();

      await refetchData();

    } catch (error) {
      console.error('Error Withdrawing tokens:', error);
      toast.error("Error Withdrawing tokens");
    } finally {
      setIsUnstaking(false);
    }
  };



   // useEffect hook to call getBalance on component mount and whenever dependencies change
  useEffect(() => {
    refetchData();
  }, [isConnected, walletProvider, address]);


  return (
    <div style={{ position: 'relative' }}>
    {!isConnected && (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        Please connect your wallet.
      </div>
    )}

    {isConnected && chainId !== 56 && (
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          opacity: 1,
          color: "black",
          borderRadius: "5%",
          zIndex: 50, // Ensure it's on top of other elements
        }}
      >
        <div>
          <p>You are on the wrong network.</p>
          <p>Please switch to the Binance Smart Chain (Chain ID 56).</p>
        </div>
      </div>
    )}

    <div style={isConnected && chainId !== 56 ? { filter: 'blur(8px)' } : {}}>
    <Tabs defaultValue="account" className="w-[500px]">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="account" className="">
          STAKE
        </TabsTrigger>
        <TabsTrigger value="password">UNSTAKE</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <Card>
          <CardHeader>
            <CardTitle>$TOP Staking! 🚀</CardTitle>
            <CardDescription>
              <div className="mt-2">Stake your $TOP tokens now to earn juicy rewards at 10% APY!</div>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex w-full justify-between space-x-2 font-mono">
              <h1 className="">Your Rewards: {userReward} $TOP</h1>
              <h1>My balance: {userBalance} $TOP</h1>
            </div>
            <div className="border-2 rounded-sm" >Staked $TOP: {userStakingBalance}</div>
            <div className="border-2 rounded-sm">
              Premium Eligible: {isPremiumUser ? 'Yes' : 'No'}
            </div>
            <div className="flex w-full  items-center space-x-1 mt-2 ">

              <Input type="number"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)} placeholder="Amount of $TOP tokens..." />
              <Button onClick={handleMaxStake}>Max</Button>
            </div>
            <div className="space-y-1 flex flex-start font-thin font-mono text-sm">
              <h1 className="mt-2">Stake $100 worth of $TOP to be eligible for premium features on our App!</h1>
              <button className="border-2 rounded-sm hover:bg-blue-500 hover:text-white" onClick={() => HandlePremiumEligible()}>Check Premium</button>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => stakeTokens()}>
            {isStaking ? <HashLoader size={24} /> : "STAKE"}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="password">
        <Card>
          <CardHeader>
            <CardTitle>$TOP Staking! 🚀</CardTitle>
            <CardDescription>
            <div className="mt-2">Stake your $TOP tokens now to earn juicy rewards at 10% APY!</div>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
          <div className="flex w-full justify-between space-x-2 font-mono">
              <h1 className="">Your Rewards: {userReward} $TOP</h1>
              <h1>My balance: {userBalance} $TOP</h1>
              <div className="border-2 rounded-sm">
                Premium Eligible: {isPremiumUser ? 'Yes' : 'No'}
              </div>

            </div>
            <div className="border-2 rounded-sm" >Staked $TOP: {userStakingBalance}</div>
            <div className="flex w-full  items-center space-x-1">
              <Input type="number"
              value={unstakeAmount}
              onChange={(e) => setUnstakeAmount(e.target.value)} placeholder="Withdraw From your Staked $TOP balance." />
              <Button onClick={handleMaxUnstake}>Max</Button>
            </div>
            <div className="space-y-1 flex flex-start font-thin font-mono text-sm">
            <h1 className="mt-2">Stake $100 worth of $TOP to be eligible for premium features on our App!</h1>
            <button className="border-2 rounded-sm hover:bg-blue-500 hover:text-white" onClick={() => HandlePremiumEligible()}>Check Premium</button>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => UnstakeTokens()}>
            {isUnstaking ? <DotLoader size={24} /> : "UNSTAKE"}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
      <Toaster position="top-center" reverseOrder={false} />
    </Tabs>
    </div>
    
  </div>
);

}
