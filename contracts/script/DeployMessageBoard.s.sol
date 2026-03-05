// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {MessageBoard} from "../src/MessageBoard.sol";

contract DeployMessageBoard is Script {
    function run() external returns (MessageBoard board) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);
        board = new MessageBoard();
        vm.stopBroadcast();
    }
}
