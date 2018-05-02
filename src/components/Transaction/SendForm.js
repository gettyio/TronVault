import React, { Component } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    ScrollView,
    KeyboardAvoidingView,
    Picker,
    ActivityIndicator
} from 'react-native';

import { observer, inject } from 'mobx-react';
import Icon from 'react-native-vector-icons/Feather';
import Button from 'react-native-micro-animated-button';
import PouchDB from 'pouchdb-react-native';
import SQLite from 'react-native-sqlite-2';
import SQLiteAdapterFactory from 'pouchdb-adapter-react-native-sqlite';
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
marginTop: 10px;
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
        sendStatus: false,
    }

    componentDidMount() {
        this.loadData();
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

    render() {
        let picker = !this.state.loadingData ?
            <Picker
                style={{ flex: 1, height: 50 }}
                selectedValue={this.state.balanceSelected}
                onValueChange={balanceSelected => this.setState({ balanceSelected })}>
                {this.state.balances.length ?
                    this.state.balances.map((blc, i) =>
                        <Picker.Item
                            key={i}
                            label={`Alias:${blc.alias} ${blc.name}:${blc.balance}`}
                            value={blc}
                        />) :
                    <Picker.Item key={0} label={'No accounts available'} value={null} />
                }
            </Picker> :
            <ActivityIndicator size="small" color="#0000ff" />;


        return (
            <ScrollView
                keyboardShouldPersistTaps="always"
                keyboardDismissMode="interactive"
                contentContainerStyle={{ backgroundColor: 'white', borderRadius: 5 }}
            >
                <KeyboardAvoidingView>
                    <SendInputView>
                        <InputLabel> To </InputLabel>
                        <TextInput
                            style={{ flex: 1, marginTop: 10 }}
                            autoFocus={false}
                            autoCorrect={false}
                            onChangeText={to => this.setState({ to })}
                            clearButtonMode={'always'}
                            underlineColorAndroid={'white'}
                            value={this.state.to}
                        />

                        <InputLabel> Token </InputLabel>
                        {picker}

                        <InputLabel> Amount </InputLabel>
                        <TextInput
                            style={{ flex: 1, marginTop: 10 }}
                            autoFocus={false}
                            keyboardType={'numeric'}
                            autoCorrect={false}
                            onChangeText={amount => this.setState({ amount })}
                            clearButtonMode={'always'}
                            underlineColorAndroid={'white'}
                            value={this.state.amount}
                        />
                    </SendInputView>
                    <SendButtonView>
                        <Button
                            ref={ref => (this.sendButton = ref)}
                            foregroundColor={'#276cf2'}
                            foregroundColor={'white'}
                            backgroundColor={'#276cf2'}
                            successColor={'#276cf2'}
                            errorColor={'#ff3b30'}
                            errorIconColor={'white'}
                            successIconColor={'white'}
                            successIconName="check"
                            label="Send"
                            disabled={this.state.amount == 0 || !this.state.balances.length || !this.state.to}
                            style={{ borderWidth: 0 }}
                            onPress={this.sendTransaction}
                        />
                    </SendButtonView>
                </KeyboardAvoidingView>
            </ScrollView>
        )
    }
}

export default SendForm
