import React, { Component } from 'react'
import { View, Text, ScrollView, Alert, Dimensions, KeyboardAvoidingView, SafeAreaView, Clipboard, Keyboard } from 'react-native'
import Modal from 'react-native-modal'
import uuid from 'uuid/v4'
import createHmac from 'create-hmac'
import { observer, inject } from 'mobx-react'
import { sortBy } from 'lodash'
import bip39 from 'bip39'
import base64 from 'base-64'
import base64js from 'base64-js'
import cryptojs from 'crypto-js'
import sha256 from 'crypto-js/sha256'
import cryptocore from 'crypto-js/core'
import randomize from 'randomatic'
import PouchDB from 'pouchdb-react-native'
import SQLite from 'react-native-sqlite-2'
import SQLiteAdapterFactory from 'pouchdb-adapter-react-native-sqlite'
import Icon from 'react-native-vector-icons/Feather'
import Button from 'react-native-micro-animated-button'
import SInfo from 'react-native-sensitive-info'
import SecretList from '../components/Secret/SecretList'
import { isNaN } from 'lodash';
import {
	Screen,
	ContainerFlex,
	Header,
	Title,
	LoadButton,
	TextInput,
	ErrorLabel,
	CloseButton,
	CardFlex,
	LoadButtonWrapper,
	TitleWrapper,
	SecretLabel,
	CreatePairKeyView
} from './styled'
import { generateTronKeypair } from './../utils/bipUtil';

const SQLiteAdapter = SQLiteAdapterFactory(SQLite)
PouchDB.plugin(SQLiteAdapter)
const db = new PouchDB('Secrets', { adapter: 'react-native-sqlite' })

@inject('appStore') @observer
class SecretsScreen extends Component {

	static navigationOptions = ({ navigation }) => {
		const params = navigation.state.params || {};
		return {
			header: (
				<SafeAreaView style={{ backgroundColor: '#2e3666' }}>
					<Header>
						<TitleWrapper>
							<Title>Addresses</Title>
						</TitleWrapper>
						<LoadButtonWrapper>
							<LoadButton onPress={params.toggleAddModal}>
								<Icon name="plus-circle" color="white" size={32} />
							</LoadButton>
						</LoadButtonWrapper>
					</Header>
				</SafeAreaView>
			),
			tabBarOnPress({ jumpToIndex, scene }) {
				// now we have access to Component methods
				params.loadData();
				jumpToIndex(scene.index);
			}
		};
	};

	state = {
		sk: undefined,
		alias: undefined,
		userPath: undefined,
		hasError: false,
		secrets: []
	}

	componentWillMount() {
		this.props.navigation.setParams({ toggleAddModal: this.toggleAddModal, loadData: this.loadData });
	}

	componentDidMount() {
		this.loadData();
	}

	loadData = () => {
		const { appStore } = this.props;
		let self = this;
		db.allDocs({
			include_docs: true
		}).then((res) => {
			const rawsecrets = res.rows.map((item, index) => item.doc);
			const secrets = sortBy(rawsecrets, 'createdAt').reverse()
			let alias;
			let address;
			let vn;
			let balances = [];
			for (let secret of rawsecrets) {
				alias = secret.alias;
				address = secret.pk;
				vn = secret.vn;
				balances.push({ address, alias, vn });
			}
			// options.push({ address: 'A0761DF29A1B489AFE9EA13648F219EE7F2DAB3683', alias: 'Test Account' });
			appStore.set('balances', balances);
			self.setState({ secrets });


		})
	}

	toggleAddModal = () => {
		const { appStore } = this.props
		appStore.set('isAddSecretModalVisible', !appStore.get('isAddSecretModalVisible'));
	}

	handleInputErrors = () => {
		const { sk, alias } = this.state
	}

	createNewAccount = () => {
		const { appStore } = this.props
		const { alias, userPath, hasError } = this.state;

		if (!alias || !userPath) {
			this.setState({ hasError: true });
			this.addSecretButton.error()
			this.addSecretButton.reset()
		} else {
			try {

				const pwd = appStore.get('pwd');
				const seed = appStore.get('seed');
				//alert(seed)
				// const keypair = generateKeypair(seed, userPath);
				const keypair = generateTronKeypair(seed, userPath);
				//{ base58Address, address: keypair.address, pubKey: keypair.pubKey, pwd: keypair.pwd, privateKey: keypair.privateKey }
				// const pk = keypair.publicKey();
				const pk = keypair.base58Address;
				const _id = uuid();
				db.put({
					_id,
					pk,
					alias,
					vn: userPath,
					createdAt: new Date().toISOString()
				});
				this.loadData();
				this.toggleAddModal();
				this.setState({ hasError: false, sk: undefined, alias: undefined, userPath: undefined })
			} catch (error) {
				alert(error.message)
			}
		}
	}

