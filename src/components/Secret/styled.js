import styled from 'styled-components'

export const Container = styled.View`
  height: ${props => (props.height ? props.height : 'auto')};
`
export const EmptyScreen = styled.View`
  align-items: center;
  padding-top: 16px;
	background-color: white;
`

export const Row = styled.View`
  padding: 16px;
  border-bottom-width: 0.3px;
  border-color: #d3d3d3;
`

export const AliasLabel = styled.Text`
  font-size: 16px;
  color: #333;
  font-weight: 700;
  align-self: center;
`


export const PKLabel = styled.Text`
  font-size: 14px;
  color: #333;
  font-weight: 700;
  align-self: center;
`


export const SKLabel = styled.Text`
  font-size: 16px;
  letter-spacing: 3px;
  color: #333;
  font-weight: 700;
  margin-top: 16px;
  align-self: center;
`

export const DateLabel = styled.Text`
  font-size: 12px;
  margin-top: 8px;
  color: #555;
  align-self: center;
`
