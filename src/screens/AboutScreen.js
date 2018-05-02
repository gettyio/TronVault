import React, { Component } from 'react'
import { SafeAreaView, View, Text, ScrollView } from 'react-native'
import {
	Screen,
	ContainerFlex,
	Header,
	Title,
	TitleWrapper,
	AboutNamesText,
	AboutHeader,
	AboutTitle
} from './styled'
import { version } from './../../package.json'

class AboutScreen extends Component {

	static navigationOptions = ({ navigation }) => {
		const params = navigation.state.params || {};
		return {
			header: (
				<SafeAreaView style={{ backgroundColor: '#2e3666' }}>
					<Header>
						<TitleWrapper>
							<Title>About <Text style={{ fontSize: 10 }}>{`v${version}`}</Text></Title>
						</TitleWrapper>
					</Header>
				</SafeAreaView>
			)
		};
	};

	render() {
		return (
			<Screen style={{ backgroundColor: 'white' }}>
				<ScrollView>
					<ContainerFlex style={{ paddingBottom: 48 }}>
						<View>
							<AboutHeader>
								<AboutTitle>Tron Wallet </AboutTitle>
								{/* is a new and free secure key store app to sign Stellar transactions.
										With StellarSigner you never share your secret keys with third party services.
										StellarSigner is designed to be among the most secure mobile apps to sign Stellar transactions.
										StellarSigner can already sign transactions submitted to it from other apps or through the copy/paste buffer.
										StellarSigner is also a standalone app and any application that wishes to use it, including websites can use it to sign their transactions. */}
							</AboutHeader>

							<AboutTitle>Contributors</AboutTitle>
							{/* <AboutNamesText>Thanks goes to these wonderful people: 😃</AboutNamesText>
							<AboutNamesText>> @dbuarque</AboutNamesText>
							<AboutNamesText>> @mikefair</AboutNamesText>
							<AboutNamesText>> @marlonbrgomes</AboutNamesText>
							<AboutNamesText>> @vitorpereira</AboutNamesText>
							<AboutNamesText>> @julianorafael</AboutNamesText>
							<AboutNamesText>> @jordancassiano</AboutNamesText>
							<AboutNamesText>> @pnakibar</AboutNamesText>
							<AboutNamesText>> @nilocoelhojunior</AboutNamesText>
							<AboutNamesText>> @leocolodette</AboutNamesText>
							<AboutNamesText>> @jai</AboutNamesText>
							<AboutNamesText>> @gettyio</AboutNamesText>
							<AboutTitle>Powered by Getty/IO Inc.</AboutTitle> */}
							<AboutNamesText>www.getty.io</AboutNamesText>
						</View>
					</ContainerFlex>
				</ScrollView>
			</Screen>
		)
	}
}

export default AboutScreen
