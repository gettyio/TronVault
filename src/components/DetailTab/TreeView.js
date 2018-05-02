// TreeView is a recursive tree view
// It takes data from extrapolateFromXdr and formats it in a more user friendly way

import React from 'react';
import _ from 'lodash';
import { View, Text } from 'react-native'
import styled from 'styled-components'


import {
  TreeContainer,
  TreeViewSpan,
  TreeViewChild,
  EasySelect,
  TreeViewRow,
  TreeViewLabel
} from './styled';

// @param {array} props.nodes - Array of TreeView compatible nodes
export default class TreeView extends React.Component {
  render() {
    let { nodes, className } = this.props;
    let rootClass = 'TreeView ' + (className) ? className : '';

    let result = <View className={rootClass}>
      {_.map(Array.prototype.slice.call(nodes), (node, index) => {
        let childNodes;

        if (typeof node.nodes !== 'undefined') {
          childNodes = <TreeViewChild>
            <TreeView nodes={node.nodes} />
          </TreeViewChild>;
        }

        return <View className="TreeView__set" key={index}>
          <TreeViewRow key={index + node.type}>
            <RowValue node={node} />
          </TreeViewRow>
          {childNodes}
        </View>
      })}
    </View>;

    return result;
  }
}

function RowValue(props) {
  let value, childNodes, separatorNeeded, separator;
  let { node } = props;

  if (typeof node.value === 'string') {
    value = String(node.value);
    separatorNeeded = true;
  } else if (typeof node.value !== 'undefined' && _.has(node.value, 'type')) {
    value = convertTypedValue(node.value);
    separatorNeeded = true;
  } else {
    if (typeof node.nodes !== 'undefined') {
      value = '';
    } else {
      value = <Text>none</Text>;
      separatorNeeded = true;
    }
  }
  if (separatorNeeded) {
    separator = ': ';
  }

  return <Text><TreeViewLabel>{node.type}</TreeViewLabel>{separator}{value}</Text>
}

// Types values are values that will be displayed with special formatting to
// provide for a more rich experience other than just plain text.
// "untyped" values are simply strings. They will be displayed as strings in the
// tree node.
function convertTypedValue({ type, value }) {
  switch (type) {
    case 'code':
      return <TreeViewLabel>{value}</TreeViewLabel>;
    case 'amount':
      return <TreeViewLabel>{value.parsed} (raw: <TreeViewLabel>{value.raw}</TreeViewLabel>)</TreeViewLabel>;
  }
}