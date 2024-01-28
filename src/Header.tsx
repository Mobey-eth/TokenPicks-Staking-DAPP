// import { Link } from "react-router-dom";
import ConnectWallet from "./components/ConnectWallet";
import { ModeToggle } from "./components/mode-toggle";

function Header() {
  return (
    <div className="w-full border-b py-4 px-10">
      <div className="flex items-center justify-between ">
        <h1 className="font-medium text-2xl font-mono">TokenPicks</h1>
        <div className="flex flex-row space-x-6">
          <ConnectWallet />
          <ModeToggle />
        </div>
      </div>
    </div>
  );
}

export default Header;
