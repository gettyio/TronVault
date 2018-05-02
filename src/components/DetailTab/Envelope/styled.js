import styled from 'styled-components'

export const Container = styled.View`
  flex: 1;
	background-color: white;
	padding-bottom: 128px;
`

export const EnvelopeCard = styled.View`
    height: 100%;
    padding: 16px;
    background-color: #d5eef7;
`

export const EnvelopeCardLabel = styled.Text`
    font-size: 26px;
    font-weight: 700;
    color: #5b6a71;
`
export const EnvelopeAmount = styled.View`
    align-items: flex-end;
`
export const EnvelopeDetail = styled.View`
    flex-direction: row;
    padding-top: 4px;
    padding-bottom: 4px;
`

export const EnvelopeInfo = styled.View`
    flex: 1;
    align-items: ${props => (props.align ? props.align : 'flex-start')};
    justify-content: ${props => (props.justify ? props.justify : 'flex-start')};
`

export const EnvelopeLabel = styled.Text`
    padding-top: 2px;
    font-size: ${props => (props.fontSize ? props.fontSize : '12px')};
    color: #5b6a71;
`

export const StellarIcon = styled.Image`
    width: 42px;
    height: 42px;
    position: absolute;
    margin-top: 8px;
    margin-left: 8px;
`

export const EnvelopeStatusView = styled.View`
    flex-direction: row;
    justify-content: center;
    padding: 16px;
    background-color: ${props => props.backgroundColor};
    border-radius: 8px;
    margin-top: 24px;
`

export const EnvelopeStatusViewTwo = styled.View`
    flex-direction: row;
    justify-content: center;
    padding: 16px;
    background-color: ${props => props.backgroundColor};
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
`

export const EnvelopStatusText = styled.Text`
    color: white;
    font-weight: 700;
`

export const SignWrapper = styled.View`
    flex-direction: row;
    justify-content: center; 
    margin-top: 24px;
`

export const DeleteWrapper = styled.View `
    align-self: center;
    margin-top: 8px;
`
export const DeleteText = styled.Text `
    font-weight: 700;
`