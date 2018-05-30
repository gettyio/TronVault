import React, { Component } from 'react'
import { View, Text, Image, ScrollView, SafeAreaView, KeyboardAvoidingView, Linking } from 'react-native'
import PropTypes from 'prop-types'
import qs from 'qs'
import { observer, inject } from 'mobx-react'
import crypto from 'crypto-js'
import sha256 from 'crypto-js/sha256';
import Modal from 'react-native-modal'
import DeviceInfo from 'react-native-device-info';
import Icon from 'react-native-vector-icons/FontAwesome'
import Button from 'react-native-micro-animated-button'
import SplashScreen from 'react-native-splash-screen'
import SInfo from 'react-native-sensitive-info';
import SecurityForm from '../components/UI/SecurityForm'
import { version } from './../../package.json'

import {
	AuthLogoView,
	AuthVersionWrapper,
	AuthVersionText
} from './styled';

import PouchDB from 'pouchdb-react-native'
import SQLite from 'react-native-sqlite-2'
import SQLiteAdapterFactory from 'pouchdb-adapter-react-native-sqlite'
const SQLiteAdapter = SQLiteAdapterFactory(SQLite)
PouchDB.plugin(SQLiteAdapter)
const db = new PouchDB('Secrets', { adapter: 'react-native-sqlite' });

import { createVoteTransaction } from './../utils/transactionUtil';

@inject('appStore') @observer
class AuthScreen extends Component {
	static navigationOptions = {
		header: null,
	};

	state = {
		firstSecret: undefined,
	}

	componentDidMount() {
		SplashScreen.hide();
		// this.enableDeepLinks();
		this.loadData();
		alert('For security reasons, please, turn off your phone internet before login.')
		//this.debugKeychain();
	}

	debugKeychain = async () => {
		try {
			const items = await SInfo.getAllItems({});
			items.forEach(element => {
				console.log(element)
			});
		} catch (error) {
			alert(error.message);
		}
	}

	loadSeed = () => {
		const { appStore, navigation } = this.props
		if (!appStore.get('seed')) {
			try {
				const pwd = appStore.get('pwd')
				const uniqueId = DeviceInfo.getUniqueID();
				const seedKey = sha256(`ss-${uniqueId}`);
				SInfo.getItem(seedKey.toString(), {}).then(value => {
					if (value) {
						const pass = sha256(`ss-${uniqueId}-${pwd}`);
						const bytes = crypto.AES.decrypt(value, pass.toString());
						const seed = bytes.toString(crypto.enc.Utf8)
						if (seed) {
							appStore.set('seed', seed);
							if (navigation.state.params && navigation.state.params.data) {
								//that means is receiving a deeplink from tron hot
								const deepLinkData = qs.parse(navigation.state.params.data)
								if (deepLinkData.action !== 'getkey') {
									appStore.set('currentTransaction', deepLinkData);
									navigation.navigate('TransactionDetail', { mobile: true });
								} else {
									navigation.navigate('GetKey', { url: deepLinkData.URL, mobile: true });
								}

							} else {
								navigation.navigate('Secrets');
							}
						} else {
							navigation.navigate('CreateVault');
						}
					} else {
						navigation.navigate('CreateVault');
					}
				})
			} catch (error) {
				alert(error.message);
				//alert('Error to load your seed, please uninstall this app and install the last version to have a better experience. You will need to use your seed to restore your keys.');
			}
		} else {
			//that means is receiving a deeplink from tron hot
			if (navigation.state.params && navigation.state.params.data) {
				const deepLinkData = qs.parse(navigation.state.params.data)
				if (deepLinkData.action !== 'getkey') {
					appStore.set('currentTransaction', deepLinkData);
					navigation.navigate('TransactionDetail', { mobile: true });
				} else {
					navigation.navigate('GetKey', { url: deepLinkData.URL, mobile: true });
				}
			}

		}
	}

	enableDeepLinks = () => {
		Linking.addEventListener('url', this.handleAppLinkURL)
		Linking.getInitialURL().then(url => {
			if (url) {
				this.handleAppLinkURL(new String(url))
			}
		})
	}

	loadData = () => {
		const { appStore } = this.props
		try {
			db.allDocs({
				include_docs: true
			}).then((res) => {
				const row = res.rows[0];
				if (row) {
					this.setState({ firstSecret: row.doc })
				}
			})
		} catch (error) {
			appStore.set('securityFormError', 'Invalid password!')
		}
	}

	submit = async (pwd) => {
		const { firstSecret } = this.state;
		const { appStore, navigation } = this.props
		try {
			const encodedPwd = sha256(pwd);
			const ss = `${encodedPwd.toString()}:${pwd}`;
			const pwdKey = sha256(`ss-${uniqueId}-${encodedPwd.toString()}`)
			const uniqueId = DeviceInfo.getUniqueID();
			const pwdencoded = await SInfo.getItem(pwdKey.toString(), {})
			const isUniq = await SInfo.getItem(`ss-${uniqueId}`, {})
			if (pwdencoded) {
				const bytes = crypto.AES.decrypt(pwdencoded, ss);
				const val = bytes.toString(crypto.enc.Utf8)
				if (val) {
					appStore.set('pwd', encodedPwd.toString())
					appStore.set('securityFormError', undefined)
					appStore.set('isSecurityRequired', false)
					this.loadSeed();
				} else {
					appStore.set('securityFormError', 'Invalid password!')
				}
			} else {
				if (isUniq === 'created') {
					appStore.set('securityFormError', 'Invalid password!')
				} else {
					appStore.set('pwd', encodedPwd.toString())
					appStore.set('securityFormError', undefined)
					appStore.set('isSecurityRequired', false)
					const ciphertext = crypto.AES.encrypt(pwd, ss);
					SInfo.setItem(pwdKey.toString(), ciphertext.toString(), {});
					SInfo.setItem(`ss-${uniqueId}`, 'created', {});
					this.loadSeed();
				}
			}
		} catch (error) {
			appStore.set('securityFormError', 'Invalid password!')
		}
	}

	toggleModal = () => {
		const { appStore } = this.props
		appStore.set('isSecurityRequired', !appStore.get('isSecurityRequired'))
	}

	render() {
		const { appStore } = this.props
		const isSecurityRequired = appStore.get('isSecurityRequired')
		const securityFormError = appStore.get('securityFormError')
		return (
			<SafeAreaView style={{ flex: 1, alignContent: 'flex-start', backgroundColor: '#2f3864' }}>
				<ScrollView
					keyboardShouldPersistTaps="always"
					keyboardDismissMode="interactive"
				>
					<KeyboardAvoidingView behavior="position">
						<AuthLogoView>
							<Image source={require('./../assets/logo.png')} style={{ height: 120 }} resizeMode='contain' />
						</AuthLogoView>
						<SecurityForm
							appStore={appStore}
							submit={this.submit}
							error={securityFormError}
							close={this.toggleModal}
							hideClose
						/>
						<AuthVersionWrapper>
							<AuthVersionText>
								{`v${version}`}
							</AuthVersionText>
						</AuthVersionWrapper>
					</KeyboardAvoidingView>
				</ScrollView>
			</SafeAreaView>
		)
	}
}

export default AuthScreen