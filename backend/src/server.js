const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan")
const cors = require("cors")
dotenv.config();
const app = express();

const PORT = process.env.PORT;
//console.log(PORT)


app.use(express.json());
app.use(morgan("dev"));
app.use(cors(
    {
        Credential:true
    }
))



app.listen(PORT , ()=>{
    console.log(`Server running successfully on Port: ${PORT}`)
})