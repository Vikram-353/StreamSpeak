import User from "../models/User.js";
import Post from "../models/Post.js";
// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user._id; // assuming `req.user` is set by auth middleware

    const {
      fullname,
      bio,
      profilePic,
      nativeLanguage,
      learningLanguage,
      location,
    } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fields if provided
    user.fullname = fullname || user.fullname;
    user.bio = bio || user.bio;
    user.profilePic = profilePic || user.profilePic;
    user.nativeLanguage = nativeLanguage || user.nativeLanguage;
    user.learningLanguage = learningLanguage || user.learningLanguage;
    user.location = location || user.location;

    // Save the updated user
    const updatedUser = await user.save();

    res.json({
      success: true,
      user: {
        _id: updatedUser._id,
        fullname: updatedUser.fullname,
        email: updatedUser.email,
        bio: updatedUser.bio,
        profilePic: updatedUser.profilePic,
        nativeLanguage: updatedUser.nativeLanguage,
        learningLanguage: updatedUser.learningLanguage,
        location: updatedUser.location,
        isOnboarded: updatedUser.isOnboarded,
        friends: updatedUser.friends,
        posts: updatedUser.posts,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error.message);
    res.status(500).json({ message: "Server error while updating profile" });
  }
};

export const getProfilePosts = async (req, res) => {
  try {
    const userId = req.user.id; // Auth middleware should set this

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch posts made by this user
    const posts = await Post.find({ user: userId }).sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching profile posts:", error.message);
    res
      .status(500)
      .json({ message: "Server error while fetching profile posts" });
  }
};
