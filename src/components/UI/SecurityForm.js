import React, { Component } from 'react'
import { View, Alert, Text, KeyboardAvoidingView, Keyboard } from 'react-native'
import uuid from 'uuid/v4'
import Icon from 'react-native-vector-icons/FontAwesome'
import Button from 'react-native-micro-animated-button'
import sha256 from 'crypto-js/sha256';

import {
  ContainerFlex,
  TextInput,
  ErrorLabel,
  CloseButton,
  CardFlex,
  SmallMessageLabel,
  PasswordFormTitle
} from './styled'

class SecurityForm extends Component {
  state = {
    password: undefined,
    errorMessage: undefined
	}

  savePassword = () => {
    const { close, error, submit } = this.props
    const { password } = this.state

    if (!password || (password && password.length < 8)) {
      this.setState({
        errorMessage: 'Passwords must be at least 8 characters.'
      })
      this.savePasswordButton.error()
			setTimeout(this.savePasswordButton.reset, 500)
      return
    } else {
      this.savePasswordButton.success()
			setTimeout(this.savePasswordButton.reset, 500)
    }

    this.setState({ errorMessage: undefined })
    submit(password)
    Keyboard.dismiss();
  }

  render() {
    const { hideClose, close, submit, error, version, closeColor } = this.props
    const { password, hasError, errorMessage } = this.state

    if (error && this.savePasswordButton) {
      setTimeout(this.savePasswordButton.reset, 0)
    }

    return (
      <View style={{ flex: 1, paddingLeft: 16, paddingRight: 16, backgroundColor: '#2f3864' }}>
        {!hideClose && (
          <CloseButton onPress={close}>
            <Icon name="times-circle" color={closeColor || 'white'} size={32} />
          </CloseButton>
        )}
        <CardFlex>
          <PasswordFormTitle testID='passwordTitle'>Type a password to continue.</PasswordFormTitle>
          <TextInput
            autoFocus={false}
            autoCorrect={false}
            autoCapitalize={'none'}
            clearButtonMode={'always'}
            placeholder="Type your password here."
            onChangeText={password => this.setState({ password })}
            value={password}
            underlineColorAndroid={'white'}
          />
          <View>
            {errorMessage && <ErrorLabel>{errorMessage}</ErrorLabel>}
            {error && <ErrorLabel>{error}</ErrorLabel>}
          </View>
          <SmallMessageLabel>
            Please, disconnect your phone from the network before log in. You can use the airplane mode.
          </SmallMessageLabel>
          <SmallMessageLabel>
            Enter the password to protect your secrets. The password can't be changed later. This password is specific for this device and will be stored in your phone.
            Make sure to remember your password, as you'll need it when you sign transactions with TronVault. Keep your password secure.
          </SmallMessageLabel>
        </CardFlex>
        <KeyboardAvoidingView behavior="position">
          <View style={{ alignSelf: 'center' }}>
            <Button
              ref={ref => (this.savePasswordButton = ref)}
              onPress={this.savePassword}
              foregroundColor={'white'}
              backgroundColor={'#4cd964'}
              successColor={'#4cd964'}
              errorColor={'#ff3b30'}
              errorIconColor={'white'}
              successIconColor={'white'}
              successIconName="check"
              label="Ok"
              maxWidth={100}
              style={{ marginLeft: 16, borderWidth: 0 }}
            />
          </View>
        </KeyboardAvoidingView>
      </View>
    )
  }
}

export default SecurityForm
