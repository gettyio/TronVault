import React, { Component } from 'react';
import {  View, Text, SafeAreaView, Dimensions, ActivityIndicator, Clipboard, Modal } from 'react-native';
import QRCode from 'react-native-qrcode';
import Icon from 'react-native-vector-icons/Feather'
import Button from 'react-native-micro-animated-button'
import SecurityForm from '../components/UI/SecurityForm'
import sha256 from 'crypto-js/sha256';
import { observer, inject } from 'mobx-react'
import { generateTronKeypair } from './../utils/bipUtil';

import {
	Header,
	LoadButton,
	LoadButtonWrapper,
	Title,
	TitleWrapper
} from './styled'
const { width } = Dimensions.get('window');

@inject('appStore') @observer
class AccountDetailScreen extends Component {

	static navigationOptions = ({ navigation }) => {
		const params = navigation.state.params || {};
		return {
			header: (
				<SafeAreaView style={{ backgroundColor: '#2e3666' }}>
					<Header>
						<TitleWrapper>
							<Title>Account Detail</Title>
						</TitleWrapper>
						<LoadButtonWrapper>
							<LoadButton onPress={()=> navigation.goBack()}>
								<Icon name="arrow-left" color="white" size={32} />
							</LoadButton>
						</LoadButtonWrapper>
					</Header>
				</SafeAreaView>
			)
		};
	};

	state = {
		secret: undefined,
		isSecurityRequired: false,
		isAuthenticated: false
	}

	closeModal = () => {
		const { appStore } = this.props
		this.setState({ isSecurityRequired: false }, ()=> {
			this.revealSecretBtn.error();
			setTimeout(this.revealSecretBtn.reset, 500)
		});
	}

	getSecret = () => {
		const { appStore } = this.props
		const seed = appStore.get('seed');
		const account = appStore.get('currentAccount');
		const keypair = generateTronKeypair(seed, account.vn);
		return keypair;
	}

	validatePassword = (pwd) => {
		const { appStore } = this.props
		const pwd0 = appStore.get('pwd');
		const encodedPwd = sha256(pwd);
		if (encodedPwd.toString() === pwd0){
			const keypair = this.getSecret();
			this.revealSecretBtn.success();
			setTimeout(this.revealSecretBtn.reset, 1000)
			Clipboard.setString(keypair.privateKey);
			this.setState({ isSecurityRequired: false, isAuthenticated: true });
			appStore.set('securityFormError', undefined)
		} else {
			appStore.set('securityFormError', 'Invalid password! ')
		}
	}

	copyToClipboard = (value, btn) => {
		Clipboard.setString(value);
		btn.success();
		setTimeout(btn.reset, 1000)
	}

	copySecret = ()=> {
		this.setState({ isSecurityRequired: true });
	}

	render() {
		const { appStore } = this.props;
		const { secret, isSecurityRequired, isAuthenticated } = this.state;
		const account = appStore.get('currentAccount');
		const securityFormError = appStore.get('securityFormError');
		if (!account) {
			return (
				<View  style={{ flex: 1 }}>
					<View style={{ alignSelf: 'center', marginTop: 16 }}>
						<ActivityIndicator size="large" color="#0000ff" />
					</View>
				</View>
			)
		}

		return (
			<View style={{ flex: 1 }}>
				<View style={{ alignSelf: 'center', marginTop: 60 }}>
					<QRCode
						value={account.pk}
						size={width * 0.6}
						fgColor='white' 
					/>
				</View>
				<View style={{ alignSelf: 'center', marginTop: 16 }}>
					<Button
						ref={ref => (this.copyAccountBtn = ref)}
						foregroundColor={'white'}
						backgroundColor={'#454545'}
						successColor={'#4cd964'}
						errorColor={'#ff3b30'}
						errorIconColor={'white'}
						successIconColor={'white'}
						onPress={()=> this.copyToClipboard(account.pk, this.copyAccountBtn)}
						successIconName="check"
						label="Copy Address"
						maxWidth={200}
						style={{ marginLeft: 16, borderWidth: 0, alignSelf: 'center' }}
					/>
				</View>
				<View>
				<Button
						ref={ref => (this.revealSecretBtn = ref)}
						foregroundColor={'white'}
						backgroundColor={'#ff3b30'}
						successColor={'#4cd964'}
						errorColor={'#ff3b30'}
						errorIconColor={'white'}
						successIconColor={'white'}
						onPress={this.copySecret}
						successIconName="check"
						label="Copy Secret"
						maxWidth={200}
						style={{ marginLeft: 16, borderWidth: 0, alignSelf: 'center' }}
					/>

				</View>
				{ isSecurityRequired &&
					<Modal isVisible={isSecurityRequired}  onRequestClose={()=>{}}>
					<SafeAreaView style={{ flex: 1 }}>
						<SecurityForm
							appStore={appStore}
							submit={this.validatePassword}
							error={securityFormError}
							hideClose={false}
							closeColor={'black'}
							close={this.closeModal}
						/>
					</SafeAreaView>
				</Modal>
				}
			</View>
		);
	}
}

export default AccountDetailScreen;