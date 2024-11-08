"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const express_1 = __importDefault(require("express"));
const mintTokens_1 = require("./mintTokens");
const address_1 = require("./address");
const web3_js_1 = require("@solana/web3.js");
const utils_1 = require("./utils");
const app = (0, express_1.default)();
app.use(express_1.default.json());
const connection = new web3_js_1.Connection("https://api.devnet.solana.com/", "confirmed");
app.post('/helius', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("req:", req.body);
    // Check if req.body or req.body.description is missing
    if (!req.body || !req.body.description) {
        res.json({ message: "Invalid request body" });
        return;
    }
    const description = req.body.description.split(" ");
    const type = description[3];
    const recieverAccount = description[5];
    let fromAddress, toAddress, amount;
    if (type === "SOL") {
        fromAddress = req.body.nativeTransfers[0].fromUserAccount;
        toAddress = req.body.nativeTransfers[0].toUserAccount;
        amount = req.body.nativeTransfers[0].amount;
        if (toAddress != address_1.PUBLIC_KEY) {
            res.json({
                message: "Another event happened"
            });
        }
    }
    else if (type == address_1.TOKEN_MINT_ADDRESS) {
        fromAddress = req.body.tokenTransfers[0].fromUserAccount;
        toAddress = req.body.tokenTransfers[0].toUserAccount;
        amount = req.body.tokenTransfers[0].tokenAmount;
    }
    else {
        res.json({
            message: "Invalid token sent"
        });
    }
    if (type === "SOL") {
        yield (0, mintTokens_1.mintTokens)(fromAddress, toAddress, amount);
    }
    else if (type == address_1.TOKEN_MINT_ADDRESS) {
        // What could go wrong here?
        const tokenAmount = (0, utils_1.convertToTokenDecimalUnit)(amount);
        console.log("token amount log: ", tokenAmount);
        yield (0, mintTokens_1.burnTokens)(fromAddress, toAddress, amount);
        yield (0, mintTokens_1.sendNativeTokens)(fromAddress, toAddress, amount);
    }
    res.send('Transaction successful');
}));
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
