import React from "react";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
// core components
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import CustomTabs from "components/CustomTabs/CustomTabs.js";

import SignIn from "./SignIn"
import SignUp from "./SignUp"
import PasswordReset from "./PasswordReset"

//icons
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

export default function AuthBox() {
  const classes = useStyles();
  return (
    <div>
      {/* Below is user authentication */}
      <GridContainer>
        <GridItem xs={12} sm={12} md={12}>
          <CustomTabs
            title="Authentication"
            headerColor="primary"
            tabs={[
              {
                tabName: "Sign In",
                tabIcon: SupervisorAccount,
                tabContent: (
                  <SignIn />
                )
              },
              {
                tabName: "Sign Up",
                tabIcon: PersonAdd,
                tabContent: (
                  <SignUp />
                )
              },
              {
                tabName: "Forgot Password",
                tabIcon: VpnKey,
                tabContent: (
                  <PasswordReset />
                )
              }
            ]}
          />
        </GridItem>

      </GridContainer>

    </div>
  );
}
