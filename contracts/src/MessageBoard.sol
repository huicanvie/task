// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract MessageBoard {
    struct Message {
        address author;
        string content;
        uint256 timestamp;
    }

    Message[] private messages;

    event MessagePosted(address indexed author, uint256 indexed index, string content, uint256 timestamp);

    function postMessage(string calldata content) external {
        require(bytes(content).length > 0, "Message cannot be empty");
        messages.push(Message({author: msg.sender, content: content, timestamp: block.timestamp}));
        emit MessagePosted(msg.sender, messages.length - 1, content, block.timestamp);
    }

    function getMessageCount() external view returns (uint256) {
        return messages.length;
    }

    function getMessage(uint256 index)
        external
        view
        returns (address author, string memory content, uint256 timestamp)
    {
        require(index < messages.length, "Index out of bounds");
        Message storage message = messages[index];
        return (message.author, message.content, message.timestamp);
    }
}
