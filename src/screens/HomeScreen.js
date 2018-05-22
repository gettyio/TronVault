import 'babel-polyfill';
import React, { Component } from 'react'
import {
	Platform,
	StyleSheet,
	View,
	Text,
	Clipboard,
	Keyboard,
	StatusBar,
	WebView,
	ActivityIndicator,
	Linking,
	AsyncStorage,
	KeyboardAvoidingView,
	SafeAreaView
} from 'react-native'
import qs from 'qs'
import uuid from 'uuid/v4'
import { get, sortBy } from 'lodash'
import base64 from 'base-64'
import base64js from 'base64-js'
import sha256 from 'crypto-js/sha256';
import { observer, inject } from 'mobx-react'
import Icon from 'react-native-vector-icons/Feather'
import moment from 'moment'
import Modal from 'react-native-modal'
import SInfo from 'react-native-sensitive-info';
import Button from 'react-native-micro-animated-button'
import TransactionForm from '../components/Transaction/TransactionForm'
// import TransactionDetail from '../components/TransactionDetail'
import PasteButton from '../components/UI/PasteButton'
import TransactionList from '../components/Transaction/TransactionList'
import {
	Screen,
	Container,
	Header,
	Title,
	LoadButton,
	TextInput,
	CloseButton,
	TitleWrapper,
	LoadButtonWrapper
} from './styled'
//import { decodeFromXdr, signXdr } from './../utils/xdrUtils';
//import parseEnvelopeTree from './../utils/parseEnvelopeTree'
import crypto from 'crypto-js'
import PouchDB from 'pouchdb-react-native'
import SQLite from 'react-native-sqlite-2'
import SQLiteAdapterFactory from 'pouchdb-adapter-react-native-sqlite'

const SQLiteAdapter = PouchDB.plugin(SQLiteAdapterFactory(SQLite))
PouchDB.plugin(require('pouchdb-upsert'))
const db = new PouchDB('Transactions', { adapter: 'react-native-sqlite' })

@inject('appStore') @observer
class HomeScreen extends Component {
	static navigationOptions = ({ navigation }) => {
		const params = navigation.state.params || {};

		return {
			header: (
				<SafeAreaView style={{ backgroundColor: '#2e3666' }}>
					<Header>
						<TitleWrapper>
							<Title>Contracts</Title>
						</TitleWrapper>
						<LoadButtonWrapper>
							<LoadButton onPress={params.toggleAddModal}>
								<Icon name="plus-circle" color="white" size={32} />
							</LoadButton>
						</LoadButtonWrapper>
					</Header>
				</SafeAreaView>
			)
		};
	};


	state = {
		transactions: [],
		isLoadingList: true,
		currentXdr: undefined,
		currentTransaction: undefined,
		currentDecodedTx: undefined
	}

	componentWillMount() {
		this.props.navigation.setParams({ toggleAddModal: this.toggleAddModal });
	}

	componentDidMount() {
		this.loadTransactions();
	}

	componentDidUpdate(prevProps, prevState) {
		this.handleCurrentTx();
		// this.loadTransactions();

	}
	shouldComponentUpdate(prevProps, prevState) {
		const { transactions } = prevState;
		return this.loadTransactions(transactions);
	}

	loadTransactions = async (prevTx = []) => {
		const self = this;
		try {
			const res = await db.allDocs({ include_docs: true });
			const rawTransactions = res.rows.map((item, index) => item.doc);
			const transactions = sortBy(rawTransactions, 'createdAt').reverse()
			if (transactions.length != prevTx.length) {
				self.setState({ transactions });
				return true;
			}
			return false;
		} catch (error) {
			console.log(error);
			return false;

		} finally {
			self.setState({ isLoadingList: false });
		}
	}

	handleCurrentTx = () => {
		const { appStore } = this.props
		const currentXdr = appStore.get('currentXdr')
		if (currentXdr) {
			this.decodeXdr(currentXdr)
		}
	}

