import React, { useState, useRef, useEffect, useCallback, useContext } from "react";
// @material-ui/core components
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
import UploadFile from "views/UserProfile/UploadFile"

// import for the registration box
import AuthBox from "views/Authentication/AuthBox"
import { auth, generateUserDocument, addItem } from "../../firebase"

//icons
import { Settings, AccountCircle } from "@material-ui/icons";
import SupervisorAccount from "@material-ui/icons/SupervisorAccount";
import PersonAdd from "@material-ui/icons/PersonAdd";
import VpnKey from "@material-ui/icons/VpnKey";



export default function DonateRequestItem({donate}) {
    const [user, setUser] = useState(null);
    const [itemName, setItemName] = useState("");
    const [itemDescription, setItemDescription] = useState("");
    const [picUrl, setPicUrl] = useState("https://i.ibb.co/dk89m76/profile.png");

    useEffect(() => {
        auth.onAuthStateChanged(async userAuth => {
            console.log(userAuth)
            const user = await generateUserDocument(userAuth);
            console.log(user)
            if (!user)
                setUser(null);
            else
                setUser(user);
        });
    }, []);

    const onChangeHandler = (event) => {
        const { id, value } = event.currentTarget;
        if (id === 'name') {
            setItemName(value);
        }
        else if (id === 'description') {
            setItemDescription(value);
        }
    };

    const donateItem = async () => {
        var item;
        if(donate){
            item = {
                contactInfo:user.email,
                createdAt:"2020-09-29",
                description:itemDescription,
                donated:true,
                donatorUid:user.uid,
                location:user.location,
                name:itemName,
                picUrl:picUrl,
                received:false,
                receiverUid:"",
                requestUids:[]
            }
        }else{
            item = {
                contactInfo:user.email,
                createdAt:"2020-09-29",
                description:itemDescription,
                donated:false,
                donatorUid:"",
                location:user.location,
                name:itemName,
                picUrl:picUrl,
                received:true,
                receiverUid:user.uid,
                requestUids:[]
            }
        }
        const iid = await addItem(item);
    }


    if (user) {
        return (
            <div>
                <GridContainer>
                    <GridItem xs={12} sm={12} md={8}>
                        <Card>
                            <CardBody>
                                <GridContainer>
                                    <GridItem xs={12} sm={12} md={4}>
                                        <CustomInput
                                            labelText="Item Name"
                                            id="name"
                                            formControlProps={{
                                                fullWidth: true
                                            }}
                                            inputProps={{
                                                value: itemName,
                                                onChange: (event) => onChangeHandler(event)
                                            }}
                                        />
                                    </GridItem>
                                    {/* <GridItem xs={12} sm={12} md={4}>
                    <CustomInput
                      labelText="Pickup Location"
                      id="username"
                      formControlProps={{
                        fullWidth: true
                      }}
                    />
                  </GridItem> */}
                                </GridContainer>
                                <GridContainer>
                                    <GridItem xs={12} sm={12} md={8}>
                                        <CustomInput
                                            labelText="Item Description"
                                            id="description"
                                            formControlProps={{
                                                fullWidth: true
                                            }}
                                            inputProps={{
                                                value: itemDescription,
                                                onChange: (event) => onChangeHandler(event),
                                                multiline: true,
                                                rows: 5
                                            }}
                                        />
                                    </GridItem>
                                </GridContainer>
                            </CardBody>
                            <CardFooter>
                                <Button color="primary" onClick={() => {donateItem();}}>{donate?"Donate Item":"Request Item"}</Button>
                            </CardFooter>
                        </Card>

                    </GridItem>
                    <GridItem xs={12} sm={12} md={4}>
                        <img className="UserProfilePic" src={picUrl} alt="Item Picture" width="300" height="300" />
                    </GridItem>
                </GridContainer>
            </div>

        );
    } else {
        return (
            <div style={{
                position: 'absolute', left: '50%', top: '50%',
                transform: 'translate(-50%, -50%)',
                width: "600px"
            }}>
                <AuthBox></AuthBox>
            </div>
        );
    }
}