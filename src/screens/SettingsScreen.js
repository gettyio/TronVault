import React, { Component, Fragment } from 'react'
import { SafeAreaView, View, Text, Alert, Clipboard, TouchableOpacity, ScrollView } from 'react-native'
import { observer, inject } from 'mobx-react'
import Icon from 'react-native-vector-icons/Feather'
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
import { List, ListItem } from 'react-native-elements'
import SInfo from 'react-native-sensitive-info';
import PouchDB from 'pouchdb-react-native'
import SQLite from 'react-native-sqlite-2'
import SQLiteAdapterFactory from 'pouchdb-adapter-react-native-sqlite'

const SQLiteAdapter = SQLiteAdapterFactory(SQLite)
PouchDB.plugin(SQLiteAdapter)
const secretsDB = new PouchDB('Secrets', { adapter: 'react-native-sqlite' })

PouchDB.plugin(require('pouchdb-upsert'))
const transactionsDB = new PouchDB('Transactions', { adapter: 'react-native-sqlite' })


@inject('appStore') @observer
class SettingsScreen extends Component {

	static navigationOptions = ({ navigation }) => {
		const params = navigation.state.params || {};

		return {
			header: (
				<SafeAreaView style={{ backgroundColor: '#2e3666' }}>
					<Header>
						<TitleWrapper>
							<Title>Settings</Title>
						</TitleWrapper>
					</Header>
				</SafeAreaView>
			)
		};
	};

	deleteAllData = () => {
		Alert.alert(
			`Are you sure?`,
			`This action will destroy everything. Are you sure?`,
			[
				{
					text: 'Delete',
					onPress: this.deleteSeed,
					style: 'cancel'
				},
				{ text: 'Close', onPress: () => {} } // Do not button
			],
			{ cancelable: false }
		)
	}

	deleteAllContracts = () => {
		Alert.alert(
			`Are you sure?`,
			`This action will destroy all contracts. Are you sure?`,
			[
				{
					text: 'Delete',
					onPress: () => {
						transactionsDB.allDocs().then(function (result) {
							// Promise isn't supported by all browsers; you may want to use bluebird
							return Promise.all(result.rows.map(function (row) {
							  return transactionsDB.remove(row.id, row.value.rev);
							}));
						  }).then(function () {
							alert('All contracts deleted with success!')
						  }).catch(function (err) {
							alert(err.message)
						  });
					},
					style: 'cancel'
				},
				{ text: 'Close', onPress: () => {} } // Do not button
			],
			{ cancelable: false }
		)
	}

	deleteAllAddresses = () => {
		Alert.alert(
			`Are you sure?`,
			`This action will destroy all addresses. Are you sure?`,
			[
				{
					text: 'Delete',
					onPress: () => {
						secretsDB.allDocs().then(function (result) {
							// Promise isn't supported by all browsers; you may want to use bluebird
							return Promise.all(result.rows.map(function (row) {
							  return secretsDB.remove(row.id, row.value.rev);
							}));
						  }).then(function () {
							alert('All addresses deleted with success!');
						  }).catch(function (err) {
							alert(err.message)
						  });
					},
					style: 'cancel'
				},
				{ text: 'Close', onPress: () => {} } // Do not button
			],
			{ cancelable: false }
		)
	}

	deleteSeed = async () => {
		try {
			const { appStore, navigation } = this.props
			const items = await SInfo.getAllItems({});
			items.forEach(async element => {
				await SInfo.deleteItem(element.key, {});
			});

			const emptyStore = {
				sk: undefined,
				pwd: undefined,
				seed: undefined,
				secretList: undefined,
				isAddModalVisible: false,
				isAddSecretModalVisible: false,
				isSecurityRequired: false,
				isDetailModalVisible: false,
				currentXdr: undefined,
				currentLink: undefined,
				currentAccount: undefined,
				currentTransaction: undefined,
				securityFormError: undefined,
				balances: []
			  }
			  appStore.replace(emptyStore);
			navigation.navigate('Auth');
		} catch (error) {
			alert(error.message);
		}
	}
	

	render() {
		const { appStore, navigation } = this.props
		const defaultList = [
			{
				name: 'My secret words',
				icon: 'lock',
				onPress: ()=> {
					navigation.navigate('ManageSeed')
				}
			}
		];
		const criticalList = [

			{
				name: 'Delete all contracts',
				icon: 'delete',
				onPress: ()=> {
					this.deleteAllContracts();
				}
			},
			{
				name: 'Delete all addresses',
				icon: 'delete',
				onPress: ()=> {
					this.deleteAllAddresses();
				}
			},			
			{
				name: 'Reset all data',
				icon: 'autorenew',
				onPress: ()=> {
					this.deleteAllData();
				}
			}
		];
		
		return (
			<View>
				<List style={{ backgroundColor: 'white' }}>
					{
						defaultList.map((item, index) => (
							<ListItem
								key={index}
								leftIcon={{ name: item.icon }}
								title={item.name}
								onPress={()=> item.onPress() }
							/>
						))
					}
				</List>
				<List style={{ backgroundColor: 'white' }}>
					{
						criticalList.map((item, index) => (
							<ListItem
								key={index}
								leftIcon={{ name: item.icon }}
								title={item.name}
								onPress={()=> item.onPress() }
							/>
						))
					}
				</List>				
			</View>
			
		)
	}
}

export default SettingsScreen
