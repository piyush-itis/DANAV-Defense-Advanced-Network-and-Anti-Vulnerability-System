// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ArmyEncryptionKeyContract {
    bytes32 public encryptionKey;
    string public easyToRememberKey;
    string public masterPassword;

    function createEncryptionKeys(
        bytes32 defenseMinisterKey,
        bytes32 armyCommissarKey,
        bytes32 navyHeadKey,
        bytes32 airForceHeadKey,
        string memory newGeneralName
    ) public {
        require(
            bytes(newGeneralName).length > 0,
            "General name must not be empty"
        );

        bytes memory combinedKey = abi.encodePacked(
            defenseMinisterKey,
            armyCommissarKey,
            navyHeadKey,
            airForceHeadKey,
            newGeneralName
        );
        encryptionKey = keccak256(combinedKey);

        easyToRememberKey = generateEasyKey(encryptionKey);

        // Encode the master password as hexadecimal bytes
        bytes memory masterPasswordBytes = abi.encodePacked(
            easyToRememberKey,
            encryptionKey
        );

        // Convert hexadecimal bytes to a string
        masterPassword = bytesToHexString(masterPasswordBytes);
    }

    function generateEasyKey(
        bytes32 key
    ) internal pure returns (string memory) {
        bytes memory keyBytes = abi.encodePacked(key);
        require(keyBytes.length > 0, "Key must not be empty");

        bytes memory easyKey = new bytes(10);
        uint256 numChars = 0;

        for (uint256 i = 0; i < keyBytes.length; i++) {
            if (
                (keyBytes[i] >= bytes1("0") && keyBytes[i] <= bytes1("9")) || // Numbers
                (keyBytes[i] >= bytes1("A") && keyBytes[i] <= bytes1("Z")) || // Uppercase letters
                (keyBytes[i] >= bytes1("a") && keyBytes[i] <= bytes1("z")) || // Lowercase letters
                (keyBytes[i] >= bytes1("!") && keyBytes[i] <= bytes1("/")) || // Special characters
                (keyBytes[i] >= bytes1(":") && keyBytes[i] <= bytes1("@")) || // Special characters
                (keyBytes[i] >= bytes1("[") && keyBytes[i] <= bytes1("`")) || // Special characters
                (keyBytes[i] >= bytes1("{") && keyBytes[i] <= bytes1("~")) // Special characters
            ) {
                easyKey[numChars++] = keyBytes[i];
            }

            if (numChars >= 10) {
                break; // Stop if we reach 10 characters
            }
        }

        if (numChars < 10) {
            // If input is too short, fill remaining slots with a default character
            for (uint256 j = numChars; j < 10; j++) {
                easyKey[j] = bytes1("0");
            }
        }

        return string(easyKey);
    }

    function bytesToHexString(
        bytes memory input
    ) internal pure returns (string memory) {
        bytes memory output = new bytes(2 * input.length);
        for (uint256 i = 0; i < input.length; i++) {
            uint8 value = uint8(input[i]);
            output[2 * i] = toHexChar(value / 16);
            output[2 * i + 1] = toHexChar(value % 16);
        }
        return string(output);
    }

    function toHexChar(uint8 value) internal pure returns (bytes1) {
        return
            value < 10
                ? bytes1(uint8(bytes1("0")) + value)
                : bytes1(uint8(bytes1("a")) + value - 10);
    }
}
