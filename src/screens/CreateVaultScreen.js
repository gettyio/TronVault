import React, { Component } from 'react';
import { View, Text, TextInput, FlatList, SafeAreaView, KeyboardAvoidingView, ScrollView, Keyboard } from 'react-native';
import { observer, inject } from 'mobx-react'
import bip39 from 'bip39';
import Icon from 'react-native-vector-icons/Feather'
import styled from 'styled-components'
import Button from 'react-native-micro-animated-button'
import randomize from 'randomatic'
import DeviceInfo from 'react-native-device-info'
import cryptojs from 'crypto-js'
import sha256 from 'crypto-js/sha256';
import SInfo from 'react-native-sensitive-info';

import {
	Header,
	Title,
	TitleWrapper,
	LoadButtonWrapper,
	LoadButton,
	ErrorLabel,
	SuccessLabel,
	SeedWord,
	SeedBox,
	InsertSeedInput,
	VaultWordsText
} from './styled'


@inject('appStore') @observer
class CreateVaultScreen extends Component {

	static navigationOptions = ({ navigation }) => {
		const params = navigation.state.params || {};

		return {
			header: (
				<SafeAreaView style={{ backgroundColor: '#2e3666' }}>
					<Header>
						<TitleWrapper>
							<Title>My Vault</Title>
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
		tab: 'create',
		mnemonic: undefined,
		seedValue: undefined,
		errorMessage: undefined,
		successMessage: undefined,
	}

	componentDidMount() {
		const mnemonic = bip39.generateMnemonic(512, (n) => randomize('0', n));
		//console.log(mnemonic)
		this.setState({ mnemonic })
	}

	setCurrentTab = (tab) => {
		this.setState({ tab });
	}

	createSeed = () => {
		const { seedValue } = this.state;
		const { appStore, navigation } = this.props
		try {
			const pwd = appStore.get('pwd')
			const uniqueId = DeviceInfo.getUniqueID();
			const seedKey = sha256(`ss-${uniqueId}`);
			const pass = sha256(`ss-${uniqueId}-${pwd}`);
			const ciphertext = cryptojs.AES.encrypt(seedValue.trim(), pass.toString());
			SInfo.setItem(seedKey.toString(), ciphertext.toString(), {});
			this.restoreSeedButton.success();
			appStore.set('seed', seedValue);
			navigation.navigate('Secrets')
		} catch (error) {
			alert(error.message);
		}
	}

	restoreSeed = () => {
		const { tab, mnemonic, seedValue } = this.state;
		const isValidSeed = bip39.validateMnemonic(seedValue);
		if (isValidSeed) {
			if (tab === 'continue') {
				if (!seedValue || mnemonic !== seedValue.trim()) {
					this.restoreSeedButton.error();
					this.restoreSeedButton.reset();
					this.setState({ errorMessage: 'Invalid seed combination, please make sure to write with the same order.' })
				} else {
					this.setState({ successMessage: 'The seed combination is valid. We are restoring your master key...' })
					this.createSeed()
				}
			}

			if (tab === 'restore') {
				if (seedValue.trim().split(/\s+/g).length === 24) {
					this.setState({ successMessage: 'The seed combination is valid. We are restoring your master key...' })
					this.createSeed();
				} else {
					this.restoreSeedButton.error();
					this.restoreSeedButton.reset();
					this.setState({ errorMessage: 'Invalid seed combination, you must type a seed with 24 words.' })
				}
			}
		} else {
			this.restoreSeedButton.error();
			this.restoreSeedButton.reset();
			this.setState({ errorMessage: 'Invalid seed. Please, check if any of your 24 words has any typo.' })
		}
	}

	dismissKeyboard = (event) => {
		if (event.nativeEvent.key === 'Enter') {
			Keyboard.dismiss()
		}
	}

	renderWords = () => {
		const { mnemonic } = this.state;
		if (!mnemonic) {
			return <View />;
		}
		const words = mnemonic.split(' ');
		return (
			<SeedBox>
				{words.map((item, index) => (<SeedWord key={`${index}`}>{item}</SeedWord>))}
			</SeedBox>
		)
	}

	handleRenderer = () => {
		const { tab, mnemonic, seedValue, errorMessage, successMessage } = this.state;
		if (!mnemonic) {
			return;
		}

		if (tab === 'continue' || tab === 'restore') {
			return (
				<View style={{ margin: 8 }}>
					<InsertSeedInput
						multiline={true}
						numberOfLines={4}
						autoFocus={false}
						autoCorrect={false}
						autoCapitalize={'none'}
						clearButtonMode={'always'}
						onChangeText={text => this.setState({ seedValue: text.toLowerCase() })}
						underlineColorAndroid={'white'}
						value={seedValue}
						placeholder="Please, type your seed words here."
					>
					</InsertSeedInput>
					{errorMessage && <ErrorLabel>{errorMessage}</ErrorLabel>}
					{successMessage && <SuccessLabel>{successMessage}</SuccessLabel>}
					<View style={{ alignItems: 'center' }}>
						<Button
							ref={ref => (this.restoreSeedButton = ref)}
							foregroundColor={'#276cf2'}
							onPress={this.restoreSeed}
							foregroundColor={'white'}
							backgroundColor={'#276cf2'}
							successColor={'#276cf2'}
							errorColor={'#ff3b30'}
							errorIconColor={'white'}
							successIconColor={'white'}
							successIconName="check"
							label="Restore Seed"
							maxWidth={300}
							style={{ marginTop: 24, borderWidth: 0 }}
						/>
						<Button
							ref={ref => (this.backButton = ref)}
							foregroundColor={'#343434'}
							onPress={() => {
								this.backButton.success()
								this.setCurrentTab('create')
							}}
							foregroundColor={'white'}
							backgroundColor={'#343434'}
							successColor={'#343434'}
							errorColor={'#343434'}
							errorIconColor={'white'}
							successIconColor={'white'}
							successIconName="check"
							label="Back"
							maxWidth={300}
							style={{ marginTop: 8, borderWidth: 0 }}
						/>
					</View>
				</View>
			)
		}

		const words = mnemonic.split(' ');
		return (
			<View style={{ padding: 16, height: '100%' }}>
				<View>
					<VaultWordsText>Please, write down these 24 words on a paper. These 24 words are the only way to restore your Tron Mobile private keys if you loose or change your device. Make sure to keep it safe!</VaultWordsText>
					{this.renderWords()}
				</View>
				<View style={{ alignItems: 'center' }}>
					<Button
						ref={ref => (this.createSeedButton = ref)}
						foregroundColor={'red'}
						onPress={() => this.setCurrentTab('continue')}
						foregroundColor={'white'}
						backgroundColor={'red'}
						successColor={'red'}
						errorColor={'#ff3b30'}
						errorIconColor={'white'}
						successIconColor={'white'}
						successIconName="check"
						label="I've copied it to somewhere safe"
						maxWidth={300}
						style={{ marginTop: 32, borderWidth: 0 }}
					/>

					<Button
						ref={ref => (this.goRestoreSeedButton = ref)}
						foregroundColor={'#276cf2'}
						onPress={() => {
							this.goRestoreSeedButton.success();
							this.setCurrentTab('restore');
						}}
						foregroundColor={'white'}
						backgroundColor={'#276cf2'}
						successColor={'#276cf2'}
						errorColor={'#ff3b30'}
						errorIconColor={'white'}
						successIconColor={'white'}
						successIconName="check"
						label="I want to restore my keys"
						maxWidth={300}
						style={{ marginTop: 16, borderWidth: 0 }}
					/>
				</View>
			</View>
		)
	}

	render() {
		const { tab } = this.state;
		return (
			<SafeAreaView style={{ flex: 1, alignContent: 'flex-start', backgroundColor: 'white' }}>
				<ScrollView>
					{this.handleRenderer()}
				</ScrollView>
			</SafeAreaView>
		);
	}
}

export default CreateVaultScreen;