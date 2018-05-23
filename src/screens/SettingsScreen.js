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

	deleteAllData = () => {
		Alert.alert(
			`Are you sure?`,
			`This action will destroy everything. Are you sure?`,
			[
				{
					text: 'Delete',
					onPress: () => {},
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
					onPress: () => {},
					style: 'cancel'
				},
				{ text: 'Close', onPress: () => {} } // Do not button
			],
			{ cancelable: false }
		)
	}

	render() {
		const { appStore, navigation } = this.props
		const defaultList = [
			{
				name: 'Manage Seed',
				icon: 'lock',
				onPress: ()=> {
					navigation.navigate('ManageSeed')
				}
			}
		];
		const criticalList = [

			{
				name: 'Delete all contracts',
				icon: 'close',
				onPress: ()=> {
					this.deleteAllContracts();
				}
			},
			{
				name: 'Reset all data',
				icon: 'close',
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
