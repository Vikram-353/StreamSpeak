import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";

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
  } catch (error) {
    console.error("Error in getMyFriends controller", error.message);
    res.status(500).json({ message: "Internal server error. " });
  }
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

    const reciepent = await User.findById(reciepentId);

    if (!reciepent) {
      return res.status(404).json({ message: "Receipent not found" });
    }

    //check if already friends

    if (reciepent.friends.includes(myId)) {
      return res.status(404).json({ message: "You are already friends." });
    }

    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: myId, recipient: reciepentId },
        { sender: reciepentId, recipient: myId },
      ],
    });

    if (existingRequest) {
      return res.status(404).json({
        message: "A friend request lready exists between you and this user.",
      });
    }

    const friendRequest = await FriendRequest.create({
      sender: myId,
      recipient: reciepentId,
    });

    res.status(201).json(friendRequest);
  } catch (error) {
    console.error("Error in friend Request controller", error.message);
    res.status(500).json({ message: "Internal server error. " });
  }
}

export async function acceptfriendRequest(req, res) {
  try {
    const { id: requestId } = req.params;

    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found." });
    }
    //Verify the current user is the reciepent
    if (friendRequest.recipient.toString() !== req.user.id) {
      return res.status(400).json({ message: "Unauthorized action." });
    }

    friendRequest.status = "accepted";
    await friendRequest.save();

    //add each user to the others friends
    //addToSet: A mongodb update operator that adds an element to array if it does not already exists.
    await User.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: { friends: friendRequest.recipient },
    });
    await User.findByIdAndUpdate(friendRequest.recipient, {
      $addToSet: { friends: friendRequest.sender },
    });

    res.status(200).json({ message: "Friend Request accepted." });
  } catch (error) {
    console.error("Error in acceptFriendRequest controller", error.message);
    res.status(500).json({ message: "Internal server error. " });
  }
}

export async function getfriendRequest(req, res) {
  try {
    const incomingRequest = await FriendRequest.find({
      recipient: req.user.id,
      status: "pending",
    }).populate(
      "sender",
      "fullname profilePic nativeLanguage learningLanguage"
    );

    const acceptedReqs = await FriendRequest.find({
      recipient: req.user.id,
      status: "accepted",
    }).populate("recipient", "fullname profilePic ");

    res.status(200).json({ incomingRequest, acceptedReqs });
  } catch (error) {
    console.error("Error in getFriendRequest controller", error.message);
    res.status(500).json({ message: "Internal server error. " });
  }
}

export async function getOutgoingFriendRequest(req, res) {
  try {
    const outgoingRequests = await FriendRequest.find({
      sender: req.user.id,
      status: "pending",
    }).populate(
      "reciepent",
      "fullname profilePic nativeLanguage learningLanguage"
    );

    res.status(200).json(outgoingRequests);
  } catch (error) {
    console.error(
      "Error in getOutgoingFriendRequest controller",
      error.message
    );
    res.status(500).json({ message: "Internal server error. " });
  }
}
