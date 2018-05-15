import React, { Component, Fragment } from 'react'
import {
	SafeAreaView, View, Text, Alert,
	Clipboard, ActivityIndicator,
	TouchableOpacity, ScrollView, Linking, Picker
} from 'react-native'
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
import styled from 'styled-components';

const DetailBox = styled.View`
flex-direction: column;
border-radius: 5px;
justify-content: flex-start;
padding: 5px;
margin-left: 15px;
`
const DetailLabel = styled.Text`
font-size: 15px;
margin: 6px;
font-weight: bold;
color: #2e3666;
`
const DetailText = styled.Text`
font-size: 15px;
margin: 6px;
`

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
							<LoadButton onPress={() => navigation.navigate('Home')}>
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
		loadingData: true,
		transactionDetail: null,
	}

	componentDidMount() {
		this.loadData();
	}

	loadData = async () => {
		// const test = signDataTransaction('a', 'a');
		const { appStore } = this.props;
		const currentTransaction = appStore.get('currentTransaction');
		this.setState({ loadingData: true });
		let transactionDetail = {};
		try {
			const pkFromQR = currentTransaction.pk;
			const transactionDetail = currentTransaction.txDetails;
			//TODO 
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

				this.setState({
					secrets,
					transactionDetail,
					options,
					secretSelected: secretFromQR,
					isLoadingList: false
				});
			})
		} catch (error) {
			alert(error.message)
		} finally {
			this.setState({ loadingData: false });
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

		this.showConfirmSignatureAlert(secretSelected)
	}


	confirmSignTransaction = async secret => {
		const { appStore, navigation } = this.props
		const currentTransaction = appStore.get('currentTransaction');
		this.signButton.load();
		try {
			const seed = appStore.get('seed');
			const keypair = generateTronKeypair(seed, secret.vn);

			const transactionString = currentTransaction.data;
			const pk = keypair.base58Address;
			const sk = keypair.privateKey;

			const transactionSignedString = await signDataTransaction(sk, transactionString);


			const type = currentTransaction.type;
			currentTransaction.URL += `?tx=${transactionSignedString}&pk=${pk}`;

			const supported = await Linking.canOpenURL(currentTransaction.URL)

			Linking.canOpenURL(currentTransaction.URL);
			if (supported) Linking.openURL(currentTransaction.URL);

			navigation.navigate('Home');
		} catch (error) {
			alert(error.message || error);
			navigation.navigate('Home');
		} finally {
			this.signButton.reset();

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
						text: 'Confirm the transaction',
						onPress: () => this.confirmSignTransaction(secret.doc)
					}
				],
				{ cancelable: true }
			)
		} else {
			Alert.alert('You don`t have secrets seleceted');
		}
	}

	renderTxDetail = () => {
		const { transactionDetail } = this.state;
		let details = [];
		for (let detail in transactionDetail) {
			details.push(<Fragment key={detail}>
				<DetailLabel>{detail}</DetailLabel>
				<DetailText>{transactionDetail[detail]}</DetailText>
			</Fragment>)
		}
		return details;
	}
	render() {
		const { appStore, toggleModal } = this.props
		const { showSecurityForm, options, secrets, secretSelected, loadingData, transactionDetail } = this.state
		const currentTransaction = appStore.get('currentTransaction');
		const securityFormError = appStore.get('securityFormError')

		if (loadingData) {
			return <ActivityIndicator size="large" color="#0000ff" />
		}
		if (!secretSelected) {
			return (<ContainerFlex style={{ backgroundColor: '#d5eef7', justifyContent: 'center' }}>
				<Text
					style={{
						fontWeight: 'bold',
						fontSize: 15,
						alignSelf: 'center',
						color: '#2e3666',
					}}
				> There is not secret bounded to this transaction</Text>
			</ContainerFlex>
			)
		}
		return (
			<ContainerFlex style={{ backgroundColor: '#d5eef7', justifyContent: 'center' }}>
				<DetailBox>
					<DetailLabel>Account:  {secretSelected.doc.alias}</DetailLabel>
					{transactionDetail && this.renderTxDetail()}
				</DetailBox>
				<Button
					onPress={() => this.confirmSignTransaction(secretSelected.doc)}
					ref={ref => (this.signButton = ref)}
					foregroundColor={'#4cd964'}
					onPress={this.savePassword}
					foregroundColor={'white'}
					backgroundColor={'#4cd964'}
					successColor={'#4cd964'}
					errorColor={'#ff3b30'}
					errorIconColor={'white'}
					successIconColor={'white'}
					successIconName="check"
					label="Sign"
					maxWidth={100}
					style={{ marginLeft: 16, borderWidth: 0, alignSelf: 'center' }}
				/>

			</ContainerFlex>
		)
	}
}

export default TransactionDetail
