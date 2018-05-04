import React, { Component, Fragment } from 'react'
import { SafeAreaView, View, Text, Alert, Clipboard, TouchableOpacity, ScrollView } from 'react-native'
import { TabViewAnimated, TabBar, SceneMap } from 'react-native-tab-view'
import Button from 'react-native-micro-animated-button'
import Icon from 'react-native-vector-icons/Feather'
import ActionSheet from 'react-native-actionsheet'
import { observer, inject } from 'mobx-react'
import SInfo from 'react-native-sensitive-info';
import uuid from 'uuid/v4'
import bip39 from 'bip39'
import base64 from 'base-64'
import base64js from 'base64-js'
import crypto from 'crypto-js'
import sha256 from 'crypto-js/sha256';
import { get, sortBy } from 'lodash'
import ErrorMessage from './../components/UI/ErrorMessage'
import SecurityForm from './../components/UI/SecurityForm'
// import DetailTabs from './../components/DetailTab/DetailTabs'
// import { decodeFromXdr, signXdr } from './../utils/xdrUtils';
import { generateKeypair } from './../utils/bipUtil';
import PouchDB from 'pouchdb-react-native'
import SQLite from 'react-native-sqlite-2'
import SQLiteAdapterFactory from 'pouchdb-adapter-react-native-sqlite'
import {
	Screen,
	ContainerFlex, 
	Container, 
	Header, 
	Title, 
	TitleWrapper, 
	LoadButtonWrapper, 
	LoadButton
} from './styled';


const SQLiteAdapter = SQLiteAdapterFactory(SQLite)
PouchDB.plugin(SQLiteAdapter)
const db = new PouchDB('Secrets', { adapter: 'react-native-sqlite' })
const db2 = new PouchDB('Transactions', { adapter: 'react-native-sqlite' })

@inject('appStore') @observer
class TransactionDetail extends Component {

	static navigationOptions = ({ navigation }) => {
		const params = navigation.state.params || {};

		return {
			header: (
				<SafeAreaView style={{ backgroundColor: '#2e3666' }}>
					<Header>
						<TitleWrapper>
							<Title>Transaction Detail</Title>
						</TitleWrapper>
						<LoadButtonWrapper>
							<LoadButton onPress={() => navigation.goBack()}>
								<Icon name="x-circle" color="white" size={32} />
							</LoadButton>
						</LoadButtonWrapper>
					</Header>
				</SafeAreaView>
			)
		};
	};

	state = {
		tabView: {
			index: 0,
			routes: [
				{ key: 'display', title: 'Operation' },
				{ key: 'envelop', title: 'Envelope' },
				{ key: 'signed', title: 'Signed' }
			]
		},
		secrets: [],
		options: [],
		showSecurityForm: false
	}

	componentDidMount() {
		this.loadData();
	}

	loadData = () => {
		try {
			let self = this;
			db.allDocs({
				include_docs: true
			}).then((res) => {
				const options = [];
				const secrets = res.rows;
				secrets.forEach(el => options.push(el.doc.alias));
				self.setState({ secrets, options, isLoadingList: false });
			})
		} catch (error) {
			alert(error.message)
		}
	}

	copyToClipboard = () => {
		const { appStore, navigation } = this.props
		const tx = appStore.get('currentTransaction')
		Clipboard.setString(tx.xdr);
		alert('The signed xdr was copied to the clipboard.');
	}

	handleTabIndexChange = index => {
		this.setState({
			tabView: Object.assign({}, this.state.tabView, {
				index
			})
		})
	}

	signTransaction = () => {
		this.authTransaction();
	}

	authTransaction = () => {
		const { appStore, navigation } = this.props
		const seed = appStore.get('seed')

		const { secrets } = this.state;
		if (!secrets || secrets.length === 0) {
			Alert.alert(
				`You don't have any secret!`,
				`Please, add a new secret on the secrets tab.`,
				[
					{
						text: 'Ok',
						onPress: () => navigation.goBack()
					}
				]
			)
		} else {
			this.actionSheet.show();
		}
	}

	rejectTransaction = () => {
		const { appStore, navigation } = this.props
		const currentTransaction = appStore.get('currentTransaction')
		try {
			db2.put({
				_id: currentTransaction._id,
				...currentTransaction,
				status: 'REJECTED'
			});
			navigation.goBack()
			setTimeout(() => {
				appStore.set('currentTransaction', undefined)
			}, 1000)
		} catch (error) {
			alert(error.message)
		}
	}

	deleteTransaction = async (currentTransaction) => {
		const { appStore, navigation } = this.props
		let ctx;
		try {
			if (currentTransaction) {
				ctx = currentTransaction;
			} else {
				ctx = appStore.get('currentTransaction')
			}
			const res = await db2.remove(ctx);
			navigation.goBack()
			setTimeout(() => {
				appStore.set('currentTransaction', undefined)
			}, 1000)
		} catch (error) {
			alert(error.message);
		}
	}

