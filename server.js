const mysql = require("mysql");
const inquirer = require("inquirer");
const util = require("util");
require('dotenv').config()

var connection = mysql.createConnection({
    host: "localhost",
  
    // Your port; if not 3306
    port: 3306,
  
    // Your username
    user: "root",
  
    // Your password
    password: process.env.sql_pw,
    database: "employees_DB"
  });

  
connection.connect(function(err) {
    if (err) throw err;
    // run the start function after the connection is made to prompt the user
    start();
  });  

connection.query = util.promisify(connection.query);

const db = {
    getAll(tablename){
        connection.query(`SELECT * FROM ${tablename}`)
    .then(data => console.table(data))
    },
    addOne(tablename, obj){
        connection.query(`INSERT INTO ${tablename} SET ?`, obj)
        .then(data => console.log(`${tablename} created!`))
    },
    updateOne(tablename, obj, id){
        //connection.query(`UPDATE ${tablename} SET ? WHERE ?, [obj, {id}]
    }
}

const addPrompts = {
    Employee: [
        {
            message: "What is their first name?",
            name: "first_name",
        },
        {
            message: "What is their last name?",
            name: "last_name",
        },
        {
            message: "what is their role id?",
            name: "role_id",
        },
        {
            message:  "What is their manager id number?",
            name: "manager_id"
        }

],
    Role: [
       {
           message:  "What is their title?",
           name: "title"
       },
       {
           message:  "What is their salary?",
           name: "salary"
       },
       {
           message:  "what is their department id?",
           name: "department_id"
       } 

    ],
    Department: [
        {message: "What is their department name?",
        name: "department_name"}
    ],
}

function start(){
     inquirer
     .prompt({
        name: "firstQuestion",
        type: "list",
        message: "What would you like to do?",
        choices: ["Add employee, role, or department", "View employee, role, or department", "Update employee roles"]
     }).then(function(firstAnswer) {
         if(firstAnswer.firstQuestion === "Add employee, role, or department"){
            inquirer.prompt({
                name: "addQuestion",
                type: "list",
                message: "What would you like to add - employee, role, or department?",
                choices: ["Employee", "Role", "Department"]
            }).then(({addQuestion})=> {

                inquirer.prompt(addPrompts[addQuestion])
                .then(data=> {
                    db.addOne(addQuestion.toLowerCase(), data)
                    setTimeout(start, 2000)
                })
            })
        
         };
         
         if(firstAnswer.firstQuestion === "View employee, role, or department"){
            inquirer.prompt({
                name: "viewQuestion",
                type: "list",
                message: "What would you like to view - employee, role, or department?",
                choices: ["Employee", "Role", "Department"]
            }).then(({viewQuestion})=> {
                db.getAll(viewQuestion.toLowerCase())
                setTimeout(start, 2000)
            })
         };
         if(firstAnswer.firstQuestion === "Update employee roles"){
            const employeeArray = connection.query("SELECT * FROM employee", function(err, res){
                if (err) {
                    console.log(err);
                }console.log(res);
                var eArray = res.map(item => {
                    return {
                        name: item.first_name + item.last_name,
                        value: item.id
                    }
                })
                inquirer.prompt({
                    name: "updateQuestion",
                    type: "list",
                    message: "Which employee needs an updated role?",
                    choices: eArray,
                
             }).then(function (answer) {
                const id = answer.updateQuestion;
                const roleArray = connection.query("SELECT * FROM role", function(err, res){
                    if (err) {
                        console.log(err);
                    }console.log(res);
                    var rArray = res.map(item => {
                        return {
                            name: item.title,
                            value: item.id
                        }
                    })
                inquirer.prompt({
                    name: "roleUpdateQuestion",
                    type: "list",
                    message: "Which role do you want to give this employee?",
                    choices: rArray  

                }).then(function(answer){
                    var roleId = answer.roleUpdateQuestion;
                    var query = "UPDATE employee SET role_id=? WHERE id=?";
                    connection.query(query, [roleId, id], function (err, res) {
                      if (err) {
                        console.log(err);
                      }
                      setTimeout(start, 2000);
                    });
                })                          
               
             })
            })})
            
            
        }})}
    