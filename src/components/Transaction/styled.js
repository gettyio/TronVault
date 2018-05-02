import styled from 'styled-components'

export const ContainerFlex = styled.View`
  flex: 1;
`

export const CardFlex = styled.View`
  width: 100%;
  background-color: white;
  border-radius: 16px;
  padding: 8px;
  align-self: center;
`

export const CloseButton = styled.TouchableOpacity`
  margin-right: 8px;
  margin-bottom: 8px;
  align-self: flex-end;
  z-index: 1;
`

export const AddTransactionHeaderLabel = styled.Text`
  font-size: 16px;
  font-weight: 700;
  color: #333;
`

export const AddTransactionInput = styled.TextInput`
  height: 60px;
  width: 100%;
  color: #344b67;
  padding: 8px;
  align-content: flex-start;
  background-color: white;
  border-radius: 16px;
`
export const ErrorLabel = styled.Text`
  margin-top: 8px;
  font-size: 12px;
  color: red;
`

export const MiniPasteButton = styled.TouchableOpacity`
  border-radius: 10px;
  border-color: #cecece;
	align-self: center;
`
export const Screen = styled.View`
  display: flex;
	background-color: white;
`
export const EmptyScreen = styled.View`
  align-items: center;
  padding-top: 16px;
	background-color: white;
`
export const CardWrapper = styled.View`
  padding: ${props => (props.pad ? props.pad : '0px')};
  flex-direction: row;
  align-items: center;
`

export const CardContent = styled.View`
  flex: 1;
  margin-left: 16px;
`
export const ErrorMessageLabel = styled.Text`
  color: #333;
  font-weight: 700;
`

export const ErrorInputValueLabel = styled.Text`
  padding-top: 4px;
`
export const TransactionRowWrapper = styled.View`
  padding: 8px;
  border-bottom-width: 0.3px;
  border-color: #cecece;
`
export const AccountInfoCard = styled.View`
  border-radius: 10px;
`

export const AmountCard = styled.View`
  bottom: 0;
  margin-bottom: 8px;
  width: auto;
  align-self: flex-end;
`
export const LabelsRow = styled.View`
  flex-direction: row;
  justify-content: flex-end;
`
export const CreatedAtLabel = styled.Text`
  margin-top: 2px;
  font-size: 12px;
  color: #a9a8aa;
  padding: 3px;
`

export const StatusLabel = styled.Text`
  margin-top: 2px;
  margin-left: 8px;
  font-size: 12px;
  color: #a9a8aa;
  padding: 3px;
`

export const AccountLabel = styled.Text`
  margin-top: 2px;
  font-size: 12px;
  color: #a9a8aa;
`

export const AmountLabel = styled.Text`
  font-size: 24px;
  font-weight: 700;
  color: #3ed235;
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

export const SendButtonView = styled.View`
  flex: 1;
  flex-direction: column;
  padding-top: 8px;
  margin-bottom: 16px; 
  align-self: center;
  align-items: center;
`
