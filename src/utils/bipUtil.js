import bip39 from 'bip39'
import base64 from 'base-64'
import base64js from 'base64-js'
import cryptojs from 'crypto-js'
import sha256 from 'crypto-js/sha256'
import cryptocore from 'crypto-js/core'
import randomize from 'randomatic'
import createHmac from 'create-hmac'
import { isNaN } from 'lodash';
import { keccak256 } from 'js-sha3';
import { encode58 } from "./crypto/base58";
import { genPriKey, getAddressFromPriKey, SHA256 } from "./crypto/crypto";
import { base64DecodeFromString, base64EncodeToString, byteArray2hexStr, hexStr2byteArray } from "./crypto/code";

const Buffer = require('buffer/').Buffer

export const getMasterKeyFromSeed = (seed) => {
	const ED25519_CURVE = 'secp256k1 seed';
	const hmac = createHmac('sha512', seed);
	const I = hmac.update(Buffer.from(seed, 'hex')).digest();
	const IL = I.slice(0, 32);
	const IR = I.slice(32);
	return {
		key: IL,
		chainCode: IR,
	};
};

export const CKDPriv = ({ key, chainCode }, index) => {
	const indexBuffer = Buffer.allocUnsafe(4);
	indexBuffer.writeUInt32BE(index, 0);

	const data = Buffer.concat([Buffer.alloc(1, 0), key, indexBuffer]);

	const I = createHmac('sha512', chainCode)
		.update(data)
		.digest();
	const IL = I.slice(0, 32);
	const IR = I.slice(32);
	return {
		key: IL,
		chainCode: IR,
	};
}

export const replaceDerive = (val) => val.replace("'", '')

export const isValidPath = (path) => {
	const pathRegex = new RegExp("^m(\\/[0-9]+')+$");
	if (!pathRegex.test(path)) {
		return false;
	}
	return !path
		.split('/')
		.slice(1)
		.map(replaceDerive)
		.some(isNaN); /* ts T_T*/
};

export const derivePath = (path, seed) => {
	const HARDENED_OFFSET = 0x80000000;

	if (!isValidPath(path)) {
		throw new Error('Invalid derivation path');
	}

	const { key, chainCode } = getMasterKeyFromSeed(seed);
	const segments = path
		.split('/')
		.slice(1)
		.map(replaceDerive)
		.map(el => parseInt(el, 10));

	return segments.reduce(
		(parentKeys, segment) => CKDPriv(parentKeys, segment + HARDENED_OFFSET),
		{ key, chainCode },
	);
};


export const generatePath = (seed, vn) => {
	const seedHex = bip39.mnemonicToSeedHex(seed);
	const derivationPath = `m/44'/195'/${vn || 0}'`;
	//console.log("BIP39 Seed: ", seedHex);
	//console.log("BIP39 Path: ", derivationPath);
	return derivePath(derivationPath, seedHex);
}

export const generateKeypair = (mnemonic, vn) => {
	const EC = require('elliptic').ec;
	let path = generatePath(mnemonic, vn);
	let ec = new EC('secp256k1');
	const key = ec.genKeyPair({
		entropy: path.key
	});
	let priKey = key.getPrivate();
	let X = key.getPublic().getX().toString("hex");
	let Y = key.getPublic().getY().toString("hex");
  while (X.length < 64) {
    X = "0" + X;
  }
  while (Y.length < 64) {
    Y = "0" + Y;
  }
  let pubKey = "04" + X + Y;
	let priKeyHex = priKey.toString('hex');
	while (priKeyHex.length < 64) {
		priKeyHex = "0" + priKeyHex;
	}
	let priKeyBytes = hexStr2byteArray(priKeyHex);

	let addressBytes = getAddressFromPriKey(priKeyBytes);
	let address = byteArray2hexStr(addressBytes);
	let pwd = base64EncodeToString(priKeyBytes);
	let privateKey = byteArray2hexStr(priKeyBytes);

	return { address, pwd, privateKey, pubKey}
}

export const generateTronKeypair = (mnemonic, vn) => {
  const keypair = generateKeypair(mnemonic, vn)
  let pubKey = keypair.pubKey.slice(2);
  let sha3 = keccak256(hexStr2byteArray(pubKey));
  let address = "41" +keypair.address
  let sha256_0 = SHA256(hexStr2byteArray(address));
  let sha256_1 = SHA256(sha256_0);
  let checkSum = byteArray2hexStr(sha256_1).slice(0, 8);
  let addchecksum = address + checkSum;
  let base58Address = encode58(hexStr2byteArray(addchecksum));

  return { base58Address, address: keypair.address, pubKey: keypair.pubKey, pwd: keypair.pwd, privateKey: keypair.privateKey }
}