	showConfirmDelete = tx => {
		Alert.alert(
			`Are you sure you want delete this?`,
			`${tx.memo}`,
			[
				{ text: 'Cancel', onPress: () => { }, style: 'cancel' },
				{
					text: 'Confirm',
					onPress: () => this.deleteTransaction(tx)
				}
			],
			{ cancelable: true }
		)
	}

	submitSignature = index => {
		const { secrets } = this.state;
		const secret = secrets[index]
		this.showConfirmSignatureAlert(secret)
	}

	confirmSignTransaction = secret => {
		// const { appStore, navigation } = this.props
		// try {
		// 	const seed = appStore.get('seed');
		// 	const keypair = generateKeypair(seed, secret.vn);
		// 	const pk = keypair.publicKey;
		// 	const sk = keypair.secret();
		// 	const ctx = appStore.get('currentTransaction')
		// 	const data = {
		// 		type: 'sign',
		// 		sk,
		// 		...ctx,
		// 	}

		// 	const signedTx = signXdr(data)
		// 	this.saveCurrentTransaction(signedTx)
		// 	navigation.goBack()
		// } catch (error) {
		// 	alert(error.message)
		// }
	}

	saveCurrentTransaction = data => {
		const { appStore } = this.props
		const currentTransaction = appStore.get('currentTransaction')
		if (data) {
			if (data.type === 'error') {
				//console.warn('Error: ', data);
				this.saveTransaction({
					xdr: data.xdr,
					createdAt: new Date().toISOString(),
					type: 'error',
					message: data.message,
					status: 'ERROR'
				})
			} else if (data.type === 'sign') {
				this.saveTransaction({
					...currentTransaction,
					...data,
					status: 'SIGNED',
					createdAt: new Date().toISOString()
				})
			} else {
				const tx = parseEnvelopeTree(data.tx)
				this.saveTransaction({
					...tx,
					type: data.type,
					xdr: data.xdr,
					createdAt: new Date().toISOString(),
					status: 'CREATED'
				})
			}
		} else {
			console.warn('Data not found!');
		}
	}

	saveTransaction = async tx => {
		const { appStore } = this.props
		try {
			db2.put({
				_id: uuid(),
				...tx
			});
		} catch (error) {
			alert(error.message)
		}
		appStore.set('currentXdr', undefined)
	}

	showConfirmSignatureAlert = secret => {
		if (secret && secret.doc) {
			Alert.alert(
				`${secret.doc.alias}`,
				`${secret.doc.pk}`,
				[
					{ text: 'Cancel', onPress: () => { }, style: 'cancel' },
					{
						text: 'Confirm',
						onPress: () => this.confirmSignTransaction(secret.doc)
					}
				],
				{ cancelable: true }
			)
		} else {
			this.actionSheet.hide(0);
		}
	}

	render() {
		const { appStore, toggleModal } = this.props
		const { showSecurityForm, options } = this.state
		const currentTransaction = appStore.get('currentTransaction');
		const securityFormError = appStore.get('securityFormError')

		if (currentTransaction && currentTransaction.type === 'error') {
			return (
				<Container>
					<ErrorMessage tx={currentTransaction} />
					<Button
						ref={ref => (this.deleteTransactionButton = ref)}
						foregroundColor={'white'}
						backgroundColor={'#ff3b30'}
						errorColor={'#ff3b30'}
						errorIconColor={'white'}
						successIconColor={'white'}
						onPress={this.deleteTransaction}
						successIconName="check"
						label="Delete"
						maxWidth={100}
						style={{ marginLeft: 16, borderWidth: 0, alignSelf: 'center' }}
					/>
				</Container>
			)
		}

		return (
			<ContainerFlex style={{ backgroundColor: '#d5eef7' }}>
				{!showSecurityForm && (
					<DetailTabs
						currentTransaction={currentTransaction}
						copyToClipboard={this.copyToClipboard}
						showConfirmDelete={this.showConfirmDelete}
						rejectTransaction={this.rejectTransaction}
						signTransaction={this.signTransaction}
					/>
				)}
				{/* {showSecurityForm && (
							<SecurityForm
								error={securityFormError}
								submit={this.authTransaction}
								close={toggleModal}
								closeAfterSubmit={false}
							/>
						)} */}
				{(options && options.length > 0) && (
					<ActionSheet
						ref={o => (this.actionSheet = o)}
						title={'Select a Secret'}
						options={options}
						cancelButtonIndex={1}
						destructiveButtonIndex={2}
						onPress={this.submitSignature}
					/>
				)}
			</ContainerFlex>
		)
	}
}

export default TransactionDetail
