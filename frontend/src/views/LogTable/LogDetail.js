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
import LogAttributeDisplayer from './LogAttributeDisplayer'
const LogDetail = ({ item }) => {
    if (!item.tags) {
        item.tags = []
    }

    return (
        <GridContainer style={{width:"500px"}}>
            {/* Header */}
            <GridItem xs={12} sm={12} md={12}>
                <span>{item.logtype}</span>
                <span>{item.timestamp}</span>
            </GridItem>
            {/* Tags */}
            <GridItem xs={12} sm={12} md={12}>
                {item.tags.map((tag) => {
                    return <Chip label={tag} variant="outlined" />
                })}
            </GridItem>
            <GridItem xs={12} sm={12} md={6}>
                <p>{"Host:" + item.host}</p>
            </GridItem>
            <GridItem xs={12} sm={12} md={6}>
                <p>{"Service:" + item.service}</p>
            </GridItem>
            <GridItem xs={12} sm={12} md={12}>
                <p>{"Message:" + item.message}</p>
            </GridItem>
            <GridItem xs={12} sm={12} md={12}>
                <LogAttributeDisplayer item={item}></LogAttributeDisplayer>
            </GridItem>

        </GridContainer>
    );
}

export default LogDetail