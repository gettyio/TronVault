import React, { Component } from 'react'
import { View, Image, Text, TouchableOpacity } from 'react-native'
import moment from 'moment'
import styled from 'styled-components'

import {
  Row, 
  AliasLabel, 
  PKLabel, 
  SKLabel, 
  DateLabel
} from './styled';

const SecretRow = ({ item, appStore, onPress }) => {
  const pk = item.pk;
  return (
    <TouchableOpacity onPress={() => onPress(item)}>
      <Row>
        <AliasLabel>{`${item.alias}`}</AliasLabel>
        <PKLabel>{`${pk.slice(0, 8)}...${pk.substr(pk.length - 8)}`}</PKLabel>
        <DateLabel>
          {`${moment(new Date(item.createdAt)).format('YYYY-MM-DD hh:mm')}`}
        </DateLabel>
      </Row>
    </TouchableOpacity>
  )
}

export default SecretRow
