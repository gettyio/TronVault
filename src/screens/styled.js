import styled from 'styled-components'

export const Container = styled.View`
  height: ${props => (props.height ? props.height : 'auto')};
`

export const ContainerFlex = styled.View`
  flex: 1;
`
export const ContainerCentered = styled.View`
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
`
export const Card = styled.View`
  background-color: white;
  border-radius: 16px;
  padding: 16px;
  align-self: center;
`
export const CardFlex = styled.View`
  width: 100%;
  background-color: white;
  border-radius: 16px;
  padding: 8px;
  align-self: center;
`
export const Screen = styled.View`
	flex: 1;
	background-color: white;
`
export const Header = styled.View`
  height: 90px;
  flex-direction: row;
  align-items: center;
  background-color: #2e3666;
`
export const ErrorLabel = styled.Text`
  margin-top: 8px;
  font-size: 12px;
  color: red;
`

export const SuccessLabel = styled.Text`
  margin-top: 8px;
  font-size: 12px;
  color: green;
`

export const LoadButton = styled.TouchableOpacity`
  height: 32px;
  width: 32px;
  border-radius: 10px;
`

export const LoadButtonWrapper = styled.View`
  height: 50px;
  width: 50px;
	align-self: center;
	justify-content: center;
`

export const Title = styled.Text`
  color: white;
  font-weight: 700;
  padding-left: 16;
  font-size: 26;
`


export const TitleWrapper = styled.View`
	flex: 1;
	height: 100%;
	background-color: #2e3666;
	justify-content: center;
`

export const CloseButton = styled.TouchableOpacity`
  margin-right: 8px;
  margin-bottom: 8px;
  align-self: flex-end;
  z-index: 1;
`

export const TextInput = styled.TextInput`
	height: ${props => (props.height ? props.height : '40px')};
  padding: 8px;
  background-color: white;
  color: #a0a0a0;
	border-width: 1px;
	border-color: #cecece;
	margin-bottom: 8px;
	border-radius: 8px;
`

export const CreatePairKeyView = styled.View`
  flex: 1;
  flex-direction: row;
  padding-top: 8px;
  margin-bottom: 16px; 
  align-self: center;
`

export const SecretLabel = styled.Text`
  color: white;
  font-size: 12px; 
  margin-bottom: 8px;
  font-weight: ${props => (props.weight ? props.weight : 'normal')};
`

export const SeedWord = styled.Text`
	color: #1d2028;
	font-size: 16px;
	padding: 2px;
`

export const SeedBox = styled.View`
	margin-top: 16px; 
	margin-bottom: 16px; 
	padding: 16px; 
	flex-direction: row;
	flex-wrap: wrap; 
  border-width: 2px; 
  border-radius: 12px;
	border-color: #cccccc;
`

export const InsertSeedInput = styled.TextInput`
  font-size: 16px;
  border-width: 2px;
  border-color: #cccccc;
  border-radius: 12px;
  width: 100%;
  height: 90px;
  padding: 16px;
`
export const AboutNamesText = styled.Text`
  font-size: 14px;
  padding-top: 8px;
  padding-left: 16px;
  line-height: 8px;
  padding-bottom: 16px;
`

export const AboutTitle = styled.Text`
  font-size: 14px;
  font-weight: 700;
  padding: 16px;
`
export const AboutHeader = styled.Text`
  font-size: 14px;
  padding: 16px;
  line-height: 24px;
  text-align: justify;
`
export const AuthLogoView = styled.View`
  align-self: center;
  backgroundColor: #2f3864;
  margin-top: 16px; 
`
export const AuthVersionText = styled.Text`
  color: white;
  font-size: 10px; 
`
export const AuthVersionWrapper = styled.View`
  align-self: center;
`

export const VaultWordsText = styled.Text`
  padding: 4px;
  textAlign: justify;
  fontWeight: 700;
`
export const MessageLabel = styled.Text`
font-weight: 700;
color: #344B67;
`