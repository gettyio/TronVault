import React, { PureComponent } from 'react'
import { Clipboard, View, Keyboard } from 'react-native'
import * as Animatable from 'react-native-animatable'

import { PasteButton, PasteButtonLabel } from './styled'

export default class PasteBtn extends PureComponent {
  pasteHandler = async () => {
    const { setAccountValue } = this.props

    const content = await Clipboard.getString()
    //console.log('content', content)
    this.refs.pasteButtonView.fadeOutLeft(300).then(
      () => setAccountValue(content),
      () => {
        Keyboard.dismiss()
      }
    )
  }

  render() {
    const { account } = this.props
    if (!account || account === '') {
      return (
        <Animatable.View
          ref="pasteButtonView"
          style={{ position: 'absolute', marginTop: 18, marginLeft: -6 }}
        >
          <PasteButton onPress={() => this.pasteHandler()}>
            <PasteButtonLabel>
              Click to paste your public key or start type.
            </PasteButtonLabel>
          </PasteButton>
        </Animatable.View>
      )
    }

    return null
  }
}
