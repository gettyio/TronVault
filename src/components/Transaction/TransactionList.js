import React, { Component } from 'react'
import {
  Platform,
  StyleSheet,
  View,
  Text,
  FlatList,
  WebView,
  Keyboard,
  Clipboard,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  AsyncStorage
} from 'react-native'
import moment from 'moment'
import Icon from 'react-native-vector-icons/FontAwesome'
import { observer, inject } from 'mobx-react'
import TransactionRow from './TransactionRow'
import {
  Container,
  EmptyScreen
} from './styled'
// import { schema } from './../store/db';
// import { createDb } from './../store/db'

@inject('appStore') @observer
class TransactionList extends Component {
  state = {
    transactions: [],
    currentTx: undefined,
    hasError: undefined,
    isLoadingList: true,
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ transactions: nextProps.transactions, isLoadingList: nextProps.isLoadingList })
  }

  renderRow = ({ item }) => {
    const { appStore, navigation } = this.props
    return <TransactionRow item={item} appStore={appStore} />
  }

  render() {
    const { height } = Dimensions.get('window')
    const { hasError, transactions, isLoadingList } = this.state

    if (isLoadingList) {
      return (
        <View style={{ flex: 1, marginTop: 64 }}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )
    }

    if (hasError) {
      return (
        <View>
          <Text>Error</Text>
        </View>
      )
    }

    if (transactions.length < 1) {
      return (
        <EmptyScreen style={{ height: '100%' }}>
          <Image
            source={require('../../assets/empty.png')}
            resizeMode="contain"
            style={{ width: 170 }}
          />
          <Text style={{ fontWeight: '700', color: '#344B67' }}>
            No Transactions Found!
          </Text>
        </EmptyScreen>
      )
    }

    return (
      <View style={{ height: height - 142 }}>
        <FlatList
          data={transactions}
          removeClippedSubviews={true}
          renderItem={this.renderRow}
          keyExtractor={(item, index) => `${item._id}`}
        />
      </View>
    )
  }
}

export default TransactionList
