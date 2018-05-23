import React, { Component } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    ScrollView,
    KeyboardAvoidingView,
    Picker,
    ActivityIndicator,
    Alert
} from 'react-native';

import { observer, inject } from 'mobx-react';
import Icon from 'react-native-vector-icons/Feather';
import Button from 'react-native-micro-animated-button';
import PouchDB from 'pouchdb-react-native';
import SQLite from 'react-native-sqlite-2';
import SQLiteAdapterFactory from 'pouchdb-adapter-react-native-sqlite';
import QRCodeScanner from 'react-native-qrcode-scanner';
import styled from 'styled-components';

import { Send, GetBalances } from './../../utils/transactionUtil';
import { generateKeypair } from './../../utils/bipUtil';
import {
    TextInput,
    ErrorLabel,
    SendButtonView,
    MiniPasteButton,
    SecretWrapper,
    CardWrapper
} from './styled'


const SendInputView = styled.View`
	width: 100%;
	justify-content: center;
	padding: 8px;
`
const InputLabel = styled.Text`
	margin-top: 10px;
	font-weight: 700;
`
const TextInputWrapper = styled.View`
	align-items: center;
	flex-direction: row;
`
const SQLiteAdapter = SQLiteAdapterFactory(SQLite)
PouchDB.plugin(SQLiteAdapter)
const db = new PouchDB('Secrets', { adapter: 'react-native-sqlite' })

@inject('appStore') @observer
class SendForm extends Component {

    state = {
        to: '',
        amount: '0.000001',
        secrets: [],
        balances: [],
        token: '',
        balanceSelected: {},
        loadingData: false,
        loadingSend: false,
        dataError: false,
        sendError: false,
		sendStatus: false
	}
		
    sendTransaction = async () => {
        const { appStore } = this.props;
        const { to, amount, balanceSelected } = this.state;
        let sendStatus = false;
        this.setState({ loadingSend: true });

        try {
            const vn = balanceSelected.vn;
            const token = balanceSelected.name;
            const seed = appStore.get('seed');
            let key;
            //MOCK
            if (vn == 'test') {
                key = 'd37HeyG0G6PY8ZtwCLDFaRKO+/c+NWT/S/6rfP7OCiA=';
            } else {
                const keypair = generateKeypair(seed, vn);
                key = keypair.pwd;
            }
            sendStatus = await Send({ to, token, amount: Number(amount), key });
            if (!sendStatus) throw new Error('Something went wrong with the transaction');
            else alert('Transaction successfully completed');

        } catch (error) {
            alert(error.message || error);
        } finally {
            this.setState({
                loadingSend: false,
                sendStatus
            }, (prevState, props) => {
                this.sendButton.reset();
                this.reloadBalances();
            });
        }

    }

    loadData = async () => {
        const { appStore } = this.props;
        const balances = appStore.get('balances').peek();
        this.setState({ loadingData: true });
        // let balances = [{ address: '55pSSzWKnF8wwjAE+rUpCFivitjq4fgo0Grk1iiY5rM=' }, { address: 'k5kdLPgmKVr850TYoSdjW8nYfqWrtEZOZhZPAOOVaJY=' }]
        let balancesUpdated = [];
        try {
            balancesUpdated = await Promise.all(balances.map(bl => GetBalances(bl.address)));
            balancesUpdated = [].concat(...balancesUpdated);

            if (balancesUpdated.length) {
                this.setState({
                    balances: balancesUpdated,
                    balanceSelected: balancesUpdated[0],
                    to: 'A08E47DB3468CB77B140E845239618695E66AA2E2F'
                });
            }
        } catch (err) {
            alert(err);
        } finally {
            this.setState({ loadingData: false });
        }


    }

    reloadBalances = async () => {
        const { balances } = this.state;
        let newBalances;
        newBalances = await Promise.all(balances.map(bl => GetBalances(bl)));
        newBalances = [].concat(...newBalances);
        this.setState({ balances: newBalances });
    }

    onSuccessQRCode = (e)=> {
        const { appStore } = this.props;
        const { data } = e
        try {
            const qrCodeData = JSON.parse(data);
            if (qrCodeData.token && qrCodeData.token === 'tron-wallet-getty') {
                appStore.set('currentTransaction', qrCodeData);
                this.props.openTransaction();
            } else {
                throw new Error();
            }
        } catch (error) {
            Alert.alert(
                'QRCode Invalid',
                'This is not a valid QRCode',
                [
                    {
                        text: 'OK', onPress: () => {
                            appStore.set('isAddModalVisible', false)
                        }
                    },
                ],
                { cancelable: false }
            )
        }
    }
    render() {
			return (
				<View style={{ flex: 1, backgroundColor: 'black', justifyContent: 'center', }}>
                    <View style={{  width: '100%', height: '100%', backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center', position: 'absolute' }}>
                        <View style={{ width: '80%', height: '50%', borderWidth: 2, borderColor: 'white' }}>
                        </View>
                        <Text style={{ color: 'white', marginTop: 16 }}>Scan the QRCode to sign the contract.</Text>
                    </View>                
					<QRCodeScanner
						showMarker
                        reactivate
                        fadeIn
						customMarker={(
							<View style={{ height: '100%', width: '100%', backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center' }}>
								<View style={{ width: '80%', height: '50%', borderWidth: 2, borderColor: 'white' }}>
								</View>
								<Text style={{ color: 'white', marginTop: 16 }}>Scan the QRCode to sign the contract.</Text>
							</View>
						)}
						cameraStyle={{ height: '100%' }}
						onRead={this.onSuccessQRCode}
					/>

				</View>
			)
    }
}

export default SendForm
