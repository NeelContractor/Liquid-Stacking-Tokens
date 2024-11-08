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
exports.sendNativeTokens = exports.burnTokens = exports.mintTokens = exports.TOKEN_DECIMALS = void 0;
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const address_1 = require("./address");
const bs58_1 = __importDefault(require("bs58"));
const connection = new web3_js_1.Connection((0, web3_js_1.clusterApiUrl)("devnet"));
const payer = base58ToKeypair(process.env.PRIVATE_KEY);
const mintAddress = new web3_js_1.PublicKey(address_1.TOKEN_MINT_ADDRESS);
const LST_RATE = 960000000; // 1 SOL = 0.96 HSOL
exports.TOKEN_DECIMALS = 1000000000;
function base58ToKeypair(base58PrivateKey) {
    try {
        const privateKeyBuffer = bs58_1.default.decode(base58PrivateKey);
        return web3_js_1.Keypair.fromSecretKey(privateKeyBuffer);
    }
    catch (_a) {
        throw new Error("Invalid base58 private key");
    }
}
const mintTokens = (fromAddress, toAddress, amount) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("From Address: ", fromAddress);
    console.log("To Address: ", toAddress);
    console.log("Payer's PublicKey: ", payer.publicKey);
    const to = new web3_js_1.PublicKey(toAddress);
    const from = new web3_js_1.PublicKey(fromAddress);
    const amt = LST_RATE * (amount / web3_js_1.LAMPORTS_PER_SOL);
    const associatedAccount = yield (0, spl_token_1.getOrCreateAssociatedTokenAccount)(connection, payer, mintAddress, from);
    console.log("Associated Address: ", associatedAccount.address);
    yield (0, spl_token_1.mintTo)(connection, payer, mintAddress, associatedAccount.address, payer, amt);
    console.log(`Mint ${amt} tokens to ${from}`);
});
exports.mintTokens = mintTokens;
const burnTokens = (fromAddress, toAddress, burnAmount) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Burning tokens");
    const associatedTokenAccount = yield (0, spl_token_1.getAssociatedTokenAddress)(mintAddress, payer.publicKey);
    console.log(`Associated Token Account: ${associatedTokenAccount}`);
    const transaction = new web3_js_1.Transaction().add((0, spl_token_1.createBurnCheckedInstruction)(associatedTokenAccount, mintAddress, payer.publicKey, burnAmount, 9));
    const txnSignature = yield (0, web3_js_1.sendAndConfirmTransaction)(connection, transaction, [payer]);
    console.log(`Burned ${burnAmount} from ${fromAddress}: ${txnSignature}`);
});
exports.burnTokens = burnTokens;
const sendNativeTokens = (fromAddress, toAddress, amount) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log("Sending native tokens");
    const to = new web3_js_1.PublicKey(toAddress);
    const from = new web3_js_1.PublicKey(fromAddress);
    const solAmount = (amount / LST_RATE);
    const transaction = new web3_js_1.Transaction().add(web3_js_1.SystemProgram.transfer({
        fromPubkey: from,
        toPubkey: to,
        lamports: solAmount * web3_js_1.LAMPORTS_PER_SOL
    }));
    const txnSignature = yield (0, web3_js_1.sendAndConfirmTransaction)(connection, transaction, [payer]);
    console.log(`Sent ${solAmount} SOLs to ${to}: ${txnSignature}`);
});
exports.sendNativeTokens = sendNativeTokens;
