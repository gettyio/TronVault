import React, { Component } from 'react';
import {  View, Text, SafeAreaView,  } from 'react-native';
import Icon from 'react-native-vector-icons/Feather'
import { observer, inject } from 'mobx-react'
import {
	Screen,
	Container,
	Header,
	Title,
	LoadButton,
	TextInput,
	CloseButton,
	TitleWrapper,
	LoadButtonWrapper
} from './styled'
import SendForm from '../components/Transaction/SendForm';

@inject('appStore') @observer
class QRCodeReaderScreen extends Component {

	static navigationOptions = ({ navigation }) => {
		return {
			header: (
				<SafeAreaView style={{ backgroundColor: '#2e3666' }}>
					<Header>
						<TitleWrapper>
							<Title>Add Contract</Title>
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

	openTransaction = () => {
		this.props.navigation.goBack();
		this.props.navigation.navigate('TransactionDetail');
	}

	render() {
		return (
			<SafeAreaView style={{ flex: 1 }}>
				<SendForm openTransaction={this.openTransaction} />
			</SafeAreaView>
		);
	}
}

export default QRCodeReaderScreen;