	sendToViewer = () => {
		// Todo: remove mock data
		const url = `stellar-signer://stellar-signer?${qs.stringify({
			type: 'decode', xdr: 'AAAAAFIBKYc47PZpoxxY5Acltd9IaRANeap3Ja+FZg9fVtSBAAAAZABu6EUAAAACAAAAAAAAAAAAAAABAAAAAAAAAAEAAAAAr+SzF6CyMZracAojHWYWqhzdJZW+OiI9csaw1Nl4EZMAAAAAAAAAAAX14QAAAAAAAAAAAA=='
		})}`;

		Linking.canOpenURL(url)
			.then(supported => {
				if (!supported) {
					console.log("Can't handle url: " + url)
				} else {
					return Linking.openURL(url)
				}
			})
			.catch(err => console.error('An error occurred', err))
	}

	toggleDetailModal = () => {
		const { appStore } = this.props
		appStore.set('isDetailModalVisible', !appStore.get('isDetailModalVisible'))
	}

	toggleAddModal = () => {
		const { appStore } = this.props
		//appStore.set('isAddModalVisible', !appStore.get('isAddModalVisible'))
		this.props.navigation.navigate('QRCodeReader');
	}

	decodeXdr = xdr => {
		// const event = JSON.stringify({ type: 'decode', xdr: xdr })
		///const decodedTx = decodeFromXdr(xdr, 'TransactionEnvelope');
		//this.saveCurrentTransaction(decodedTx);
	}

	saveCurrentTransaction = data => {
		// const { appStore } = this.props
		// const currentTransaction = appStore.get('currentTransaction')
		// if (data) {
		// 	if (data.type === 'error') {
		// 		//console.warn('Error: ', data);
		// 		this.saveTransaction({
		// 			xdr: data.xdr,
		// 			createdAt: new Date().toISOString(),
		// 			type: 'error',
		// 			message: data.message,
		// 			status: 'ERROR'
		// 		})
		// 	} else if (data.type === 'sign') {
		// 		this.saveTransaction({
		// 			...currentTransaction,
		// 			...data,
		// 			status: 'SIGNED',
		// 			createdAt: new Date().toISOString()
		// 		})
		// 	} else {
		// 		const tx = parseEnvelopeTree(data.tx)
		// 		this.saveTransaction({
		// 			...tx,
		// 			type: data.type,
		// 			xdr: data.xdr,
		// 			createdAt: new Date().toISOString(),
		// 			status: 'CREATED'
		// 		});
		// 	}
		// } else {
		// 	console.warn('Data not found!');
		// }
	}

	saveTransaction = async tx => {
		const { appStore } = this.props
		try {
			db.put({
				_id: uuid(),
				...tx
			});
			this.loadTransactions();
		} catch (error) {
			alert(error.message)
		}
		appStore.set('currentXdr', undefined)
	}

	cancelTransaction = () => {
		const { appStore } = this.props
		const currentTransaction = appStore.get('currentTransaction')
		try {
			db.put({
				_id: currentTransaction._id,
				...currentTransaction,
				status: 'REJECTED'
			});
			this.loadTransactions();
			this.toggleDetailModal()
			appStore.set('currentTransaction', undefined)
		} catch (error) {
			alert(error.message)
		}
	}

	deleteTransaction = async (doc) => {
		try {
			const res = await db.remove(doc);
			this.loadTransactions();
		} catch (error) {
			alert(error.message);
		}
	}

	render() {
		const { appStore, navigation } = this.props
		const { transactions, isLoadingList } = this.state;
		const isAddModalVisible = appStore.get('isAddModalVisible')
		const isDetailModalVisible = appStore.get('isDetailModalVisible')
		const currentTransaction = appStore.get('currentTransaction')

		return (
			<Screen>
				<TransactionList transactions={transactions} isLoadingList={isLoadingList} />
				<StatusBar barStyle="light-content" />
			</Screen>
		)
	}
}

export default HomeScreen
