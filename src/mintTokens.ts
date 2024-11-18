import { createBurnCheckedInstruction, getAssociatedTokenAddress, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import { clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction } from "@solana/web3.js";
import { PRIVATE_KEY, TOKEN_MINT_ADDRESS } from "./address";
import bs58 from "bs58";

const connection = new Connection(clusterApiUrl("devnet"));
const payer = base58ToKeypair(process.env.PRIVATE_KEY!);
const mintAddress = new PublicKey(TOKEN_MINT_ADDRESS);
const LST_RATE = 960000000; // 1 SOL = 0.96 HSOL
export const TOKEN_DECIMALS = 1000000000;

function base58ToKeypair(base58PrivateKey: string): Keypair {
    try {
        const privateKeyBuffer =  bs58.decode(base58PrivateKey);
        return Keypair.fromSecretKey(privateKeyBuffer);
    } catch {
        throw new Error("Invalid base58 private key");
    }
}

export const mintTokens = async (fromAddress: string, toAddress: string, amount: number) => {
    console.log("From Address: ", fromAddress);
    console.log("To Address: ", toAddress);
    console.log("Payer's PublicKey: ", payer.publicKey);
    const to = new PublicKey(toAddress);
    const from = new PublicKey(fromAddress);
    const amt = LST_RATE*(amount/LAMPORTS_PER_SOL); 

    const associatedAccount = await getOrCreateAssociatedTokenAccount(connection, payer, mintAddress, from);
    console.log("Associated Address: ",associatedAccount.address);
    await mintTo(connection, payer, mintAddress, associatedAccount.address, payer, amt);
    console.log(`Mint ${amt} tokens to ${from}`);
}

export const burnTokens = async (fromAddress: string, toAddress: string, burnAmount: number) => {
    try {
        console.log("Burning tokens");
        const associatedTokenAccount = await getAssociatedTokenAddress(mintAddress, payer.publicKey);
        console.log(`Associated Token Account: ${associatedTokenAccount}`);
        const transaction = new Transaction().add(
            createBurnCheckedInstruction(
                associatedTokenAccount,
                mintAddress,
                payer.publicKey,
                burnAmount * LAMPORTS_PER_SOL,
                9
            )
        );
    
        const txnSignature = await sendAndConfirmTransaction(connection, transaction, [payer]);
        console.log(`Burned ${burnAmount} from ${fromAddress}: ${txnSignature}`);
    } catch (error) {
        console.error("Error burning tokens:", error);
        throw error;
    }
}

export const sendNativeTokens = async (fromAddress: string, toAddress: string, amount: number) => {
    try {
        console.log("Sending native tokens");
        const from = new PublicKey(toAddress);
        console.log("from: ", from);
        const to = new PublicKey(fromAddress);
        console.log("to: ", to);
        const solAmount = amount / LST_RATE;
        const lamports = (solAmount * LAMPORTS_PER_SOL);

        if (lamports < 1) {
            console.warn("Amount too small to send. Please sent atleast 1 SOL. Skipping transfer.");
            return;
        }

        console.log("Sol amount to send:", solAmount);
        console.log("Lamports to send:", lamports);


        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: from,
                toPubkey: to,
                lamports
            })
        );
        const txnSignature = await sendAndConfirmTransaction(connection, transaction, [payer]);
        console.log(`Sent ${amount} SOLs to ${to}: ${txnSignature}`);
    } catch (error) {
        console.error("Error sending native tokens:", error);
        throw error;
    }
}