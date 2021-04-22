import React, { useState } from "react";
import { signInWithGoogle, auth, generateUserDocument } from "../../firebase";
import CustomInput from "components/CustomInput/CustomInput.js";
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Button from "components/CustomButtons/Button.js";

const SignUp = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [location, setLocation] = useState("");
    const [error, setError] = useState(null);

    const createUserWithEmailAndPasswordHandler = async (event, email, password) => {
        event.preventDefault();
        try {
            const { user } = await auth.createUserWithEmailAndPassword(email, password);
            generateUserDocument(user, { displayName, location });
        }
        catch (error) {
            console.error("Error signing in with password and email", error);
            setError('Error Signing up with email and password');
        }

        setEmail("");
        setPassword("");
        setDisplayName("");
        setLocation("");
    };

    const onChangeHandler = event => {
        const { id, value } = event.currentTarget;
        if (id === "email") {
            setEmail(value);
        } else if (id === "password") {
            setPassword(value);
        } else if (id === "username") {
            setDisplayName(value);
        } else if (id === "location") {
            setLocation(value)
        }
    };

    return (
        <div className="mt-8">
            {error !== null && (
          <div className="py-4 bg-red-600 w-full text-white text-center mb-3">
            {error}
          </div>
        )}
            <GridContainer>
                <GridItem xs={12} sm={12} md={6}>
                    <CustomInput
                        labelText="Display Name"
                        id="username"
                        formControlProps={{
                            fullWidth: true,
                        }}
                        inputProps={{
                            value: displayName,
                            onChange: (event) => onChangeHandler(event)
                        }}
                    />
                </GridItem>
                <GridItem xs={12} sm={12} md={6}>
                    <CustomInput
                        labelText="Location"
                        id="location"
                        formControlProps={{
                            fullWidth: true
                        }}
                        inputProps={{
                            value: location,
                            onChange: (event) => onChangeHandler(event)
                        }}
                    />
                </GridItem>
            </GridContainer>
            <GridContainer>
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
                <GridItem xs={12} sm={12} md={6}>
                    <CustomInput
                        labelText="Password"
                        type="password"
                        id="password"
                        formControlProps={{
                            fullWidth: true
                        }}
                        inputProps={{
                            value: password,
                            onChange: (event) => onChangeHandler(event)
                        }}
                    />
                </GridItem>
            </GridContainer>
            <GridContainer>
                <GridItem xs={12} sm={12} md={6}>
                    <Button color="primary" onClick={(event) => { createUserWithEmailAndPasswordHandler(event, email, password) }}>Sign Up</Button>
                </GridItem>
                <GridItem xs={12} sm={12} md={6}>
                    <Button color="primary"
                        onClick={() => {
                            try {
                                signInWithGoogle();
                            } catch (error) {
                                console.error("Error signing in with Google", error);
                            }
                        }}>Sign In With Google</Button>
                </GridItem>
            </GridContainer>

        </div>
    );
};

export default SignUp;