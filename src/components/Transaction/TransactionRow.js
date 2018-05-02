import React from 'react'
import { TouchableOpacity } from 'react-native'
import styled from 'styled-components'
import moment from 'moment'
import { withNavigation } from 'react-navigation';
import Icon from 'react-native-vector-icons/Feather'

import {
  Screen,
  Container,
  EmptyScreen,
  CardWrapper,
  CardContent,
  ErrorMessageLabel,
  ErrorInputValueLabel,
  TransactionRowWrapper,
  AmountCard,
  AmountLabel,
  LabelsRow,
  CreatedAtLabel,
  StatusLabel,
  AccountInfoCard,
  AccountLabel
} from './styled'

const TransactionRow = ({ item, appStore, navigation }) => {
  if (item.type === 'error') {
    return (
      <TouchableOpacity
        key={item.id}
        onPress={() => {
          appStore.set('currentTransaction', item)
          navigation.navigate('TransactionDetail')
        }}
      >
        <TransactionRowWrapper>
          <CardWrapper pad="8px">
            <Icon name="x-circle" color="red" size={32} />
            <CardContent>
              <ErrorMessageLabel>{`${item.message}`}</ErrorMessageLabel>
              <ErrorInputValueLabel>{`XDR: ${item.xdr}`}</ErrorInputValueLabel>
              <LabelsRow>
                <StatusLabel status={item.status}>{item.status}</StatusLabel>
                <CreatedAtLabel>
                  {`${moment(new Date(item.createdAt)).format('YYYY-MM-DD hh:mm')}`}
                </CreatedAtLabel>
              </LabelsRow>
            </CardContent>
          </CardWrapper>
        </TransactionRowWrapper>
      </TouchableOpacity>
    )
  }

  let iconName
  let iconColor
  if (item.status === 'CREATED') {
    iconName = 'alert-circle'
    iconColor = '#2e3666'
  } else if (item.status === 'REJECTED') {
    iconName = 'stop-circle'
    iconColor = 'red'
  } else if (item.status === 'SIGNED') {
    iconName = 'check-circle'
    iconColor = '#3ED235'
  }

  return (
    <TouchableOpacity key={item.id}
      onPress={() => {
        appStore.set('currentTransaction', item)
        navigation.navigate('TransactionDetail')
      }}>
      <TransactionRowWrapper>
        <CardWrapper pad="8px">
          <Icon name={iconName} color={iconColor} size={32} />
          <CardContent>
            <AmountCard>
              <AmountLabel>{`${item.amount} XLM`}</AmountLabel>
            </AmountCard>
            <LabelsRow>
              <AccountLabel>{`${item.memo}`}</AccountLabel>
            </LabelsRow>
            <LabelsRow>
              <StatusLabel status={item.status}>{item.status}</StatusLabel>
              <CreatedAtLabel>
                {`(${moment(new Date(item.createdAt)).format('YYYY-MM-DD hh:mm')})`}
              </CreatedAtLabel>
            </LabelsRow>
          </CardContent>
        </CardWrapper>
      </TransactionRowWrapper>
    </TouchableOpacity>
  )
}

export default withNavigation(TransactionRow);