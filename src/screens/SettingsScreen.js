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
import { ListItem } from 'react-native-elements'

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

	state = {

	}

	render() {
		const { appStore, navigation } = this.props
		const { } = this.state
		const list = [
			{
				name: 'Manage Seed',
				icon: 'lock',
				screen: 'ManageSeed'
			}
		];
		
		return (
			<View>
				{
					list.map((item, index) => (
						<ListItem
							key={index}
							leftIcon={{ name: item.icon }}
							title={item.name}
							onPress={()=> navigation.navigate(item.screen) }
						/>
					))
				}
			</View>
			
		)
	}
}

export default SettingsScreen
