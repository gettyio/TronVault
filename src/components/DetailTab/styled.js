import styled from 'styled-components'


export const Screen = styled.View`
  display: flex;
	background-color: white;
`
export const HeaderTabs = styled.View`
	flex-direction: row;
  background-color: #d5eef7;
`

export const HeaderTabsButton = styled.TouchableOpacity`
	flex: 1;
	justify-content: center;
  padding: 24px;
  background-color: #2e3666;
`

export const HeaderTabsLabel = styled.Text`
	align-self: center;
  color: white;
	font-size: 16px;
	font-weight: ${props => (props.name === props.tab ? '700' : '300')};
`

export const TreeContainer = styled.View`
  flex: 1;
	background-color: white;
`
export const TreeViewSpan = styled.View`
	word-break: break-all;
`

export const TreeViewChild = styled.View`
	border-left-width: 10px;
	border-color: #e6f8fc;
`
export const EasySelect = styled.View`
  cursor: pointer;
  border-bottom: 1px dotted currentColor;
`
export const TreeViewRow = styled.View`
	padding: 5px 10px;
`

export const TreeViewLabel = styled.Text`
	font-weight: 700;
`