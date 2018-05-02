import styled from 'styled-components'

export const Container = styled.View`
  height: ${props => (props.height ? props.height : 'auto')};
`

export const ContainerFlex = styled.View`
  flex: 1;
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

export const CardFlat = styled.View`
  width: 100%;
  background-color: white;
  padding: 16px;
  align-self: center;
`

export const CardRow = styled.View`
  flex-direction: ${props => (props.flexx ? props.flexx : 'row')};
  align-items: ${props => (props.align ? props.align : 'center')};
`

export const CardTitle = styled.Text`
  font-size: 16px;
  font-weight: 700;
  padding-left: 8px;
`

export const PasteButton = styled.TouchableOpacity`
  border-radius: 10px;
  background-color: #cecece;
  border-width: 1px;
  border-color: #cecece;
`
export const PasteButtonLabel = styled.Text`
  padding: 10px;
  font-size: 14px;
  font-weight: 600;
  color: white;
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
export const ErrorLabel = styled.Text`
  margin-top: 8px;
  font-size: 12px;
  color: red;
`
export const CloseButton = styled.TouchableOpacity`
  margin-right: 8px;
  margin-bottom: 8px;
  align-self: flex-end;
  z-index: 1;
`

export const MessageLabel = styled.Text`
font-weight: 700;
color: #344B67;
`

export const SmallMessageLabel = styled.Text`
	padding-top: 16px;
  font-size: 10px;
  color: #464646;
`

export const PasswordFormTitle = styled.Text`
	margin-bottom: 16px;
  padding-top: 8px;
  font-size: 16px;
  font-weight: 700;
  color: #464646;
`
export const CardLabel = styled.Text`
  font-size: 12px;
  padding-top: 8px;
`

export const EmptyScreen = styled.View`
  align-items: center;
  padding-top: 16px;
	background-color: white;
`