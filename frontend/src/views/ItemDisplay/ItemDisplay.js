import React, { useState, useRef, useEffect, useCallback, useContext } from "react";
// @material-ui/core components
import { Link } from 'react-router-dom';
import { makeStyles } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
// core components
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import CustomInput from "components/CustomInput/CustomInput.js";
import Button from "components/CustomButtons/Button.js";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardAvatar from "components/Card/CardAvatar.js";
import CardBody from "components/Card/CardBody.js";
import CardFooter from "components/Card/CardFooter.js";
import CustomTabs from "components/CustomTabs/CustomTabs.js";
import avatar from "assets/img/faces/marc.jpg";

import ProfileInformation from "views/UserProfile/ProfileInformation"
import EditProfile from "views/UserProfile/EditProfile"

// import for the registration box
import AuthBox from "views/Authentication/AuthBox"
import { auth, filterItemDocuments } from "../../firebase"
import ItemSummary from "./ItemSummary"

//icons
import { Settings, AccountCircle } from "@material-ui/icons";
import SupervisorAccount from "@material-ui/icons/SupervisorAccount";
import PersonAdd from "@material-ui/icons/PersonAdd";
import VpnKey from "@material-ui/icons/VpnKey";
const styles = {
    cardCategoryWhite: {
        color: "rgba(255,255,255,.62)",
        margin: "0",
        fontSize: "14px",
        marginTop: "0",
        marginBottom: "0"
    },
    cardTitleWhite: {
        color: "#FFFFFF",
        marginTop: "0px",
        minHeight: "auto",
        fontWeight: "300",
        fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
        marginBottom: "3px",
        textDecoration: "none"
    }
};

const useStyles = makeStyles(styles);


const ItemDisplay = ({ itemName, donated, received, donatedBy, receivedBy, requestedBy, orderBy }) => {
    const [items, setItems] = useState([]);
    const [page, setPage] = useState(1);
    const itemOwned = donated && received
    const perPage = 16;

    const onClickNext = () => {
        if (page * perPage < items.length)
            setPage(page + 1);
    }
    const onClickPrev = () => {
        if (page > 1)
            setPage(page - 1);
    }
    console.log(items)

    const fetchItems = useCallback(async () => {
        var it = await filterItemDocuments(itemName, donated, received, donatedBy, receivedBy, requestedBy, orderBy);
        it = it ? it : []
        setItems(it);
    }, [itemName, donated, received, itemOwned, donatedBy, receivedBy, requestedBy, orderBy]);

    useEffect(() => {
        fetchItems();
    }, [itemName, donated, received, itemOwned, donatedBy, receivedBy, requestedBy, orderBy]);


    return (
        <GridContainer>
            {items.slice((page - 1) * perPage, page * perPage).map((item) => (
                <Link to={`item/${item.id}`}>
                    <ItemSummary itemName={item.name} itemDescription={item.description} itemPicUrl={item.picUrl} itemOwned={itemOwned} itemCreatedAt={item.createdAt}></ItemSummary>
                </Link>
            ))}
            <GridItem xs={12} sm={12} md={12}>
                {page > 1 && <Button color="primary" onClick={() => { onClickPrev() }}>Prev</Button>}
                {page * perPage < items.length && <Button color="primary" onClick={() => { onClickNext() }}>Next</Button>}
            </GridItem>
        </GridContainer>
    );

}
export default ItemDisplay;