import React, { useState, useContext } from "react";
import { auth } from "../../firebase";
import CustomInput from "components/CustomInput/CustomInput.js";
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Button from "components/CustomButtons/Button.js";


const PasswordReset = () => {
    const [email, setEmail] = useState("");
    const [emailHasBeenSent, setEmailHasBeenSent] = useState(false);
    const [error, setError] = useState(null);

    const onChangeHandler = event => {
        const { id, value } = event.currentTarget;

        if (id === "email") {
            setEmail(value);
        }
    };

    const sendResetEmail = event => {
        event.preventDefault();
        auth
            .sendPasswordResetEmail(email)
            .then(() => {
                setEmailHasBeenSent(true);
                setTimeout(() => { setEmailHasBeenSent(false) }, 3000);
            })
            .catch(() => {
                setError("Error resetting password");
            });
    };
    return (
        <div className="mt-8">
            {emailHasBeenSent && (
                <div className="py-3 bg-green-400 w-full text-white text-center mb-3">
                    An email has been sent to you!
                </div>
            )}
            {error !== null && (
                <div className="py-3 bg-red-600 w-full text-white text-center mb-3">
                    {error}
                </div>
            )}
            <GridContainer justify="center">
                <GridItem xs={12} sm={12} md={6}>
                    <CustomInput
                        labelText="Email Address"
                        id="email"
                        formControlProps={{
                            fullWidth: true,
                        }}
                        inputProps={{
                            value: email,
                            onChange: (event) => onChangeHandler(event)
                        }}
                    />
                </GridItem>

            </GridContainer>
            <GridContainer justify="center">
                <GridItem xs={12} sm={12} md={3}>
                    <Button color="primary"
                        onClick={event => {
                            sendResetEmail(event);
                        }}>Send Reset Email</Button>
                </GridItem>

            </GridContainer>
        </div>
    );
};

export default PasswordReset;