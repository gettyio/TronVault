import { signTransaction, decode58Check } from "@tronprotocol/wallet-api/src/utils/crypto";
const { Block, Transaction, Account } = require("@tronprotocol/wallet-api/src/protocol/core/Tron_pb");
const google_protobuf_any_pb = require('google-protobuf/google/protobuf/any_pb.js');

const hexStr2byteArray = require("@tronprotocol/wallet-api/src/lib/code").hexStr2byteArray;
const stringToBytes = require("@tronprotocol/wallet-api/src/lib/code").stringToBytes;
const {base64DecodeFromString, byteArray2hexStr, bytesToString} = require("@tronprotocol/wallet-api/src/utils/bytes");

const {
  TransferContract,
  TransferAssetContract,
  AccountUpdateContract,
  VoteWitnessContract,
  ParticipateAssetIssueContract} = require("@tronprotocol/wallet-api/src/protocol/core/Contract_pb");

//const Client = new HttpClient();
//export const getTransactionDetail = (data) => Client.getTransactionDetails(data);

function buildTransferContract(message, contractType, typeName) {
  var anyValue = new google_protobuf_any_pb.Any();
  anyValue.pack(message.serializeBinary(), "protocol." + typeName);

  var contract = new Transaction.Contract();
  contract.setType(contractType);
  contract.setParameter(anyValue);

  var raw = new Transaction.raw();
  raw.addContract(contract);
  raw.setTimestamp(new Date().getTime() * 1000000);

  var transaction = new Transaction();
  transaction.setRawData(raw);

  return transaction;
}

export const buildTransferTransaction = (token, from, to, amount) =>{

  if (token.toUpperCase() === 'TRX') {

    let transferContract = new TransferContract();
    transferContract.setToAddress(Uint8Array.from(decode58Check(to)));
    transferContract.setOwnerAddress(Uint8Array.from(decode58Check(from)));
    transferContract.setAmount(amount);

    return buildTransferContract(
      transferContract,
      Transaction.Contract.ContractType.TRANSFERCONTRACT,
			"TransferContract"
		);
  } else {

    let transferContract = new TransferAssetContract();
    transferContract.setToAddress(Uint8Array.from(decode58Check(to)));
    transferContract.setOwnerAddress(Uint8Array.from(decode58Check(from)));
    transferContract.setAmount(amount);
    transferContract.setAssetName(token);

    return buildTransferContract(
      transferContract,
      Transaction.Contract.ContractType.TRANSFERASSETCONTRACT,
			"TransferAssetContract"
		);
  }
}

export const signDataTransaction = async (privatekey, { token, from, to, amount }) => {
		const transaction = buildTransferTransaction(token, from, to, amount);
		let transactionSigned = signTransaction(hexStr2byteArray(privatekey), transaction);
    let transactionBytes = transactionSigned.serializeBinary();
		let transactionString = byteArray2hexStr(transactionBytes);
    return transactionString;
}
