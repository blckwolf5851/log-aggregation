import React, { useState } from "react";
import { signInWithGoogle, auth } from "../../firebase";
import CustomInput from "components/CustomInput/CustomInput.js";
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Button from "components/CustomButtons/Button.js";


const SignIn = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const signInWithEmailAndPasswordHandler = (event, email, password) => {
        event.preventDefault();
        auth.signInWithEmailAndPassword(email, password).catch(error => {
            setError("Error signing in with password and email!");
            console.error("Error signing in with password and email", error);
        });
    };

    const onChangeHandler = (event) => {
        const { id, value } = event.currentTarget;
        if (id === 'email') {
            setEmail(value);
        }
        else if (id === 'password') {
            setPassword(value);
        }
    };
    return (
        <div className="mt-8">
                    {error !== null && <div className = "py-4 bg-red-600 w-full text-white text-center mb-3">{error}</div>}

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
                    <Button  color="primary" onClick = {(event) => {signInWithEmailAndPasswordHandler(event, email, password)}}>Sign In</Button>
                </GridItem>
                <GridItem xs={12} sm={12} md={6}>
                    <Button color="primary" onClick={() => {signInWithGoogle();}}>Sign In With Google</Button>
                </GridItem>
            </GridContainer>

        </div>
    );
};

export default SignIn;