	deleteSecret = async (doc, goBack) => {
		try {
			const res = await db.remove(doc);
			this.loadData();
			goBack();
		} catch (error) {
			alert(error.message);
		}
	}

	copyToClipboard = (publicKey) => {
		Clipboard.setString(publicKey);
		alert('The public key was copied to the clipboard');
	}

	showDeleteSecretAlert = (item, goBack, resetBtn) => {
		Alert.alert(
			`${item.alias}`,
			`${item.pk}`,
			[
				{
					text: 'Delete',
					onPress: () => this.deleteSecret(item, goBack),
					style: 'cancel'
				},
				{ text: 'Close', onPress: () => resetBtn() } // Do not button
			],
			{ cancelable: false }
		)
	}

	showAccountDetail = item => {
		const { appStore, navigation } = this.props
		appStore.set('currentAccount', item)
		navigation.navigate('AccountDetail', { alias: item.alias, delete: this.showDeleteSecretAlert })
	}

	pasteHandler = async () => {
		const content = await Clipboard.getString()
		this.setState({ sk: content })
	}

	render() {
		const { appStore } = this.props
		const { sk, alias, userPath, hasError, secrets } = this.state
		const isAddSecretModalVisible = appStore.get('isAddSecretModalVisible')

		return (
			<Screen>
				<SecretList secrets={secrets} show={this.showAccountDetail} />
				<Modal isVisible={isAddSecretModalVisible}>
					<SafeAreaView style={{ flex: 1 }}>
						<ScrollView
							keyboardShouldPersistTaps="always"
							keyboardDismissMode="interactive"
						>
							<ContainerFlex>
								<CloseButton onPress={this.toggleAddModal}>
									<Icon name="x-circle" color="white" size={32} />
								</CloseButton>
								<CardFlex>
									<TextInput
										autoFocus={false}
										autoCorrect={false}
										placeholder="Type an alias for this account."
										onChangeText={text => this.setState({ alias: text })}
										clearButtonMode={'always'}
										underlineColorAndroid={'white'}
										value={alias}
									/>
									<TextInput
										keyboardType={'numeric'}
										autoCorrect={false}
										autoFocus={false}
										placeholder="Type a vault number password."
										onChangeText={text => this.setState({ userPath: text })}
										clearButtonMode={'always'}
										underlineColorAndroid={'white'}
										value={userPath}
									/>
									<View>
										{hasError && <ErrorLabel>Invalid alias or vault number.</ErrorLabel>}
									</View>
								</CardFlex>
								<KeyboardAvoidingView>
									<CreatePairKeyView>
										<Button
											ref={ref => (this.addSecretButton = ref)}
											foregroundColor={'#276cf2'}
											onPress={this.createNewAccount}
											foregroundColor={'white'}
											backgroundColor={'#276cf2'}
											successColor={'#276cf2'}
											errorColor={'#ff3b30'}
											errorIconColor={'white'}
											successIconColor={'white'}
											successIconName="check"
											label="Create new address"
											style={{ borderWidth: 0 }}
										/>
									</CreatePairKeyView>
									<View>
										<SecretLabel>
											The number above is your vault number password. Please, take note on paper and keep it safe, you will need it to recover this secret from another device. If have you restored your secret words.
										</SecretLabel>
										<SecretLabel weight={'700'}>Create new address </SecretLabel>
										<SecretLabel>
											To get started on using the TronVault, you must first create an address, then, you must fund the address.
										</SecretLabel>
										<SecretLabel>
											When you create an account with TronVault it will generate a new keypair. The keypair consists of two parts:
										</SecretLabel>
										<SecretLabel>
											<SecretLabel weight={'700'}>Public key:</SecretLabel> The public key is used to identify the address. It is also known as an account or address.
										</SecretLabel>
										<SecretLabel>
											<SecretLabel weight={'700'}>Secret key:</SecretLabel>
											The secret key is used to access your address and sign smart contracts. Keep this code safe and secure. Anyone with the code will have full access to the adress assets. If you lose the key, you will no longer be able to access the assets and there is no recovery mechanism.
											</SecretLabel>
										<SecretLabel weight={'700'}>Security notes</SecretLabel>
										<SecretLabel>
											Turn your mobile phone network off before sign and transmit contracts.
										</SecretLabel>
									</View>
								</KeyboardAvoidingView>
							</ContainerFlex>
						</ScrollView>
						</SafeAreaView>
				</Modal>
			</Screen>
		)
	}
}

export default SecretsScreen
