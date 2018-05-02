import React, { Component, Fragment, Image } from 'react'
import { Provider } from 'mobx-react'
import { StackNavigator } from 'react-navigation'
import { TabNavigator, TabBarBottom } from 'react-navigation'
import Icon from 'react-native-vector-icons/Feather'
import IconFA from 'react-native-vector-icons/FontAwesome'
import HomeScreen from './screens/HomeScreen'
import SecretsScreen from './screens/SecretsScreen'
import AuthScreen from './screens/AuthScreen'
import AboutScreen from './screens/AboutScreen'
import CreateVaultScreen from './screens/CreateVaultScreen'
import TransactionDetailScreen from './screens/TransactionDetailScreen'
import AccountDetailScreen from './screens/AccountDetailScreen';
import SettingsScreen from './screens/SettingsScreen';
import ManageSeedScreen from './screens/ManageSeedScreen';
import store from './store'
console.disableYellowBox = true;

const NavigationStack = TabNavigator(
  {
    Secrets: {
      screen: SecretsScreen
		},
		Settings: {
			screen: SettingsScreen
		}
  },
  {
    navigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ focused, tintColor }) => {
        const { routeName } = navigation.state
        let iconName
        if (routeName === 'Home') {
          iconName = `book`
        } else if (routeName === 'Secrets') {
          iconName = `shield`
        } else if (routeName === 'Settings') {
          iconName = `settings`
        } else if (routeName === 'Receive') {
          iconName = `qrcode`
				}
				
				if (iconName === 'qrcode') {
					return <IconFA name={iconName} size={25} color={tintColor} />
				}

        return <Icon name={iconName} size={25} color={tintColor} />
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      }
    }),
    tabBarPosition: 'bottom',
    tabBarComponent: TabBarBottom,
    animationEnabled: true,
    lazy: false,
    tabBarOptions: {
      activeTintColor: '#2e3666',
      inactiveTintColor: 'gray',
      showLabel: false,
      style: {
        height: 45,
        backgroundColor: 'white'
      }
    },
    animationEnabled: true,
    swipeEnabled: false
  }
)

const DetailStack = TabNavigator(
  {
    EnvelopeCard: {
      screen: HomeScreen
    },
    EnvelopeTreeRaw: {
      screen: SecretsScreen
    },
    EnvelopeTreeSigned: {
      screen: AboutScreen
		}
  },
  {
    navigationOptions: ({ navigation }) => ({
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      }
    }),
    tabBarPosition: 'bottom',
    tabBarComponent: TabBarBottom,
    animationEnabled: true,
    lazy: false,
    tabBarOptions: {
      activeTintColor: '#2e3666',
      inactiveTintColor: 'gray',
      showLabel: false,
      style: {
        height: 45,
        backgroundColor: 'white'
      }
    },
    animationEnabled: true,
    swipeEnabled: false
  }
)


const RootStack = StackNavigator(
  {
    Main: {
      screen: NavigationStack,
    },
    AuthModal: {
      screen: AuthScreen,
    },
    CreateVault: {
      screen: CreateVaultScreen,
		},
		AccountDetail: {
			screen: AccountDetailScreen
		},
		ManageSeed: {
			screen: ManageSeedScreen
		}
  },
  {
    initialRouteName: 'AuthModal',
    mode: 'modal'
  }
);

export default (() => (
  <Provider appStore={store} >
    <RootStack />
  </Provider>
))
