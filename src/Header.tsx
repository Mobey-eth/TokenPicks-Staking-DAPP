// import { Link } from "react-router-dom";
import ConnectWallet from "./components/ConnectWallet";
import { ModeToggle } from "./components/mode-toggle";
import tokenpicks from "./assets/tokenpicks.png"

function Header() {
  return (
    <div className="w-full border-b py-4 px-10">
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <img src={tokenpicks} alt="TokenPicks Logo" className="h-8 mr-2" /> {/* Adjust size with h-8 as needed */}
        <h1 className="font-medium text-2xl font-mono">
          Token<span className="text-blue-500">Picks</span>
        </h1>
      </div>
      <div className="flex flex-row space-x-6">
        <ConnectWallet />
        <ModeToggle />
      </div>
    </div>
  </div>
  );
}

export default Header;
