import React, { Component } from 'react'
import {
    View,
    Text,
    ScrollView,
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    SafeAreaView,
    Clipboard,
    Image,
    Keyboard,
    Linking,
    FlatList,
    TouchableOpacity
} from 'react-native'
import Modal from 'react-native-modal'
import uuid from 'uuid/v4'
import { observer, inject } from 'mobx-react'
import { sortBy } from 'lodash'
import PouchDB from 'pouchdb-react-native'
import SQLite from 'react-native-sqlite-2'
import SQLiteAdapterFactory from 'pouchdb-adapter-react-native-sqlite'
import Icon from 'react-native-vector-icons/Feather'
import Button from 'react-native-micro-animated-button'
import SInfo from 'react-native-sensitive-info'
import SecretList from '../components/Secret/SecretList'
import moment from 'moment';
import qs from 'qs'
import styled from 'styled-components'

const EmptyScreen = styled.View`
  align-items: center;
  padding-top: 16px;
	background-color: white;
`

const Row = styled.View`
  padding: 16px;
  border-bottom-width: 0.3px;
  border-color: #d3d3d3;
`
const AliasLabel = styled.Text`
  font-size: 16px;
  color: #333;
  font-weight: 700;
  align-self: center;
`
const PKLabel = styled.Text`
  font-size: 14px;
  color: #333;
  font-weight: 700;
  align-self: center;
`

const DateLabel = styled.Text`
  font-size: 12px;
  margin-top: 8px;
  color: #555;
  align-self: center;
`

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

const { width, height } = Dimensions.get('window');

@inject('appStore') @observer
class SecretsScreen extends Component {

    static navigationOptions = ({ navigation }) => {
        const params = navigation.state.params || {};
        return {
            header: (
                <SafeAreaView style={{ backgroundColor: '#2e3666' }}>
                    <Header>
                        <TitleWrapper>
                            <Title>Get Key Screen</Title>
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
            self.setState({ secrets });
        })
    }

    componentWillMount() {
        this.props.navigation.setParams({ toggleAddModal: this.toggleAddModal, loadData: this.loadData });
    }

    toggleAddModal = () => {
        const { appStore } = this.props
        appStore.set('isAddSecretModalVisible', !appStore.get('isAddSecretModalVisible'));
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

				const keypair = generateTronKeypair(seed, userPath);
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

    navigateBack = async (pk) => {
        const { navigation } = this.props;

        const dataToSend = qs.stringify({
            pk,
            action: 'setpk'
        })
        const deepLinkUrl = `${navigation.state.params.url}/${dataToSend}`;

        const supported = await Linking.canOpenURL(deepLinkUrl)
        if (supported) {
            Linking.openURL(deepLinkUrl);
        }
        navigation.navigate('Home');
        return;
    }

    showConfirmCopy = (pk) => {

        Alert.alert(
            'Is this public key to copy ? ',
            `${pk}`,
            [
                { text: 'Cancel', onPress: () => { } },
                { text: 'Confirm', onPress: () => this.navigateBack(pk) },
            ],
            { cancelable: true }
        )
    }

    renderRow = ({ item }) => {
        return <TouchableOpacity onPress={() => this.showConfirmCopy(item.pk)}>
            <Row>
                <AliasLabel>{`${item.alias}`}</AliasLabel>
                <PKLabel>{`${item.pk}`}</PKLabel>
                <DateLabel>
                    {`${moment(new Date(item.createdAt)).format('YYYY-MM-DD hh:mm')}`}
                </DateLabel>
            </Row>
        </TouchableOpacity>
    }

    render() {
        const { appStore, navigation } = this.props
        const { sk, alias, userPath, hasError, secrets } = this.state
        const isAddSecretModalVisible = appStore.get('isAddSecretModalVisible')

        return (
            <Screen>
                {
                    secrets.length < 1 ?
                        <EmptyScreen style={{ height: height, backgroundColor: 'white' }}>
                            <Image
                                source={require('../assets/empty.png')}
                                resizeMode="contain"
                                style={{ width: 170 }}
                            />
                            <Text style={{ fontWeight: '700', color: '#344B67' }}>
                                No addresses found!
                            </Text>
                        </EmptyScreen>
                        :
                        <FlatList
                            data={secrets}
                            removeClippedSubviews={true}
                            renderItem={this.renderRow}
                            keyExtractor={(item, index) => `${item._id}`}
                        />
                }
                <TouchableOpacity onPress={() => navigation.navigate('Home')}>
                    <Text style={{ textAlign: 'center', marginVertical: 10, fontWeight: '700', color: '#344B67' }}>Back to Home</Text>
                </TouchableOpacity>
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
                                        placeholder="Type an alias for this address."
                                        onChangeText={text => this.setState({ alias: text })}
                                        clearButtonMode={'always'}
                                        underlineColorAndroid={'white'}
                                        value={alias}
                                    />
                                    <TextInput
                                        keyboardType={'numeric'}
                                        autoCorrect={false}
                                        autoFocus={false}
                                        placeholder="Type a numeric password for your address."
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
