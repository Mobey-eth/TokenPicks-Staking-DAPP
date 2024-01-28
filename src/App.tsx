import "./App.css";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "./Header";
import Hero from "./Hero";
import { createWeb3Modal, defaultConfig } from "@web3modal/ethers5/react";

// 1. Get projectId
const projectId = "f93bcfe5f529eef27bcfc86e65722495";

const mainnet = {
  chainId: 1,
  name: "Ethereum",
  currency: "ETH",
  explorerUrl: "https://etherscan.io",
  rpcUrl: "https://cloudflare-eth.com",
};

const BSCmainnet = {
  chainId: 56,
  name: "Binance Smart Chain",
  currency: "BNB",
  explorerUrl: "https://bscscan.com",
  rpcUrl: "https://bsc-dataseed1.binance.org/",
};

const Goerli = {
  chainId: 5,
  name: "Goerli",
  currency: "GoerliETH",
  explorerUrl: "https://goerli.etherscan.io",
  rpcUrl:
    "https://eth-goerli.g.alchemy.com/v2/3j7wnYuMAsIAMh6PPTXfDvPYe_yuYz12",
};

// 3. Create modal
const metadata = {
  name: "TokenPicks",
  description: "TokenPicks Staking Dapp",
  url: "https://token-picks.vercel.app/",
  icons: [
    "data:image/png;base64,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",
  ],
};
// point

createWeb3Modal({
  ethersConfig: defaultConfig({ metadata }),
  chains: [mainnet, BSCmainnet, Goerli],
  projectId,
});

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Header />
      <div className="h-full w-full  flex flex-col items-center mx-auto">
        <Hero />
      </div>
    </ThemeProvider>
  );
}

export default App;
