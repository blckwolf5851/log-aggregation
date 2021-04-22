import React from 'react';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import SendIcon from '@material-ui/icons/Send';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import MailIcon from '@material-ui/icons/Mail';
import Chip from '@material-ui/core/Chip';
import GridContainer from 'components/Grid/GridContainer';
import GridItem from 'components/Grid/GridItem';
import ReactJson from 'react-json-view'

// documentation for ReactJson: https://www.npmjs.com/package/react-json-view

const LogAttributeDisplayer = ({ item }) => {
    if (!item.tags) {
        item.tags = []
    }

    const clipboardCopy = (copy) => {
        const str = copy.name+":"+copy.src
        navigator.clipboard.writeText(str)
    }
    

    return (
        <ReactJson src={item} enableClipboard={(copy)=>{clipboardCopy(copy)}}/>
    );
}

export default LogAttributeDisplayer