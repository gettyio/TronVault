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
  AccountLabel,
  TypeLabel,
  TypeCard
} from './styled'

const TransactionRow = ({ item, appStore, navigation }) => {

  const renderTxDetails = () => {
    const txDetails = item.transactionDetails;
    const elements = [];
    for (let detail in txDetails) {
      if (detail !== 'Type' && detail !== 'Amount') {
        elements.push(<LabelsRow key={detail}>
          <AccountLabel>{`${detail} : ${txDetails[detail]}`}</AccountLabel>
        </LabelsRow>)
      }
    }
    return elements;
  }

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
  if (item.status === 'SIGNED') {
    iconName = 'check-circle'
    iconColor = '#3ED235'
  }
  const { Amount, Type } = item.txDetails;
  return (
    <TouchableOpacity key={item.id}
      onPress={() => {
        appStore.set('currentTransaction', item)
        navigation.navigate('TransactionDetail')
      }}>
      <TransactionRowWrapper>
        <CardWrapper pad="3px">
          <Icon name={iconName} color={iconColor} size={32} />
          <CardContent>
            <TypeCard>
              <TypeLabel>{`${Type}`}</TypeLabel>
            </TypeCard>
            {Amount && <AmountCard>
              <AmountLabel>{`${Amount} TRX`}</AmountLabel>
            </AmountCard>}
            {renderTxDetails()}
            <LabelsRow>
              <StatusLabel status={item.status}>{item.status}</StatusLabel>
              <CreatedAtLabel>
                {`(${moment(new Date(item.createdAt)).format('YYYY-MM-DD hh:mm')})`}
              </CreatedAtLabel>
            </LabelsRow>
          </CardContent>
        </CardWrapper>
      </TransactionRowWrapper>
    </TouchableOpacity >
  )
}

export default withNavigation(TransactionRow);