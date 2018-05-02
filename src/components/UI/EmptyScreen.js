import React from 'react';
import {
    View,
    Image,
    Text
} from 'react-native';

import { EmptyScreen, MessageLabel } from './styled';

export default ({ text }) =>  (
        <EmptyScreen style={{ height: '100%' }}>
            <Image
                source={require('../../assets/empty.png')}
                resizeMode="contain"
                style={{ width: 170 }}
            />
            <MessageLabel>{text}</MessageLabel>
        </EmptyScreen>
 )