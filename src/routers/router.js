const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const auth = require("../middlewares/auth");
const User = require("../models/users");
const Post = require("../models/posts");

router.get("/", (req, res) => {
  res.send("Hello basu");
});

router.post("/adduser", async (req, res) => {
  const { name, email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    res.status(422).json({ msg: "User already Exist!" });
  } else {
    try {
      const user = new User({ name, email, password });
      await user.save();
      res.status(200).json({ msg: "User Created plaese Login" });
    } catch (err) {
      res.status(422).json({ msg: "Something Went Wrong" });
    }
  }
});
router.post("/loginwithgoogle", async (req, res) => {
  const { name, email, password, imageurl } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    const token = await user.generateAuthToken();
    res.cookie("jwt", token, {
      expires: new Date(Date.now() + 50000000),
      sameSite: "None",
      secure: true,
      httpOnly: true,
    });
    res.status(422).json({ msg: "User already Exist!" });
  } else {
    try {
      const user = new User({ name, email, password, imageurl });
      const token = await user.generateAuthToken();
      res.cookie("jwt", token, {
        expires: new Date(Date.now() + 50000000),
        sameSite: "None",
        secure: true,
        httpOnly: true,
      });
      await user.save();
      res.status(200).json({ msg: "User Created plaese Login" });
    } catch (err) {
      res.status(422).json({ msg: "Something Went Wrong" });
    }
  }
});

router.post("/loginuser", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user) {
      const bool = await bcrypt.compare(password, user.password);
      if (!bool) {
        res.status(422).json({ msg: "Username or password incorrect" });
      } else {
        const token = await user.generateAuthToken();
        console.log(bool);
        res.cookie("jwt", token, {
          expires: new Date(Date.now() + 50000000),
          sameSite: "None",
          secure: true,
          httpOnly: true,
        });
        res.status(200).json({ msg: "Log in succesfull" });
      }
    } else {
      res.status(422).json({ msg: "No Account Found" });
    }
  } catch (err) {
    res.status(422).json({ msg: "Something Went wrong" });
  }
});

router.get("/islogin", auth, async (req, res) => {
  res.status(200).json({ msg: "user logged in", user: req.rootUser });
});
router.post("/getuserbyid", auth, async (req, res) => {
  const { id } = req.body;
  try {
    const user = await User.findOne({ _id: id });
    res
      .status(200)
      .json({ msg: "user logged in", user, currentuserid: req.user_id });
  } catch (err) {
    res.status(422).json({ msg: "User Not found" });
  }
});

router.get("/logout", (req, res) => {
  res.clearCookie("jwt", {
    sameSite: "None",
    secure: true,
    // path: "https://splendorous-sable-15c3ce.netlify.app/",
  });
  res.status(200).json({ msg: "Log out" });
});

router.post("/updateprofile", auth, async (req, res) => {
  const { name, place, about, imageurl } = req.body;
  try {
    const user = await User.findOne({ _id: req.user_id });
    await user.updateOne({ name, place, about, imageurl });
    res.status(200).json({ msg: "updated" });
  } catch (err) {
    res.status(422).json({ msg: "Update Failed" });
  }
});

router.post("/createpost", auth, async (req, res) => {
  const { content, postimageurl } = req.body;
  try {
    const post = new Post({
      content,
      postimageurl,
      userid: req.user_id,
      username: req.rootUser.name,
      userimageurl: req.rootUser.imageurl,
    });
    await post.save();
    res.status(200).json({ msg: "Post Added SuccesFully" });
  } catch (err) {
    res.status(422).json({ msg: "Something Went Wrong" });
  }
});

router.get("/getposts", async (req, res) => {
  try {
    const posts = await Post.find();
    res.status(200).json({ msg: "Posts Found", posts });
  } catch (err) {
    res.status(422).json({ msg: "posts Not Found" });
  }
});
router.post("/deletepost", async (req, res) => {
  const { id } = req.body;
  try {
    await Post.findByIdAndDelete(id);
    res.status(200).json({ msg: "Deleted Successfully" });
  } catch (err) {
    res.status(422).json({ msg: "Delede Failed" });
  }
});

router.post("/getphotos", async (req, res) => {
  const { id } = req.body;
  try {
    const posts = await Post.find(
      { userid: id },
      { postimageurl: 1, likes: 1, _id: 0 }
    );
    res.status(200).json({ msg: "Posts Found", posts });
  } catch (err) {
    res.status(422).json({ msg: "Posts not found" });
  }
});

router.post("/like", auth, async (req, res) => {
  const { id } = req.body;
  try {
    const post = await Post.findOne({ _id: id });
    await post.updateOne({ likes: post.likes + 1 });
    res.status(200).json({ msg: "Updated" });
  } catch (err) {
    res.status(422).json({ msg: "Failed" });
  }
});
router.post("/comment", auth, async (req, res) => {
  const { id, commentText } = req.body;
  try {
    const post = await Post.findOne({ _id: id });
    const isComment = post.generateComment(req.rootUser.imageurl, commentText);
    if (isComment) res.status(200).json({ msg: "Commented" });
    else res.status(422).json({ msg: "Not Comment" });
  } catch (err) {
    res.status(422).json({ msg: "Failed" });
  }
});

router.post("/getuser", async (req, res) => {
  try {
    const user = User.findById(
      { _id: req.id },
      { name: 1, imageurl: 1, _id: 0 }
    );
    res.status(200).json({ msg: "User Found", user });
  } catch (err) {
    res.status(422).json({ msg: "User Not Found" });
  }
});

router.post("/searchuser", async (req, res) => {
  try {
    
    const users = await User.find({ name: req.body.name });
    res.status(200).json({msg:"Users Found",users})
  } catch (err) {
    res.status(422).json("User Not Found");
  }
});
module.exports = router;
