const express = require('express');
var cors = require('cors');
const app = express();
var mysql = require('mysql');
const port = 8080
const jwt = require('jsonwebtoken');

app.use(cors());
app.use(express.json());
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

//Status encoded
const OK = 200;
const BAD_REQUEST = 404;
const UNAUTHORIZED = 401;
const NOT_FOUND = 404;

const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "123456789",
  database: "API"
});


app.use('/profile',function(req,res,next){
  try {
    console.log(req.headers);
    if(!req.headers.authorizationkey){
      res.status(UNAUTHORIZED).send("UNAUTHORIZED");
    }
    else{
      next();
    }
} catch(err) {
  console.log(err);
}
});

app.post('/login',function(req,res){
  con.query("SELECT emailId,age,fname,lname,address FROM User where emailId='" + req.body.email +"' AND password='" + req.body.password + "';" , function (err, result, fields) {
    if (err) throw err;
    console.log(result.length);
    if(result.length <= 0)
      res.status(OK).send("Invalid Credentials");
      else{
        var token = jwt.sign({ emailId: req.body.email,}, 'secret' );
        console.log(token);
    res.header("AuthorizationKey", token).status(OK).send(result);}
  });
});

app.get('/',function(req,res){
    res.send("check");
});

app.get('/profile/:email',function(req,res){
  if(!req.params)
  res.status(BAD_REQUEST).send("Bad request Check parameters");
  else{
    con.query("SELECT emailId,age,fname,lname,address FROM User where emailId='" + req.params.email + "';" , function (err, result, fields) {
      if (err) throw err;
      console.log(result.length);
      if(result.length <= 0)
        res.status(OK).send("No record found");
        else{
      res.status(OK).send(result);}
    });}
});

app.post('/profile/:email',function(req,res){
  if(!req.params || !req.body)
  res.status(BAD_REQUEST).send("Bad request Check parameters or Body");
    else{
  const sql = "Update User set password = '"
  + req.body.password + "',age="
  + req.body.age + ",fname='"
  + req.body.firstname + "',lname='"
  + req.body.lastname + "',address='"
  + req.body.address + "'where emailId='" + req.params.email + "';"

  con.query(sql, function (err, result, fields) {
    if (err) throw err;
    if(result.fieldCount <= 0)
    res.status(OK).send("Email id not found in Record");
    if(result.affectedRows > 0)
      res.status(OK).send("Record Updated");
  });}
});


app.post('/signup', (req, res) => {

  const sql = "Insert into User(emailId,password,age,fname,lname,address) values ('"
              + req.body.email + "','"
              + req.body.password + "',"
              + req.body.age + ",'"
              + req.body.firstname + "','"
              + req.body.lastname + "','"
              + req.body.address + "');";

  con.query(sql, function (err, result, fields) {
                   if (err){
                     const message = err.sqlMessage;
                     if(message.includes("Duplicate"))
                     res.send("Email id already registered");
                   }
                   else {
                    if(result.affectedRows >= 1)
                     res.status(OK).send("Signed up Successfully");
                   }
                 });
});

app.post('/logout', (req, res) => {

});

app.listen(port, (req, res) => {
  console.log("listening...");
});
