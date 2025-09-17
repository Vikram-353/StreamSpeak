import { axiosInstance } from "./axios";

export const signup = async (signupData) => {
  const response = await axiosInstance.post("/auth/signup", signupData);
  return response.data;
};
export const login = async (loginData) => {
  const response = await axiosInstance.post("/auth/login", loginData);
  return response.data;
};
export const logout = async () => {
  const response = await axiosInstance.post("/auth/logout");
  return response.data;
};

export const getAuthUser = async () => {
  try {
    const res = await axiosInstance.get("/auth/me", {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    return null;
  }
};

export const completeOnboarding = async (userData) => {
  const response = await axiosInstance.post("/auth/onboarding", userData);
  return response.data;
};

export async function getRecommendedUsers() {
  const response = await axiosInstance.get("/users");
  return response.data;
}

export async function getOutgoingFriendReqs() {
  const response = await axiosInstance.get("/users/outgoing-friend-requests");
  return response.data;
}

export async function sendfriendRequest(userId) {
  const response = await axiosInstance.post(`/users/friend-request/${userId}`);
  return response.data;
}

export async function getUserFriends() {
  const response = await axiosInstance.get("/users/friends");
  return response.data;
}

export async function getFriendRequests() {
  const response = await axiosInstance.get("/users/friend-request");
  return response.data;
}
export async function acceptFriendRequests(requestId) {
  const response = await axiosInstance.put(
    `/users/friend-request/${requestId}/accept`
  );
  return response.data;
}

export async function getStreamToken() {
  const response = await axiosInstance.get("/chat/token");
  return response.data;
}

export const getAllPosts = async () => {
  const res = await axiosInstance.get("/posts");
  return res.data;
};

// Like a post
export const likePost = async (postId) => {
  const res = await axiosInstance.post(`/posts/like/${postId}`);
  return res.data;
};

// Comment on a post
export const commentOnPost = async (postId, commentText) => {
  const res = await axiosInstance.post(`/posts/comment/${postId}`, {
    text: commentText,
  });
  return res.data;
};

// Get comments on a post
export const getPostComments = async (postId) => {
  const res = await axiosInstance.get(`/posts/comment/${postId}`);
  return res.data;
};
export const getProfilePosts = async (userId) => {
  const res = await axiosInstance.get(`/profile/profile-posts/${userId}`);
  return res.data;
};
export const deletePost = async (postId) => {
  const res = await axiosInstance.delete(`/posts/${postId}`);
  return res.data;
};
export  const getPostById = async (postId) => {
  const res = await axiosInstance.get(`/posts/${postId}`);
  return res.data;
};
export const toggleLikePost = async (postId) => {
  const res = await axiosInstance.put(`/posts/like/${postId}`);
  return res.data;
};
export const updatePost = async (postId) => {
  const res = await axiosInstance.put(`/posts/${postId}`);
  return res.data;
};
export const createPost = async (data) => {
  const res = await axiosInstance.post(`/posts`, data, {
    withCredentials: true,
  });
  return res.data;
};
export const updateUserProfile = async (postId, data) => {
  const res = await axiosInstance.patch(
    `/profile/update-profile/${postId}`,
    data
  );
  return res.data;
};
