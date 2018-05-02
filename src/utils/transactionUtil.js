// import HttpClient from "@tronprotocol/wallet-api/src/client/http";
// import { passwordToAddress } from "@tronprotocol/wallet-api/src/utils/crypto";

// const Client = new HttpClient();


// const initialParams = {
//     key: '',
//     to: '',
//     token: '',
//     amount: 0
// };

// const initialOption = {
//     address: '',
//     alias: 'Not valid',
//     balance: '0',
//     name: 'Not Valid',
//     pwd: ''
// };

// export const ROOT_URL = 'https://tronscan.org/';
// export const RECEIVE_URL = 'https://tronscan.org//#/send?to=';

// export const Send = async (params = initialParams) => {
//     const { key, token, to, amount } = params;
//     try {
//         const sendStatus = await Client.send(key, token, to, amount * 1000000);
//         return sendStatus;
//     }
//     catch (error) {
//         console.log("Not sent with error", error);
//         throw new Error("Something wrong while making the transaction", error);
//     }
// }

// export const GetBalances = async (address = '') => {
//     try {
//         const balances = await Client.getAccountBalances(address);
//         if (balances && balances.length) {
//             return balances.map(bl => ({ address, ...bl }));
//         } else {
//             throw new Error("Empty wallet or doesn't exist");
//         }
//     } catch (error) {
//         throw new Error("Something wrong while getting the balances", error);
//     }
//     // await Client.getAccountBalances(passwordToAddress(password)).catch(err => console.log("Error at getAccountBalances"))
//     // await Client.getAccountBalances(address).catch(err => console.log("Error at getAccountBalances"))
// }
