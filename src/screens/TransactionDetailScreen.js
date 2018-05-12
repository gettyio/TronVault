import React, { Component, Fragment } from 'react'
import { SafeAreaView, View, Text, Alert, Clipboard, TouchableOpacity, ScrollView, Linking, Picker } from 'react-native'
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
// import ErrorMessage from '../components/shared/ErrorMessage'
// import SecurityForm from '../components/shared/SecurityForm'
// import DetailTabs from '../components/detailtabs/DetailTabs'
import { generateTronKeypair } from './../utils/bipUtil';
import { signDataTransaction } from "../utils/transactionUtil";
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
import { consolidateStreamedStyles } from 'styled-components';


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
		secretSelected: null,
		showSecurityForm: false,
		loadingSign: false,
	}

	componentDidMount() {
		this.loadData();
	}

	loadData = () => {
		const { appStore } = this.props;
		const currentTransaction = appStore.get('currentTransaction');
		const pkFromQR = currentTransaction.pk;
		try {
			let self = this;
			db.allDocs({
				include_docs: true
			}).then((res) => {
				const options = [];
				const secrets = res.rows;
				secrets.forEach(el => options.push(el.doc.alias));
				let secretFromQR = null;
				if (secrets.length) {
					secretFromQR = secrets.find(el => el.doc.pk === pkFromQR);
				}
				const seed = appStore.get('seed');
				// console.log("secretformqr", secretFromQR);
				// console.log("keypair", keypair);
				self.setState({ secrets, secretSelected: secretFromQR, options, isLoadingList: false });
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

		const { secrets, options } = this.state;
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
		const { secrets, secretSelected } = this.state;
		const secret = secrets[index]

		//Mudei aqui
		this.showConfirmSignatureAlert(secretSelected)
	}


	confirmSignTransaction = async secret => {
		this.setState({ loadingSign: true });
		const { appStore, navigation } = this.props
		const currentTransaction = appStore.get('currentTransaction');
		try {
			const seed = appStore.get('seed');
			const keypair = generateTronKeypair(seed, secret.vn);

			const pk = keypair.base58Address;
			const sk = keypair.privateKey;

			const transactionString = await signDataTransaction(sk, currentTransaction.data);

			currentTransaction.URL += `?tx=${transactionString}`
			// console.log("URL", currentTransaction.URL);

			Linking.canOpenURL(currentTransaction.URL).then(supported => {
				if (!supported) {
					console.log('Can\'t handle url: ' + currentTransaction.URL);
				} else {
					return Linking.openURL(currentTransaction.URL);
				}
			}).catch(err => console.error('An error occurred', err));
			// const signedTx = signXdr(data);
			// this.saveCurrentTransaction(signedTx);
			navigation.navigate('TransactionDetail');
		} catch (error) {
			alert(error.message)
		} finally {
			this.setState({ loadingSign: false });

		}
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
			Alert.alert('You don`t have secrets seleceted');
		}
	}


	render() {
		const { appStore, toggleModal } = this.props
		const { showSecurityForm, options, secrets, secretSelected } = this.state
		const currentTransaction = appStore.get('currentTransaction');
		const securityFormError = appStore.get('securityFormError')
		if (currentTransaction && currentTransaction.type === 'error') {
			return (
				<Container>
					{/* <ErrorMessage tx={currentTransaction} /> */}
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

		if (!secretSelected) {
			return (<ContainerFlex style={{ backgroundColor: '#d5eef7', justifyContent: 'center' }}>
				<Text
					style={{
						fontWeight: 'bold',
						fontSize: 15,
						alignSelf: 'center',
						color: 'red',
					}}
				> There is not secret bounded to this transaction</Text>
				<TouchableOpacity
					onPress={() => this.props.navigation.navigate('Secrets')}
					style={{
						width: '20%',
						height: 40,
						marginTop: 10,
						alignSelf: 'center',
						borderColor: 'red',
						borderWidth: 1,
						backgroundColor: 'white',
						borderRadius: 20,
						alignItems: 'center',
						justifyContent: 'center'
					}}>
					<Text>Back</Text>
				</TouchableOpacity>
			</ContainerFlex>
			)
		}
		return (
			<ContainerFlex style={{ backgroundColor: '#d5eef7', justifyContent: 'center', alignItems: 'center' }}>
				<Text> This is your transaction</Text>
				<Text>{currentTransaction.data}</Text>
				{secretSelected &&
					<View style={{ flexDirection: 'column', alignItems: 'center' }}>
						<Text style={{ fontWeight: 'bold', margin: 5 }}>Account:  {secretSelected.doc.alias}</Text>
						<Text style={{ fontWeight: '500', }}>{secretSelected.doc.pk}</Text>
					</View>}
				{this.state.loadingSign ?
					<Text> Processing transaction</Text> :
					<TouchableOpacity
						onPress={this.submitSignature}
						style={{
							width: '40%',
							height: 50,
							marginTop: 50,
							alignSelf: 'center',
							borderColor: 'green',
							borderWidth: 1,
							backgroundColor: 'white',
							borderRadius: 20,
							alignItems: 'center',
							justifyContent: 'center'
						}}>
						<Text>Sign</Text>
					</TouchableOpacity>}

				{/* {!showSecurityForm && (
					<DetailTabs
						currentTransaction={currentTransaction}
						copyToClipboard={this.copyToClipboard}
						showConfirmDelete={this.showConfirmDelete}
						rejectTransaction={this.rejectTransaction}
						signTransaction={this.signTransaction}
					/>
				)} */}
				{/* {showSecurityForm && (
							<SecurityForm
								error={securityFormError}
								submit={this.authTransaction}
								close={toggleModal}
								closeAfterSubmit={false}
							/>
						)} */}

				{(options.length > 0) && (
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
