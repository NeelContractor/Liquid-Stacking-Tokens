import { TOKEN_DECIMALS } from "./mintTokens"

export function convertToTokenDecimalUnit(amount: number) {
    const res = amount * TOKEN_DECIMALS;
    console.log(res);
    return res;
}