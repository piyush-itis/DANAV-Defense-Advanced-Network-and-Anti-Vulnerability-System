"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchingBytesLength = void 0;
/**
 * Compares two byte arrays and returns the count of consecutively matching items from the start.
 *
 * @function
 * @param {Uint8Array} bytes1 - The first Uint8Array to compare.
 * @param {Uint8Array} bytes2 - The second Uint8Array to compare.
 * @returns {number} The count of consecutively matching items from the start.
 */
function matchingBytesLength(bytes1, bytes2) {
    let count = 0;
    // The minimum length of both arrays
    const minLength = Math.min(bytes1.length, bytes2.length);
    for (let i = 0; i < minLength; i++) {
        if (bytes1[i] === bytes2[i]) {
            count++;
        }
        else {
            // Stop counting as soon as a mismatch is found
            break;
        }
    }
    return count;
}
exports.matchingBytesLength = matchingBytesLength;
//# sourceMappingURL=bytes.js.map