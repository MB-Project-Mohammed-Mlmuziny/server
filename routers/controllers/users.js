const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const usersModel = require("./../../db/models/users");

const SALT = Number(process.env.SALT);
const SECRET = process.env.SECRETKEY;

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const savedEmail = email.toLowerCase();
    const savedPassword = await bcrypt.hash(password, SALT);

    const newUser = new usersModel({
      name,
      email: savedEmail,
      password: savedPassword,
    });

    newUser
      .save()
      .then(async (result) => {
        res.status(201).json(result);
      })
      .catch((err) => {
        res.status(400).json({ error: err.message });
      });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const logIn = (req, res) => {
  try {
    const { nameOrEmail, password } = req.body;

    const savedEmail = nameOrEmail.toLowerCase();

    console.log(nameOrEmail);

    usersModel
      .findOne({
        $or: [{ name: nameOrEmail }, { email: savedEmail }],
        isBlocked: false,
        // isVerified: true,
      })
      // .populate("role")
      .then(async (result) => {
        if (result) {
          if (result.email === savedEmail || result.name === nameOrEmail) {
            const savedPassword = await bcrypt.compare(
              password,
              result.password
            );

            if (savedPassword || result.name === nameOrEmail) {
              const payload = {
                // role: result.role,
                id: result._id,
              };

              const options = {
                expiresIn: "9000m",
              };

              const token = await jwt.sign(payload, SECRET, options);

              res.status(200).json({ result, token });
            } else {
              res.status(400).json({ message: "invalid email or password" });
            }
          } else {
            res.status(400).json({ message: "invalid email or password" });
          }
        } else {
          res.status(404).json({ message: "email dose not exist" });
        }
      })
      .catch((err) => {
        res.status(400).json({ error: err.message });
      });
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: err.message });
  }
};

const setting = (req, res) => {
  try {
    const userId = req.params.userId;
    const { name, headline, about, avatar } = req.body;

    const update = {};

    if (name) update.name = name;
    if (headline) update.heading = headline;
    if (about) update.about = about;
    if (avatar) update.avatar = avatar;

    usersModel
      .findByIdAndUpdate(userId, update, { new: true })
      .then((result) => {
        res.status(200).json(result);
      })
      .catch((err) => {
        res.status(400).json({ error: err.message });
      });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { register, logIn, setting };