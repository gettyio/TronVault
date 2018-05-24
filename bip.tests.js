import { generateKeypair } from './src/utils/bipUtil';
import { keccak256 } from 'js-sha3';
import {byteArray2hexStr, hexStr2byteArray} from "./src/utils/crypto/code";
import { SHA256 } from "./src/utils/crypto/crypto";
import { encode58 } from "./src/utils/crypto/base58";
import bip39 from 'bip39';
import randomize from 'randomatic'

const mnemonic0 = '00000000000000000000000000000000';
const mnemonic12 = 'ceiling present easily example nurse silver ecology plug accident decrease special aware';
const mnemonic24 = 'film orange grain sleep champion oil girl topic expect blue expect toast betray method spirit track fabric banana awkward indicate danger clutch axis chicken';
const biptest = (mnemonic, vn) => {
  console.log("Mnemonic (0 words): ", mnemonic)
  const keypair = generateKeypair(mnemonic, vn)
  console.log('Private Key:', keypair.pwd);
  console.log('Password = base64(Private Key): ', keypair.pk);
  console.log('Public Key:', keypair.pubKey);
  let pubKey = keypair.pubKey.slice(2);
  let sha3 = keccak256(hexStr2byteArray(pubKey));
  console.log('sha3 = SHA3(Public Key[1, 65)): ', sha3);
  let address = "A0" +keypair.address
  console.log('Address = A0||sha3[12,32): : ', address);
  let sha256_0 = SHA256(hexStr2byteArray(address));
  console.log('sha256_0 = SHA256(Address): ', byteArray2hexStr(sha256_0));
  let sha256_1 = SHA256(sha256_0);
  console.log('sha256_1 = SHA256(sha256_0): ', byteArray2hexStr(sha256_1));
  let checkSum = byteArray2hexStr(sha256_1).slice(0, 8);
  console.log("checkSum = sha256_1[0, 4): ", checkSum);
  let addchecksum = address + checkSum;
  console.log("addchecksum = address || checkSum: ", addchecksum);
  let base58Address = encode58(hexStr2byteArray(addchecksum));
  console.log("base58Address = Base58(addchecksum): ", base58Address);
  console.log("-----------------------------------------------------------------");

}

//biptest(mnemonic24, 44176716);
const mnemonic = bip39.generateMnemonic(128);
console.log( mnemonic)