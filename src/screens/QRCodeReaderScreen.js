import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  TouchableOpacity,
  Linking,
  Alert,
  SafeAreaView
} from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import Icon from 'react-native-vector-icons/Feather'
import { observer, inject } from 'mobx-react';
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

@inject('appStore') @observer
class QRCodeReaderScreen extends Component {

  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};

    return {
      header: (
        <SafeAreaView style={{ backgroundColor: '#2e3666' }}>
          <Header>
            <TitleWrapper>
              <Title>Sign Transactions</Title>
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

  onSuccess(e) {
    const { appStore } = this.props;
    const { data } = e
    const qrCodeData = JSON.parse(data);
    appStore.set('currentTransaction', qrCodeData);
    this.props.navigation.navigate('TransactionDetail');
    this.props.navigation.goBack();
    // this.props.navigation.state.params.callback(JSON.parse(data))
  }
  componentDidMount() {
    const { appStore } = this.props;
    const qrCodeData = {"data":"Cgdw1s/sr7Us","type":"SEND","URL":"http://192.168.0.7:8000/#/user/validate","pk":"27bgx6xgnsp3wzNhtzjjGixNWjbQf9medaY"}
    appStore.set('currentTransaction', qrCodeData);
    this.props.navigation.navigate('TransactionDetail', {
      data: qrCodeData
    })
  }
  render() {
    return (
      <QRCodeScanner
        onRead={this.onSuccess.bind(this)}
        topContent={
          <Text style={styles.centerText}>
            Scan the transaction to be submitted
          </Text>
        }
      />
    );
  }
}

const styles = StyleSheet.create({
  centerText: {
    flex: 1,
    fontSize: 18,
    padding: 32,
    color: '#777',
  },
  textBold: {
    fontWeight: '500',
    color: '#000',
  },
  buttonText: {
    fontSize: 21,
    color: 'rgb(0,122,255)',
  },
  buttonTouchable: {
    padding: 16,
  },
});

export default QRCodeReaderScreen;
