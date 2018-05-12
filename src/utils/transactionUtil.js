import HttpClient from "@tronprotocol/wallet-api/src/client/http";


const Client = new HttpClient();

export const getTransactionDetail = (data) => Client.getTransactionDetails(data);

export const signDataTransaction = async (privatekey, data) => {
    const transactionString = await Client.signTransaction(privatekey, data);
    return transactionString;
}