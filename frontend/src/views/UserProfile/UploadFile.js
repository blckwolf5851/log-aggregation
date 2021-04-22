import React, { useState } from "react";
import { storage } from "../../firebase";
import Button from "components/CustomButtons/Button.js";

const UploadFile = () => {
    const [image, setImage] = useState(null);
    const [url, setUrl] = useState("");
  
    const handleChange = e => {
      if(e.target.files[0]){
  
      }
    };
    const handleUpload = () => {
        const uploadTask = storage.ref('images/${image.name}').put(image);
        uploadTask.on(
            "state_changed",
            snapshot => {},
            error => {
                console.log(error);
            },
            () => {
                storage
                .ref("images")
                .child(image.name)
                .getDownloadURL()
                .then(url => {
                    console.log(url);
                });
            }
        );
    };

    console.log("image: ", image);

    return(
        <div>
            <input type="file" onChange={handleChange} />
            <Button onClick={handleUpload} color="primary">Upload Profile Photo</Button>
        </div>
    );
};
  export default UploadFile;