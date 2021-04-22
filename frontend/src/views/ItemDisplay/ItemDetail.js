import React, { useState, useRef, useEffect, useCallback, useContext } from "react";
import { Link } from 'react-router-dom';
import { getItemById, auth, updateItem, generateUserDocument } from "../../firebase"

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
import AuthBox from "views/Authentication/AuthBox"

const ItemDetail = ({ match }) => {
    let params = match.params;
    const [item, setItem] = useState(null);
    const [requireLogin, setRequireLogin] = useState(false);
    const [user, setUser] = useState(null);
    const [alreadyRequested, setAlreadyRequested] = useState(false);
    const id = params.id;
    console.log()
    const fetchItem = useCallback(async () => {
        const item = await getItemById(id);
        setItem(item)
    }, []);
    useEffect(() => {
        fetchItem()
        auth.onAuthStateChanged(async userAuth => {
            console.log(userAuth)
            const user = await generateUserDocument(userAuth);
            console.log(user)
            if (!user)
                setUser(null);
            else
                setUser(user);
            setRequireLogin(false)
        });
    }, []);
    const incrementWaitingList = () => {
        if (!user) {
            setRequireLogin(true)
        } else {
            var newItem = JSON.parse(JSON.stringify(item))
            if (!newItem.requestUids.includes(user.uid)) {
                newItem.requestUids.push(user.uid)
                console.log(newItem)
                updateItem(newItem)
                setItem(newItem);
            } else {
                setAlreadyRequested(true)
            }
        }
    }
    if (!item) {
        return (<div></div>);
    }
    return (
        <GridContainer>
            <GridItem xs={12} sm={12} md={3}>
                <img className="itemPic" src={item.picUrl} alt="User Profile Picture" width="300" height="300" />
            </GridItem>
            <GridItem xs={12} sm={12} md={9}>
                <Card>
                    <CardBody>
                        <GridContainer>
                            <GridItem xs={12} sm={12} md={4}>
                                <InputLabel style={{ color: "#AAAAAA" }}>Item Name</InputLabel>
                                <h4>{item.name}</h4>
                            </GridItem>
                            <GridItem xs={12} sm={12} md={4}>
                                <InputLabel style={{ color: "#AAAAAA" }}>Location</InputLabel>
                                <h4>Toronto</h4>
                            </GridItem>
                            <GridItem xs={12} sm={12} md={4}>
                                <InputLabel style={{ color: "#AAAAAA" }}>{item.donatorUid ? "Donated By" : "Requested By"}</InputLabel>
                                <h4>{item.donatorUid ? item.donatorUid : item.receiverUid}</h4>
                            </GridItem>
                        </GridContainer>
                        <GridContainer>
                            <GridItem xs={12} sm={12} md={4}>
                                <InputLabel style={{ color: "#AAAAAA" }}>{item.donatorUid ? "Donated At" : "Requested At"}</InputLabel>
                                <h4>{item.createdAt}</h4>
                            </GridItem>
                            <GridItem xs={12} sm={12} md={4}>
                                <InputLabel style={{ color: "#AAAAAA" }}>Waiting List Size</InputLabel>
                                <h4>{item.requestUids.length}</h4>
                            </GridItem>
                            <GridItem xs={12} sm={12} md={4}>
                                <InputLabel style={{ color: "#AAAAAA" }}>Contact {item.donatorUid ? "Owner" : "Requester"} At</InputLabel>
                                <h4>{item.contactInfo}</h4>
                            </GridItem>
                        </GridContainer>
                        <GridContainer>
                            <GridItem xs={12} sm={12} md={12}>
                                <InputLabel style={{ color: "#AAAAAA" }}>Item Description</InputLabel>
                                <h4>{item.description}</h4>
                            </GridItem>
                        </GridContainer>

                        <GridContainer>
                            <GridItem xs={12} sm={12} md={12}>
                                <Button color="primary" onClick={() => { incrementWaitingList() }}>{item.donatorUid ? "Request Item" : "Donate Item"}</Button>
                            </GridItem>
                            {alreadyRequested && <small>You have already {item.donatorUid ? "requested" : "donated"} this item</small>}
                        </GridContainer>
                    </CardBody>
                </Card>
            </GridItem>

            {requireLogin && <AuthBox></AuthBox>}

        </GridContainer>
    )
}

export default ItemDetail;