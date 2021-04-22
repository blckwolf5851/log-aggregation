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
import { auth, generateUserDocument } from "../../firebase"

//icons
import { Settings, AccountCircle } from "@material-ui/icons";
import SupervisorAccount from "@material-ui/icons/SupervisorAccount";
import PersonAdd from "@material-ui/icons/PersonAdd";
import VpnKey from "@material-ui/icons/VpnKey";

import DonateRequestItem from "./DonateRequestItem"


export default function DonateRequestHandler() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    auth.onAuthStateChanged(async userAuth => {
      console.log(userAuth)
      const user = await generateUserDocument(userAuth);
      console.log(user)
      if (!user)
        setUser(null);
      else
        setUser({ user });
    });
  }, []);


  if (user) {
    return (
      <div>
        <GridContainer>
          <GridItem xs={12} sm={12} md={12}>
            <CustomTabs
              title="Donate/Request Items"
              headerColor="primary"
              tabs={[
                {
                  tabName: "Donate",
                  tabIcon: AccountCircle,
                  tabContent: (
                    <DonateRequestItem donate={true}/>
                  )
                },
                {
                  tabName: "Request",
                  tabIcon: Settings,
                  tabContent: (
                    <DonateRequestItem donate={false}/>
                  )
                },
                {
                  tabName: "Upload Item Picture",
                  tabIcon: Settings,
                  tabContent: (
                    <UploadFile/>
                  )
                },
              ]}
            />
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