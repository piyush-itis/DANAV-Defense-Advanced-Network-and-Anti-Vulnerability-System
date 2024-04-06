// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Arrays.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract PasswordManager {
    using Strings for uint256;

    struct UserInfo {
        bytes32 encryptionKey;
        string uniqueId;
    }

    struct Message {
        string senderId;
        string receiverId;
        string content;
    }

    mapping(address => UserInfo) private userInfos;
    Message[] private messages;

    function setEncryptionKey(
        string memory masterPassword,
        string memory uniqueId
    ) public {
        bytes32 hashedMasterPassword = keccak256(
            abi.encodePacked(masterPassword)
        );
        bytes32 privateKey = bytes32(
            uint256(keccak256(abi.encodePacked(msg.sender)))
        );
        bytes32 derivedKey = keccak256(
            abi.encodePacked(hashedMasterPassword, privateKey)
        );

        userInfos[msg.sender] = UserInfo(derivedKey, uniqueId);
    }

    function getEncryptionKey() public view returns (bytes32) {
        return userInfos[msg.sender].encryptionKey;
    }

    function getUniqueId() public view returns (string memory) {
        return userInfos[msg.sender].uniqueId;
    }

    function sendMessage(
        string memory receiverId,
        string memory content
    ) public {
        string memory senderId = userInfos[msg.sender].uniqueId;
        messages.push(Message(senderId, receiverId, content));
    }

    function getMessages(
        string memory uniqueId
    ) public view returns (Message[] memory) {
        uint256 count;
        for (uint256 i = 0; i < messages.length; i++) {
            if (
                keccak256(bytes(messages[i].receiverId)) ==
                keccak256(bytes(uniqueId))
            ) {
                count++;
            }
        }

        Message[] memory userMessages = new Message[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < messages.length; i++) {
            if (
                keccak256(bytes(messages[i].receiverId)) ==
                keccak256(bytes(uniqueId))
            ) {
                userMessages[index] = messages[i];
                index++;
            }
        }

        return userMessages;
    }
}
