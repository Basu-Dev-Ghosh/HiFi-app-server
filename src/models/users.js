const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UsersSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
  place:{
    type:String,
    default:"India"
  },
  imageurl:{
    type:String,
    default:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRUJt3kjJp8q750SzS-kr7cMITugGpEh-Vdq0NeWS4&s"
  },
  about:{
    type:String,
    default:"",
  },
  photos:{
    type:Number,
    default:0,
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});
UsersSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
    next();
  }
});
UsersSchema.methods.generateAuthToken = async function () {
  try {
    const token = jwt.sign({ _id: this._id }, process.env.SECRET_KEY);
    this.tokens = this.tokens.concat({ token: token });
    await this.save();
    return token;
  } catch (err) {
    res.status(422).json({msg:"Jwt not set"});
  }
};
const User = new mongoose.model("User", UsersSchema);
module.exports = User;
