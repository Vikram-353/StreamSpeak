import Post from "../models/Post.js";
import Comment from "../models/comments.js";
import User from "../models/User.js";

export const createPost = async (req, res) => {
  try {
    const { content, mediaUrl, mediaType } = req.body;

    const post = new Post({ user: req.user.id, content, mediaUrl, mediaType });
    await post.save();

    await User.findByIdAndUpdate(
      req.user.id,
      { $push: { posts: post._id } },
      { new: true }
    );

    res.status(201).json(post);
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get all posts
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "fullname profilePic")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update post
export const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.user.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    const { content, mediaUrl, mediaType } = req.body;
    post.content = content || post.content;
    post.mediaUrl = mediaUrl || post.mediaUrl;
    post.mediaType = mediaType || post.mediaType;

    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete post
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.user.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    await post.deleteOne();
    await Comment.deleteMany({ post: req.params.id });
    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "user",
      "fullname profilePic"
    );

    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Like/Unlike
export const toggleLikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const userId = req.user.id;
    const index = post.likes.indexOf(userId);

    if (index === -1) {
      post.likes.push(userId);
    } else {
      post.likes.splice(index, 1);
    }

    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Comment on post
export const commentOnPost = async (req, res) => {
  try {
    const comment = new Comment({
      post: req.params.id,
      user: req.user.id,
      text: req.body.text,
    });
    await comment.save();
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get comments
export const getPostComments = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.id })
      .populate("user", "fullname")
      .sort({ createdAt: 1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
