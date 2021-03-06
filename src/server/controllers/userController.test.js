require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { default: mongoose } = require("mongoose");
const User = require("../../database/models/user");
const databaseConnect = require("../../database/index");
const { loginUser } = require("./userController");
const Movie = require("../../database/models/Movie");

jest.mock("../../database/models/user");

let database;
let token;

beforeAll(async () => {
  database = await MongoMemoryServer.create();
  const uri = database.getUri();
  await databaseConnect(uri);
  jest.resetAllMocks();
});

let registeredUsername;
let registeredPassword;

beforeEach(async () => {
  registeredPassword = await bcrypt.hash("1234", 3);
  registeredUsername = "Marc";
  const userDataToken = {
    username: registeredUsername,
  };
  token = jwt.sign(userDataToken, process.env.JWT_SECRET);

  await User.create({
    username: registeredUsername,
    password: registeredPassword,
    movies: {},
  });

  await Movie.create({
    Title: "Hola",
    Type: "Movie",
    Genre: "Dama",
    Runtime: 3,
    Year: "2016",
    Director: "Director1",
    Writer: "Writer1",
    Actors: "Main protagonist",
    Plot: "Story of the movie",
    Poster: "df346",
  });
});

afterEach(async () => {
  await User.deleteMany({});
});

afterAll(() => {
  mongoose.connection.close();
  database.stop();
});

describe("Given a loginUser controller", () => {
  describe("When it receives a request with a correct username and correct password", () => {
    test("Then it should return a token", async () => {
      const password = "1234";
      const user = {
        username: registeredUsername,
        password,
      };
      const userData = {
        username: registeredUsername,
        password: registeredPassword,
      };

      User.findOne = jest.fn().mockResolvedValue(userData);
      jwt.sign = jest.fn().mockReturnValue(token);
      const req = {
        body: user,
      };
      const res = {
        json: jest.fn(),
      };
      const next = jest.fn();

      await loginUser(req, res, next);

      expect(User.findOne).toHaveBeenCalledWith({ username: user.username });
      expect(res.json).toHaveBeenCalledWith({ token });
    });
  });

  describe("When it receives a request with a wrong username and correct password", () => {
    test("Then it should return a 404 status with an error", async () => {
      const user = {
        password: "1234",
      };

      const req = {
        body: user,
      };
      const next = jest.fn();
      const expectedError = new Error("Wrong username, user not found");
      expectedError.code = 404;

      User.findOne = jest.fn().mockResolvedValue(user.username);
      await loginUser(req, null, next);

      expect(next).toHaveBeenCalledWith(expectedError);
    });
  });

  describe("When it receives a request with a correct username and wrong password", () => {
    test("Then it should return a 401 status with an error", async () => {
      const user = {
        username: "Lionel",
        password: "1234",
      };
      const req = {
        body: user,
      };
      const next = jest.fn();
      const expectedError = new Error("Wrong password");
      expectedError.code = 401;
      bcrypt.compare = jest.fn().mockResolvedValue();
      User.findOne = jest.fn().mockResolvedValue(user.username);

      await loginUser(req, null, next);

      expect(next).toHaveBeenCalledWith(expectedError);
    });
  });
});
