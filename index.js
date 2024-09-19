const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
require("dotenv").config();
const Person = require("./models/person");

const app = express();

app.use(express.json());
app.use(express.static("dist"));
app.use(morgan("tiny"));
app.use(cors());

let persons = [
  {
    id: "1",
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: "2",
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: "3",
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: "4",
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/api/persons", (request, response) => {
  Person.find({}).then((persons) => {
    response.send(persons);
  });
});

app.get("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  const person = persons.find((person) => person.id === id);

  if (person) {
    console.log("Person at requested id", person);
    response.json(person);
  } else {
    response.status(404).end();
  }
});

app.get("/api/info", (request, response) => {
  const currentDate = new Date().toUTCString();

  console.log("Number of persons", persons.length, "Date", currentDate);
  response.send(
    `<p>Phonebook has info for ${persons.length} people</p>
    <p>${currentDate}</p>`
  );
});

app.delete("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  persons = persons.filter((person) => person.id !== id);

  console.log("Persons after deletion", persons);
  response.status(204).end();
});

/*const generateId = () => {
  const newID = String(Math.floor(Math.random() * 1000000));
  console.log(newID);
  return newID;
};*/

app.post("/api/persons", (request, response) => {
  const body = request.body;

  if (!body.name || !body.number) {
    console.log("Cannot post new person, name or number missing");
    return response.status(400).json({
      error: "name or number missing",
    });
  }

  /*if (persons.some((person) => person.name === body.name)) {
    console.log("A person with the name you are trying to post already exists");
    return response.status(409).json({
      error: "name must be unique",
    });
  }*/

  const person = new Person({
    //id: generateId(),
    name: body.name,
    number: body.number,
  });

  person.save().then((savedPerson) => {
    response.json(savedPerson);
  });
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
