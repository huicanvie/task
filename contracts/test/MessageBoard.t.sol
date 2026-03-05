// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {MessageBoard} from "../src/MessageBoard.sol";

contract MessageBoardTest is Test {
    MessageBoard internal board;

    address internal alice = address(0xA11CE);
    address internal bob = address(0xB0B);

    event MessagePosted(address indexed author, uint256 indexed index, string content, uint256 timestamp);

    function setUp() public {
        board = new MessageBoard();
    }

    function test_PostMessage_StoresMessageAndIncrementsCount() public {
        vm.prank(alice);
        board.postMessage("hello world");

        uint256 count = board.getMessageCount();
        assertEq(count, 1);

        (address author, string memory content, uint256 timestamp) = board.getMessage(0);
        assertEq(author, alice);
        assertEq(content, "hello world");
        assertGt(timestamp, 0);
    }

    function test_PostMessage_MultipleMessages_KeepOrder() public {
        vm.prank(alice);
        board.postMessage("first");

        vm.prank(bob);
        board.postMessage("second");

        assertEq(board.getMessageCount(), 2);

        (address author0, string memory content0,) = board.getMessage(0);
        (address author1, string memory content1,) = board.getMessage(1);

        assertEq(author0, alice);
        assertEq(content0, "first");
        assertEq(author1, bob);
        assertEq(content1, "second");
    }

    function test_PostMessage_EmptyMessage_Reverts() public {
        vm.prank(alice);
        vm.expectRevert("Message cannot be empty");
        board.postMessage("");
    }

    function test_GetMessage_IndexOutOfBounds_Reverts() public {
        vm.expectRevert("Index out of bounds");
        board.getMessage(0);
    }

    function test_PostMessage_EmitsEvent() public {
        vm.expectEmit(true, true, true, true);
        emit MessagePosted(alice, 0, "event-check", block.timestamp);

        vm.prank(alice);
        board.postMessage("event-check");
    }
}
