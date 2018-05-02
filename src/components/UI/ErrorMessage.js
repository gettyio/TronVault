import React from 'react'
import styled from 'styled-components'
import { Text } from 'react-native'
import Icon from 'react-native-vector-icons/Feather'

import { Container, CardFlat, CardRow, CardLabel, CardTitle } from './styled'

export default ({ tx }) => (
  <Container>
    <CardFlat>
      <CardRow>
        <Icon name="x-circle" color="red" size={32} />
        <CardTitle>Error</CardTitle>
      </CardRow>
      <CardRow flexx="column" align="flex-start">
        <CardLabel>{tx.message}</CardLabel>
        <CardLabel>{`XDR: ${tx.xdr}`}</CardLabel>
      </CardRow>
    </CardFlat>
  </Container>
)
