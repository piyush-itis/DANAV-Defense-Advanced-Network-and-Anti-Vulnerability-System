"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EthashConsensus = exports.CliqueConsensus = exports.CasperConsensus = void 0;
const casper_js_1 = require("./casper.js");
Object.defineProperty(exports, "CasperConsensus", { enumerable: true, get: function () { return casper_js_1.CasperConsensus; } });
const clique_js_1 = require("./clique.js");
Object.defineProperty(exports, "CliqueConsensus", { enumerable: true, get: function () { return clique_js_1.CliqueConsensus; } });
const ethash_js_1 = require("./ethash.js");
Object.defineProperty(exports, "EthashConsensus", { enumerable: true, get: function () { return ethash_js_1.EthashConsensus; } });
//# sourceMappingURL=index.js.map