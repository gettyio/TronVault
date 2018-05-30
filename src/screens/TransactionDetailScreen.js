import React, { Component, Fragment } from 'react'
import {
	SafeAreaView, View, Text, Alert,
	Clipboard, ActivityIndicator,
	TouchableOpacity, ScrollView, Linking, Picker,
	Dimensions
} from 'react-native'
import Button from 'react-native-micro-animated-button'
import Icon from 'react-native-vector-icons/Feather'
import { observer, inject } from 'mobx-react'
import { List, ListItem, Card } from 'react-native-elements'
import QRCode from 'react-native-qrcode';
import uuid from 'uuid/v4'
import qs from 'qs';
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

const SQLiteAdapter = SQLiteAdapterFactory(SQLite)
PouchDB.plugin(SQLiteAdapter)
const db = new PouchDB('Secrets', { adapter: 'react-native-sqlite' })
const db2 = new PouchDB('Transactions', { adapter: 'react-native-sqlite' })
const { width } = Dimensions.get('window');

@inject('appStore') @observer
class TransactionDetail extends Component {

	static navigationOptions = ({ navigation }) => {
		return {
			header: (
				<SafeAreaView style={{ backgroundColor: '#2e3666' }}>
					<Header>
						<TitleWrapper>
							<Title>Contract Detail</Title>
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
		secrets: [],
		options: [],
		secretSelected: null,
		loadingData: true,
		transactionDetail: null,
		isSigningNow: false,
		pk: '',
		transactionSigned: null,
	}

	componentDidMount() {
		const { appStore } = this.props;
		this.loadData();
	}

	loadData = async () => {
		const { appStore } = this.props;
		const currentTransaction = appStore.get('currentTransaction');
		let transactionDetail = {};
		try {
			const pkFromQR = currentTransaction.pk;
			const transactionDetail = currentTransaction.txDetails;
			// //TODO 
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
					loadingData: false,
				});
			})
		} catch (error) {
			alert(error.message);
			this.setState({ loadingData: false });
		}
	}

	deleteTransaction = async () => {
		const { appStore, navigation } = this.props
		const currentTransaction = appStore.get('currentTransaction');
		try {
			const res = await db2.remove(currentTransaction);
			navigation.goBack();
		} catch (error) {
			alert(error.message);
		}
	}


	// handleSignPress = () => {
	// 	const { appStore } = this.props
	// 	const { isSigningNow, secretSelected } = this.state;
	// 	const currentTransaction = appStore.get('currentTransaction');

	// 	if (isSigningNow) this.submitTransaction();
	// 	else this.confirmSignTransaction(secretSelected.doc);
	// }

	componentWillUnmount() {
		const { appStore } = this.props;
		const currentTransaction = appStore.set('currentTransaction', undefined);

	}
	confirmSignTransaction = async () => {
		const { appStore, navigation } = this.props
		const { secretSelected } = this.state;
		const currentTransaction = appStore.get('currentTransaction');
		const secret = secretSelected.doc;
		try {
			const seed = appStore.get('seed');
			const keypair = generateTronKeypair(seed, secret.vn);
			const pk = keypair.base58Address;
			const sk = keypair.privateKey;

			const transactionString = currentTransaction.data;
			const transactionSigned = await signDataTransaction(sk, transactionString);

			const tx = {
				...currentTransaction,
				pk,
				transactionSigned,
				status: 'SIGNED',
				createdAt: new Date().toISOString()
			};
			await db2.put({ _id: uuid(), ...tx });
			this.setState({ pk, transactionSigned, isSigningNow: true }, this.signButton.reset());
			return;
		} catch (error) {
			alert(error.message || error);
			this.signButton.error();
			navigation.goBack();
		}
	}

	submitTransaction = async () => {
		const { appStore, navigation } = this.props
		const { pk, transactionSigned } = this.state;
		const currentTransaction = appStore.get('currentTransaction');
		try {
			if (currentTransaction.from === 'mobile') {
				currentTransaction.URL += `/${transactionSigned}`;
				Linking.openURL(currentTransaction.URL);
				navigation.navigate('Home');
				return;
			} else {
				currentTransaction.URL += `/${pk}/${transactionSigned}/${Date.now()}`;
			}

		} catch (error) {
			alert(error.message)
			this.signButton.reset();
			navigation.navigate('Home');
		}

	}

	retrySubmit = async () => {
		const { appStore, navigation } = this.props
		const currentTransaction = appStore.get('currentTransaction')
		try {
			const { pk, transactionSigned, URL } = currentTransaction;
			URL += `/ ${pk} / ${transactionSigned} / ${Date.now()}`;
			alert(URL);

			await Linking.openURL(URL);

			this.signButton.success();
			navigation.goBack();
		} catch (error) {
			alert(error.message)
			this.signButton.reset();
		}
	}
	
	firstLetterCapitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);


	renderTxDetail = () => {
		const { transactionDetail, secretSelected, isSigningNow } = this.state;
		const { appStore } = this.props;
		const currentTransaction = appStore.get('currentTransaction');
		//If submited then it was signed
		if (!currentTransaction) return;

		const signedStatus = isSigningNow || currentTransaction.status === 'SIGNED';
		const submitedStatus = currentTransaction.status === 'SIGNED';

		let details = [];

		details.push(<ListItem
			rightTitleStyle={{ color: '#383838' }}
			hideChevron
			key={'account'}
			title={'Account'}
			titleStyle={{ color: '#2e3666', fontWeight: '600' }}
			rightTitle={secretSelected.doc.alias.toString()}
		/>)
		for (let detail in transactionDetail) {
			details.push(<ListItem
				rightTitleStyle={{ color: '#383838' }}
				rightTitleContainerStyle={2}
				hideChevron
				key={detail}
				title={this.firstLetterCapitalize(detail.toString())}
				titleStyle={{ color: '#2e3666', fontWeight: '600' }}
				rightTitle={transactionDetail[detail].toString()}
			/>)
		}
		details.push(
			<ListItem
				rightTitleStyle={{ color: '#383838' }}
				key={'signed'}
				titleStyle={{ color: '#2e3666', fontWeight: '600' }}
				title="Signed"
				rightIcon={signedStatus ?
					<Icon name="check" color="green" size={20} /> :
					<Icon name="x" color="red" size={20} />}
			/>);

		return <List containerStyle={{ margin: 0 }} title="Contract Data">
			{details}
		</List>;
	}


	render() {
		const { appStore, toggleModal } = this.props
		const { secretSelected, loadingData, transactionDetail, isSigningNow, transactionSigned } = this.state
		const securityFormError = appStore.get('securityFormError');
		const currentTransaction = appStore.get('currentTransaction');
		let canSubmit = false;
		let canSign = false;
		let showCode = null;

		if (loadingData) {
			return (
			<View style={{ flex: 1 }}>
				<ActivityIndicator size="large" color="#0000ff" />
			</View>
			)
		}
		if (!secretSelected) {
			return (<ContainerFlex style={{ backgroundColor: '#d5eef7', justifyContent: 'center', padding: 0 }}>
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
		if (currentTransaction) {
			canSubmit = isSigningNow && currentTransaction.from === 'mobile';
			canSign = !isSigningNow && currentTransaction.status !== 'SIGNED';
			showCode = (isSigningNow && transactionSigned) || currentTransaction.transactionSigned;
		}
		return (
			<ContainerFlex style={{ backgroundColor: '#ffffff' }}>
				<ScrollView>
					<Text style={{ alignSelf: 'center', marginVertical: 10, paddingBottom: 0, color: '#3e3666', fontWeight: '500' }}>Contract Data</Text>
					{showCode && <View style={{ alignItems: 'center' }}>
						<QRCode
							value={showCode}
							size={width * 0.9}
							fgColor='white'
						/>
					</View>}
					{canSubmit && < Button
						onPress={this.submitTransaction}
						ref={ref => (this.signButton = ref)}
						foregroundColor={'white'}
						backgroundColor={'#0046b7'}
						successColor={'#4cd964'}
						errorColor={'#ff3b30'}
						errorIconColor={'white'}
						successIconColor={'white'}
						successIconName="check"
						label={"Submit"}
						maxWidth={150}
						style={{ marginLeft: 16, borderWidth: 0, alignSelf: 'center' }}
					/>}
					{transactionDetail && this.renderTxDetail()}
					{canSign && <Button
						onPress={this.confirmSignTransaction}
						ref={ref => (this.signButton = ref)}
						foregroundColor={'white'}
						backgroundColor={isSigningNow ? 'blue' : '#4cd964'}
						successColor={'#4cd964'}
						errorColor={'#ff3b30'}
						errorIconColor={'white'}
						successIconColor={'white'}
						successIconName="check"
						label={"Sign"}
						maxWidth={100}
						style={{ marginLeft: 16, borderWidth: 0, alignSelf: 'center' }} />}
					{isSigningNow && < Button
						onPress={() => this.props.navigation.goBack()}
						ref={ref => (this.signButton = ref)}
						foregroundColor={'white'}
						backgroundColor={'#0046b7'}
						successColor={'#4cd964'}
						errorColor={'#ff3b30'}
						errorIconColor={'white'}
						successIconColor={'white'}
						successIconName="check"
						label={"Ok"}
						maxWidth={150}
						style={{ marginLeft: 16, borderWidth: 0, alignSelf: 'center' }}
					/>}
					{(!canSign && !isSigningNow) && <Button
						onPress={this.deleteTransaction}
						ref={ref => (this.deleteButton = ref)}
						foregroundColor={'white'}
						backgroundColor={'#ff3b30'}
						successColor={'#4cd964'}
						errorColor={'#ff3b30'}
						errorIconColor={'white'}
						successIconColor={'white'}
						successIconName="check"
						label={"Delete"}
						maxWidth={150}
						style={{ marginLeft: 16, borderWidth: 0, alignSelf: 'center' }}
					/>}

				</ScrollView>
			</ContainerFlex>
		)
	}
}

export default TransactionDetail
