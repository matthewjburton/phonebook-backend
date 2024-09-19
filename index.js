const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
require("dotenv").config();
const Person = require("./models/person");

const app = express();

app.use(express.static("dist"));
app.use(express.json());
app.use(morgan("tiny"));
app.use(cors());

// Endpoint routes
app.get("/api/persons", (request, response, next) => {
  Person.find({})
    .then((persons) => {
      response.send(persons);
    })
    .catch((error) => next(error));
});

app.get("/api/persons/:id", (request, response) => {
  const id = request.params.id;

  Person.findById(id).then((person) => {
    if (person) {
      console.log("Person at requested id", person);
      response.json(person);
    } else {
      response.status(404).end();
    }
  });
});

app.get("/api/info", (request, response) => {
  const currentDate = new Date().toUTCString();

  Person.find({}).then((persons) => {
    console.log("Number of persons", persons.length, "Date", currentDate);
    response.send(
      `<p>Phonebook has info for ${persons.length} people</p>
    <p>${currentDate}</p>`
    );
  });
});

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

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
    name: body.name,
    number: body.number,
  });

  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson);
    })
    .catch((error) => next(error));
});

app.put("/api/persons/:id", (request, response) => {
  const body = request.body;
  const id = request.params.id;

  const updatedPerson = {
    name: body.name,
    number: body.number,
  };

  Person.findByIdAndUpdate(id, updatedPerson, {
    new: true,
    runValidators: true,
    context: "query",
  })
    .then((updatedPerson) => {
      console.log("Updated person", updatedPerson);
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

// Handle unknown endpoints
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

// Error handling
const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  }

  next(error);
};

app.use(errorHandler);

// Endpoint listener
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
