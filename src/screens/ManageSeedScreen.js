import React, { Component } from 'react';
import {  View, SafeAreaView, Modal, Alert } from 'react-native';
import { observer, inject } from 'mobx-react'
import Icon from 'react-native-vector-icons/Feather'
import sha256 from 'crypto-js/sha256';
import { ListItem } from 'react-native-elements'
import { Text, Button } from 'react-native-elements'
import SInfo from 'react-native-sensitive-info';
import DeviceInfo from 'react-native-device-info';
import SecurityForm from '../components/UI/SecurityForm'
import {
	Screen,
	ContainerFlex, 
	Container, 
	Header, 
	Title, 
	TitleWrapper, 
	LoadButtonWrapper, 
	LoadButton,
	SeedWord,
	SeedBox
} from './styled';

@inject('appStore') @observer
class ManageSeedScreen extends Component {

	static navigationOptions = ({ navigation }) => {
		const params = navigation.state.params || {};

		return {
			header: (
				<SafeAreaView style={{ backgroundColor: '#2e3666' }}>
					<Header>
						<TitleWrapper>
							<Title>My seed words</Title>
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
	}

	state = {
		seed: undefined,
		isSecurityRequired: true,
		isAuthenticated: false
	}

	validatePassword = (pwd) => {
		const { appStore } = this.props
		const pwd0 = appStore.get('pwd');
		const encodedPwd = sha256(pwd);
		if (encodedPwd.toString() === pwd0){
			setTimeout(()=> this.setState({ isSecurityRequired: false, isAuthenticated: true }), 600)
			appStore.set('securityFormError', undefined)
		} else {
			appStore.set('securityFormError', 'Invalid password! ')
		}
	}

	renderWords = () => {
		const { appStore } = this.props;
		const seed = appStore.get('seed');
		const words = seed.split(' ');
		return (
			<SeedBox>
				{words.map((item, index) => (<SeedWord key={`${index}`}>{item}</SeedWord>))}
			</SeedBox>
		)
	}

	closeModal = () => {
		const { navigation } = this.props
		navigation.goBack()
	}

	renderDeleteButton = () => {
		return (
			<View style={{ marginTop: 16 }}>
				<Button 
					title='DELETE' 
					buttonStyle={{
						backgroundColor: 'red',
						borderColor: "transparent",
						borderWidth: 0,
						borderRadius: 5
					}}
					onPress={this.showConfirmDelete}
				/>
			</View>
		)
	}

	showConfirmDelete = () => {
		Alert.alert(
			`Are you sure you want delete this?`,
			`After delete you will be redirected to the seed creation screen.`,
			[
				{ text: 'Cancel', onPress: () => { }, style: 'cancel' },
				{
					text: 'Confirm',
					onPress: () => this.deleteSeed()
				}
			],
			{ cancelable: true }
		)
	}

	deleteSeed = () => {
		const { appStore, navigation } = this.props
		const pwd = appStore.get('pwd')
		const uniqueId = DeviceInfo.getUniqueID();
		const seedKey = sha256(`ss-${uniqueId}`);
		appStore.set('seed', undefined);
		SInfo.deleteItem(seedKey.toString(), {});
		navigation.navigate('Auth');
	}

	render() {
		const { appStore } = this.props;
		const { isSecurityRequired, isAuthenticated } = this.state;
		const account = appStore.get('currentAccount');
		const securityFormError = appStore.get('securityFormError');
		const seed = appStore.get('seed');
		return (
			<View style={{ padding: 16, backgroundColor: 'white' }}>
				<Text h6>Please, write down these 12 words on a paper. These 12 words are the only way to restore your TronVault private keys if you loose or change your device. Make sure to keep it safe!</Text>
				{ seed && this.renderWords()}
				{ seed && this.renderDeleteButton()}
				{ isSecurityRequired &&
				<Modal isVisible={isSecurityRequired} onRequestClose={()=>{}}>
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

export default ManageSeedScreen