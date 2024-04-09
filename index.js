const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "goodreads.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

// Get Books API
app.get("/books/", async (request, response) => {
  const getBooksQuery = `
  SELECT
    *
  FROM
    book
  ORDER BY
    book_id;`;
  const booksArray = await db.all(getBooksQuery);
  response.send(booksArray);
});

//Register User API
app.post("/users/", async (request, response) => {
  const { username, name, gender, password, location } = request.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const selectUserQuery = `
        SELECT 
            * 
        FROM 
            user
        WHERE 
            username = '${username}'`;
  const dbUser = await db.get(selectUserQuery);
  if (dbUser === Undefined) {
    //create new user
    const createUserQuery = `
  INSERT INTO
    user (username, name, password, gender, location)
  VALUES
    (
      '${username}',
      '${name}',
      '${hashedPassword}',
      '${gender}',
      '${location}'  
    );`;
    await dn.run(createUserQuery); //running the sqlquery
    response.send("User created successfully"); //messsage after promise reolved
  } else {
    response.status(400); //status code
    response.send("User already exists");

    //invalid
  }
});

app.post("/users/", async (request, response) => {
  const { username, password } = request.body;
  const selectUserQuery = `
        SELECT 
            * 
        FROM 
            user
        WHERE 
            username = '${username}'`;
  const dbUser = await db.run(selectUserQuery);
  if (dbUser === undefined) {
    //invalid
    response.status(400);
    response.send("Invalid User");
  } else {
    const isPasswordMatched = await bcrypt.compare(password, dbUser.password);

    if (isPasswordMatched === true) {
      response.send("Login successful!"); //valid
    } else {
      response.status(400); //invalid
      response.send("invalid password");
    }
  }
});
