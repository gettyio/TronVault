import React, { PureComponent } from 'react'
import styled from 'styled-components'
import { Text, View, TouchableOpacity, Clipboard, ScrollView } from 'react-native'
import moment from 'moment'
import Button from 'react-native-micro-animated-button'

import {
	Container,
	EnvelopeCard,
	EnvelopeCardLabel,
	EnvelopeAmount,
	EnvelopeDetail,
	EnvelopeInfo,
	EnvelopeLabel,
	StellarIcon,
	EnvelopeStatusView,
	EnvelopeStatusViewTwo,
	EnvelopStatusText,
	SignWrapper, 
	DeleteWrapper,
	DeleteText
} from './styled';

class EnvelopeView extends PureComponent {

	reject = () => {
		const { tx, rejectTransaction } = this.props;
		this.cancelButton.success();
		rejectTransaction(tx);
	}

	sign = () => {
		const { tx, signTransaction } = this.props;
		this.signButton.success();
		signTransaction(tx);
	}

	copy = () => {
		const { copyToClipboard } = this.props;
		copyToClipboard();
		this.copyButton.success();
		this.copyButton.reset();
	}

	renderActionBar = () => {
		const { tx, showConfirmDelete } = this.props;

		if (!tx) {
			return
		}

		if (tx.status === 'SIGNED') {
			return (
				<View>
					<EnvelopeStatusView backgroundColor='#2e3666'>
						<EnvelopStatusText>SIGNED</EnvelopStatusText>
					</EnvelopeStatusView>
					<SignWrapper>
						<Button
							ref={ref => (this.signButton = ref)}
							foregroundColor={'#4cd964'}
							onPress={this.sign}
							successIconName="check"
							label="Sign"
							maxWidth={100}
							style={{ marginLeft: 16 }}
						/>
					</SignWrapper>
					<Button
						ref={ref => (this.copyButton = ref)}
						foregroundColor={'white'}
						backgroundColor={'#454545'}
						successColor={'#4cd964'}
						errorColor={'#ff3b30'}
						errorIconColor={'white'}
						successIconColor={'white'}
						shakeOnError={true}
						successIconName="check"
						label="Copy Signed XDR"
						onPress={this.copy}
						maxWidth={150}
						style={{
							marginLeft: 16,
							borderWidth: 1,
							alignSelf: 'center',
							marginTop: 16
						}}
					/>
				</View>
			)
		}

		if (tx.status === 'REJECTED') {
			return (
				<View>
					<EnvelopeStatusView backgroundColor='#ff3b30'>
						<EnvelopStatusText>REJECTED</EnvelopStatusText>
					</EnvelopeStatusView>
					<DeleteWrapper>
						<TouchableOpacity onPress={() => showConfirmDelete(tx)} style={{ padding: 32 }}>
							<DeleteText>Delete</DeleteText>
						</TouchableOpacity>
					</DeleteWrapper>
				</View>
			)
		}

		if (tx.status === 'SUBMITTED') {
			return (
				<EnvelopeStatusViewTwo backgroundColor='#ff8300'>
					<EnvelopStatusText>SUBMITTED</EnvelopStatusText>
				</EnvelopeStatusViewTwo>
			)
		}

		if (tx.status === 'CONFIRMED') {
			return (
				<EnvelopeStatusViewTwo backgroundColor='#4cd964'>
					<EnvelopStatusText>CONFIRMED</EnvelopStatusText>
				</EnvelopeStatusViewTwo>
			)
		}

		return (
			<View>
				<View style={{ alignSelf: 'center', marginTop: 24 }}>
					<SignWrapper>
						<Button
							ref={ref => (this.cancelButton = ref)}
							foregroundColor={'#ff3b30'}
							onPress={this.reject}
							successIconName="check"
							label="Reject"
							maxWidth={100}
						/>
						<Button
							ref={ref => (this.signButton = ref)}
							foregroundColor={'#4cd964'}
							onPress={this.sign}
							successIconName="check"
							label="Sign"
							maxWidth={100}
							style={{ marginLeft: 16 }}
						/>
					</SignWrapper>
					<DeleteWrapper>
						<TouchableOpacity onPress={() => showConfirmDelete(tx)} style={{ padding: 32 }}>
							<DeleteText>Delete</DeleteText>
						</TouchableOpacity>
					</DeleteWrapper>
				</View>
			</View>

		)
	}


	render() {
		const { tx } = this.props;
		return (
			<EnvelopeCard>
				<StellarIcon
					source={require('../../../assets/stellar-rocket.png')}
					resizeMode="contain"
				/>
				<EnvelopeAmount>
					<EnvelopeCardLabel>{`${tx.amount} XLM`}</EnvelopeCardLabel>
				</EnvelopeAmount>
				<EnvelopeDetail>
					<EnvelopeInfo align="flex-start">
						<EnvelopeLabel>From:</EnvelopeLabel>
						<EnvelopeLabel fontSize="10px">{tx.sourceAccount}</EnvelopeLabel>
					</EnvelopeInfo>
				</EnvelopeDetail>
				<EnvelopeDetail>
					<EnvelopeInfo align="flex-start">
						<EnvelopeLabel>To:</EnvelopeLabel>
						<EnvelopeLabel fontSize="10px">{tx.destination}</EnvelopeLabel>
					</EnvelopeInfo>
				</EnvelopeDetail>
				<EnvelopeDetail>
					<EnvelopeInfo>
						<EnvelopeLabel>Memo:</EnvelopeLabel>
						<EnvelopeLabel>{tx.memo}</EnvelopeLabel>
					</EnvelopeInfo>
					<EnvelopeInfo align="flex-end">
						<EnvelopeLabel>Time:</EnvelopeLabel>
						<EnvelopeLabel>
							{moment(tx.createdAt).format('YYYY-MM-DD hh:mm:ss')}
						</EnvelopeLabel>
					</EnvelopeInfo>
				</EnvelopeDetail>
				{this.renderActionBar()}
			</EnvelopeCard>
		)
	}
}

export default EnvelopeView;