const mongoose = require("mongoose");

const PostsSchema = new mongoose.Schema({
  content: {
    type: String,
  },
  postimageurl: {
    type: String,
  },
  userid: {
    type: mongoose.SchemaTypes.ObjectId,
  },
  username: {
    type: String,
  },
  userimageurl: {
    type: String,
  },
  likes: {
    type: Number,
    default: 0,
  },
  dislikes: {
    type: Number,
    default: 0,
  },
  comments: [
    {
      senderpic: {
        type:String,
      },
      text: {
        type: String,
      },
    },
  ],
});
PostsSchema.methods.generateComment = async function (senderpic, text) {
  try {
    this.comments = this.comments.concat({ senderpic, text });
    await this.save();
    return true;
  } catch (err) {
    res.status(422).json({ msg: "Jwt not set" });
  }
};
const Post = new mongoose.model("Post", PostsSchema);
module.exports = Post;
