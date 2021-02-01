require('dotenv').config();
const express = require("express");
const app = express();
const path = require("path");
const hbs = require("hbs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const auth = require("./middleware/auth");

require("./db/conn");
const Register = require("./models/registers")
const port = process.env.PORT || 8000;

const staticPath = path.join(__dirname,"../public");
const viewsPath = path.join(__dirname,"../templates/views");
const partialsPath = path.join(__dirname,"../templates/partials");
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:false}));

app.use(express.static(staticPath));
app.set("view engine","hbs");
app.set("views",viewsPath);
hbs.registerPartials(partialsPath);


app.get("/",(req,res)=>{
    res.render("index");
});


app.get("/secret",auth,(req,res)=>{
    // console.log(req.cookies.jwt);

    res.render("secret");
});

app.get("/logout",auth,async(req,res)=>{
   
    try {
            console.log(req.user);
// for single logout
            // req.user.tokens = req.user.tokens.filter((currElement)=>{
            //     return currElement.token !== req.token
            // })


            // for remove all token and logout
            req.user.tokens = [];
            
            res.clearCookie("jwt");
            console.log("logout successfully");
         
            await req.user.save();
            res.render("login");
           
        } catch (error) {
            res.status(500).send(error);
        }
             
});

app.get("/register",(req,res)=>{
     res.render("register");
})

app.get("/login",(req,res)=>{
    res.render("login");
})

app.post("/register",async (req,res)=>{
    try {
        const password = req.body.password;
        const cpassword = req.body.confirmpassword;
        
        
        if (password === cpassword) {
            const registerEmployee = new Register({
                    firstname: req.body.firstname,
                    lastname: req.body.lastname,
                    email:req.body.email,
                    gender:req.body.gender,
                    phone:req.body.phone,
                    age:req.body.age,
                    password:password,
                    confirmpassword:cpassword
                })
                console.log("the success part" + registerEmployee);
                const token = await registerEmployee.generateAuthToken();
                console.log("the token part" + token);
                  
                // cookies
                res.cookie("jwt",token,{
                    expires:new Date(Date.now() + 30000),
                    httpOnly:true
                });


                const registered = await registerEmployee.save();
                console.log("the page part" + registered);

                res.status(201).render("index");
        }else{
            res.send("password are not matching")
        }
    } catch (e) {
        res.status(400).send(e);
    }
})

app.post("/login",async (req,res)=>{
    try {
        const email = req.body.email;
        const password = req.body.password;
    

        const useremail = await Register.findOne({email:email});
        const isMatch  = await bcrypt.compare(password,useremail.password)
      
        const token = await useremail.generateAuthToken();
        console.log("the token part" + token);

         // cookies
         res.cookie("jwt",token,{
            expires:new Date(Date.now() + 600000),
            httpOnly:true,
            // secure:true
        });


        if (isMatch) {
            res.status(201).render("index");
        } else {
            res.send("invalid login details");
        }

    } catch (error) {
        res.status(400).send("invalid login details");
    }
})









// const securePassword = async(password)=>{

//     const passwordHash = await bcrypt.hash(password,12);
//     console.log(passwordHash);

//     const passwordmatch = await bcrypt.compare("thapa@123",passwordHash);
//     console.log(passwordmatch);
// }


// securePassword("thapa@123");


// const jwt =require("jsonwebtoken");

// const createToken = async () => {
//   const token =  await jwt.sign({_id:"601688b6c3f026480c2bfe2b"},"mynameissaurabhshamsundarrwoolfromkudaldistrictsindhudurg",{
//       expiresIn:"2 seconds"
//   });
//     console.log(token);

//     const userVer = await jwt.verify(token,"mynameissaurabhshamsundarrwoolfromkudaldistrictsindhudurg");
//     console.log(userVer);
// }



// createToken();


app.listen(port,()=>{
    console.log(`server is running at port no ${port}`);
});