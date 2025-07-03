import User from "../models/User.js";

export async function getRecommendedUsers(req, res) {
  try {
    const currentUserId = req.user.id;
    const currentUser = await req.user;

    const recommendedUsers = await User.find({
      $and: [
        { _id: { $ne: currentUserId } },
        { $id: { $nin: currentUser.friends } },
        { isOnboarded },
      ],
    });

    res.status(200).json(recommendedUsers);
  } catch (error) {
    console.error("Error in getRecommended controller", error.message);
    res.status(500).json({ message: "Internal server error. " });
  }
}

export async function getMyFriends(req, res) {
  try {
    const user = await User.findById(req.user.id)
      .select("friends")
      .populate(
        "friends",
        "fullname proilePic nativeLanguage learningLanguage"
      );

    res.status(200).json(user.friends);
  } catch (error) {}
}

export async function sendfriendRequest(req, res) {
  try {
    const muId = req.user.id;
    const { id: reciepentId } = req.params;

    if (myId === reciepentId) {
      return res
        .ststus(400)
        .json({ message: "You can't send request to yourself." });
    }
  } catch (error) {}
}
