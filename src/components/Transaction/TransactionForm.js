import React, { Component } from 'react'
import { View, Text, Clipboard, Keyboard, SafeAreaView } from 'react-native'
import { TabViewAnimated, TabBar, SceneMap } from 'react-native-tab-view'
import Button from 'react-native-micro-animated-button'
import Icon from 'react-native-vector-icons/Feather'
import { observer, inject } from 'mobx-react'
import * as Animatable from 'react-native-animatable'

import {
	ContainerFlex,
	CardFlex,
	CloseButton,
	AddTransactionInput,
	AddTransactionHeaderLabel,
	ErrorLabel,
	MiniPasteButton
} from './styled'

@inject('appStore')
@observer
class TransactionForm extends Component {
	state = {
		inputValue: undefined
	}

	onPressHandler = () => {
		const { appStore } = this.props
		let { inputValue } = this.state
		if (inputValue) {
			this.submitXdr(inputValue)
			this.addButton.success()
			this.setState({ errorMessage: undefined })
			appStore.set('isAddModalVisible', false)
		} else {
			this.setState({ errorMessage: 'Invalid xdr value' })
			this.addButton.reset()
		}
	}

	submitXdr = xdr => {
		const { appStore } = this.props
		appStore.set('currentXdr', xdr)
	}

	pasteHandler = async () => {
		const content = await Clipboard.getString()
		this.setState({ inputValue: content })
	}

	render() {
		const { appStore, isVisible, type, children } = this.props
		const { inputValue, errorMessage } = this.state
		const currentXdr = appStore.get('currentXdr')

		return (
			<ContainerFlex>
				<CardFlex>
					<View style={{ flexDirection: 'row' }}>
						<AddTransactionInput
							placeholder="Paste your XDR here!"
							autoCorrect={false}
							autoCapitalize={'none'}
							clearButtonMode={'always'}
							value={inputValue}
							onChangeText={inputValue => {
								this.setState({
									inputValue
								})
							}}
							underlineColorAndroid={'white'}
							style={{ flex: 1, marginRight: 16, }}
						/>
						<MiniPasteButton onPress={this.pasteHandler}>
							<Icon name="file-text" color="gray" size={24} />
						</MiniPasteButton>
					</View>
					<ErrorLabel>{errorMessage}</ErrorLabel>
				</CardFlex>
				<Button
					ref={ref => (this.addButton = ref)}
					foregroundColor={'white'}
					backgroundColor={'#4cd964'}
					successColor={'#4cd964'}
					errorColor={'#ff3b30'}
					errorIconColor={'white'}
					successIconColor={'white'}
					shakeOnError={true}
					successIconName="check"
					label="Add"
					onPress={this.onPressHandler}
					maxWidth={100}
					style={{
						borderWidth: 0,
						alignSelf: 'center',
						marginTop: 8,
					}}
				/>
			</ContainerFlex>
		)
	}
}

export default TransactionForm
