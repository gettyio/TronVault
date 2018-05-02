import React from 'react';
import renderer from 'react-test-renderer';
import AuthScreen from './../src/screens/AuthScreen';

it('renders correctly', () => {
  const tree = renderer
    .create(<AuthScreen />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});