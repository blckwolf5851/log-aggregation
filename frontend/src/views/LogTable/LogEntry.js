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
import Grid from '@material-ui/core/Grid';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';

import LogDetail from './LogDetail'
import GridItem from 'components/Grid/GridItem';
import GridContainer from 'components/Grid/GridContainer';

const LogEntry = ({ item, columns }) => {
    const [state, setState] = React.useState({
        top: false,
        left: false,
        bottom: false,
        right: false,
    });
    const anchor = 'right';

    const toggleDrawer = (anchor, open) => (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }

        setState({ ...state, [anchor]: open });
    };
    console.log(item);
    return (
            <TableRow hover role="checkbox" tabIndex={-1} key={item._id} >
                {columns.map((column) => {
                    const value = item[column];
                    return (
                        <TableCell key={column} onClick={toggleDrawer(anchor, true)}>
                            {value}
                        </TableCell>
                    );
                })}
                <Drawer anchor={anchor} open={state[anchor]} onClose={toggleDrawer(anchor, false)}>
                    <LogDetail item={item}></LogDetail>
                </Drawer>
            </TableRow>
    );
}

{/* <React.Fragment key={anchor}>
</React.Fragment> */}



{/* <Button onClick={toggleDrawer(anchor, true)}>{item.timestamp}</Button> */ }



export default LogEntry;