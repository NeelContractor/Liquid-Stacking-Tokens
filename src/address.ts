import { PublicKey } from "@solana/web3.js";

export const PRIVATE_KEY = process.env.PRIVATE_KEY;
export const PUBLIC_KEY = process.env.PUBLIC_KEY;

export const TOKEN_MINT_ADDRESS = new PublicKey(process.env.TOKEN_MINT_ADDRESS!);