import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAuthHook from "../hooks/useAuthHook";
import toast from "react-hot-toast";
import "react-confirm-alert/src/react-confirm-alert.css";
import {
  createPost,
  updatePost,
  deletePost,
  updateUserProfile,
  getProfilePosts,
} from "../lib/api.js";
import { axiosInstance } from "../lib/axios.js";
function ProfilePage() {
  const { authUser } = useAuthHook();
  const user = authUser;
  const queryClient = useQueryClient();

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    fullname: user?.fullname || "",
    email: user?.email || "",
    bio: user?.bio || "",
    nativeLanguage: user?.nativeLanguage || "",
    learningLanguage: user?.learningLanguage || "",
    location: user?.location || "",
  });
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);
  const [mediaType, setMediaType] = useState("");
  const [mediaPreview, setMediaPreview] = useState("");

  const [newPost, setNewPost] = useState("");
  const [editingPostId, setEditingPostId] = useState(null);
  const [updatedPost, setUpdatedPost] = useState("");

  const PRESET = import.meta.env.VITE_CLOUDINARY_PRESET;
  const CLOUDE = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

  const updateUserMutation = useMutation({
    mutationFn: (data) => updateUserProfile(user._id, data),
    onSuccess: () => {
      toast.success("Profile updated!");
      setEditMode(false);
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: () => toast.error("Failed to update profile"),
  });

  const createPostMutation = useMutation({
    mutationFn: async () => {
      let mediaUrl = "";

      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        const uploadResponse = await axiosInstance.post("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        mediaUrl = uploadResponse.data.url;
      }

      const postResponse = await axiosInstance.post("/posts", {
        content,
        mediaUrl,
        mediaType,
      });

      return postResponse.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userPosts"] });
      toast.success("Post created successfully!");
      setContent("");
      setFile(null);
      setMediaType("");
      setMediaPreview("");
    },
    onError: () => toast.error("Failed to create post"),
  });

  const {
    data: posts = [],
    isLoading: isPostsLoading,
    isError: isPostsError,
  } = useQuery({
    queryKey: ["userPosts", user?._id],
    queryFn: () => getProfilePosts(user._id),
    enabled: !!user?._id,
  });

  const updatePostMutation = useMutation({
    mutationFn: ({ postId, content }) => updatePost(postId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userPosts", user._id] });
      setEditingPostId(null);
      setUpdatedPost("");
      toast.success("Post updated successfully!");
    },
    onError: () => toast.error("Failed to update post"),
  });

  const deletePostMutation = useMutation({
    mutationFn: (postId) => deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userPosts", user._id] });
      toast.success("Post deleted successfully");
    },
    onError: () => toast.error("Failed to delete post"),
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEditToggle = () => setEditMode(!editMode);

  const handleUpdateUser = () => {
    updateUserMutation.mutate(formData);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const type = selectedFile.type.startsWith("image") ? "image" : "video";
      setMediaType(type);

      // Create preview URL
      const previewUrl = URL.createObjectURL(selectedFile);
      setMediaPreview(previewUrl);
    }
  };

  const removeMedia = () => {
    setFile(null);
    setMediaType("");
    if (mediaPreview) {
      URL.revokeObjectURL(mediaPreview);
      setMediaPreview("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return toast.error("Post content required");
    createPostMutation.mutate();
  };

  const handleUpdatePost = (postId) => {
    if (!updatedPost.trim()) return toast.error("Post content cannot be empty");
    updatePostMutation.mutate({ postId, content: updatedPost.trim() });
  };

  const handleDeletePost = (postId) => {
    toast.custom((t) => (
      <div className="bg-surface shadow-md rounded-lg p-4 w-[320px] border border-border">
        <h2 className="text-lg font-semibold mb-2 text-text">
          Confirm Deletion
        </h2>
        <p className="text-sm text-text-secondary mb-4">
          Are you sure you want to delete this post? This action cannot be
          undone.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            className="px-4 py-2 text-sm rounded btn-secondary"
            onClick={() => toast.dismiss(t.id)}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 text-sm rounded btn-danger"
            onClick={() => {
              deletePostMutation.mutate(postId);
              toast.dismiss(t.id);
            }}
          >
            Delete
          </button>
        </div>
      </div>
    ));
  };

  if (isPostsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="bg-surface shadow-md rounded-lg p-6 mb-6 border border-border">
          <h1 className="text-3xl font-bold text-text mb-6">Profile</h1>

          {/* Profile Section */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Profile Picture */}
            <div className="flex-shrink-0 text-center lg:text-left">
              <div className="relative inline-block">
                <img
                  src={user?.profilePic || "https://via.placeholder.com/150"}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-border shadow-lg"
                />
                <div className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full border-2 border-surface flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Profile Information */}
            <div className="flex-1">
              {editMode ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text mb-1">
                        Full Name
                      </label>
                      <input
                        name="fullname"
                        value={formData.fullname}
                        onChange={handleChange}
                        className="input w-full"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text mb-1">
                        Email
                      </label>
                      <input
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="input w-full"
                        placeholder="Enter your email"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text mb-1">
                        Native Language
                      </label>
                      <input
                        name="nativeLanguage"
                        value={formData.nativeLanguage}
                        onChange={handleChange}
                        className="input w-full"
                        placeholder="Your native language"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text mb-1">
                        Learning Language
                      </label>
                      <input
                        name="learningLanguage"
                        value={formData.learningLanguage}
                        onChange={handleChange}
                        className="input w-full"
                        placeholder="Language you're learning"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-text mb-1">
                        Location
                      </label>
                      <input
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="input w-full"
                        placeholder="Your location"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      rows={3}
                      className="input w-full resize-none"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleUpdateUser}
                      disabled={updateUserMutation.isPending}
                      className="btn px-6 py-2"
                    >
                      {updateUserMutation.isPending
                        ? "Saving..."
                        : "Save Changes"}
                    </button>
                    <button
                      onClick={handleEditToggle}
                      className="btn-secondary px-6 py-2"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wide">
                        Name
                      </h3>
                      <p className="text-lg text-text mt-1">
                        {user?.fullname || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wide">
                        Email
                      </h3>
                      <p className="text-lg text-text mt-1">
                        {user?.email || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wide">
                        Native Language
                      </h3>
                      <p className="text-lg text-text mt-1">
                        {user?.nativeLanguage || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wide">
                        Learning
                      </h3>
                      <p className="text-lg text-text mt-1">
                        {user?.learningLanguage || "Not specified"}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wide">
                        Location
                      </h3>
                      <p className="text-lg text-text mt-1">
                        {user?.location || "Not specified"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wide">
                      Bio
                    </h3>
                    <p className="text-lg text-text mt-1 leading-relaxed">
                      {user?.bio || "No bio provided"}
                    </p>
                  </div>
                  <button
                    onClick={handleEditToggle}
                    className="btn mt-6 px-6 py-2"
                  >
                    Edit Profile
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Create Post Section */}
        <div className="bg-surface shadow-md rounded-lg p-6 mb-6 border border-border">
          <h2 className="text-2xl font-semibold text-text mb-6 flex items-center gap-2">
            <svg
              className="w-6 h-6 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Create New Post
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <textarea
                className="input w-full resize-none"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind?"
                rows={4}
              />
            </div>

            {/* Media Preview */}
            {mediaPreview && (
              <div className="relative bg-background rounded-lg p-4 border-2 border-dashed border-border">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-sm font-medium text-text">
                    Media Preview
                  </h4>
                  <button
                    type="button"
                    onClick={removeMedia}
                    className="text-red-500 hover:text-red-700 p-1 rounded"
                    title="Remove media"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <div className="max-w-md mx-auto">
                  {mediaType === "image" ? (
                    <img
                      src={mediaPreview}
                      alt="Preview"
                      className="w-full h-auto rounded-lg shadow-sm border border-border"
                    />
                  ) : (
                    <video
                      src={mediaPreview}
                      controls
                      className="w-full h-auto rounded-lg shadow-sm border border-border"
                    />
                  )}
                </div>
                <p className="text-sm text-text-secondary mt-2 text-center">
                  {mediaType === "image" ? "Image" : "Video"} ready to upload
                  {file && ` (${(file.size / 1024 / 1024).toFixed(2)} MB)`}
                </p>
              </div>
            )}

            {/* File Input & Actions */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <label className="flex items-center gap-2 px-4 py-2 bg-background text-text rounded-lg hover:bg-opacity-80 cursor-pointer transition-colors border border-border">
                <svg
                  className="w-5 h-5 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                  />
                </svg>
                Add Media
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              <button
                type="submit"
                disabled={createPostMutation.isPending}
                className="btn px-8 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createPostMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Posting...
                  </span>
                ) : (
                  "Create Post"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Posts Section */}
        <div className="bg-surface shadow-md rounded-lg p-6 border border-border">
          <h2 className="text-2xl font-semibold text-text mb-6 flex items-center gap-2">
            <svg
              className="w-6 h-6 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            Your Posts ({posts.length})
          </h2>

          {isPostsError ? (
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 text-red-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-text-secondary text-lg">
                Failed to load posts
              </p>
              <p className="text-text-secondary text-sm mt-1">
                Please try refreshing the page
              </p>
            </div>
          ) : !posts || posts.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 text-text-secondary mx-auto mb-4 opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-text-secondary text-lg">No posts yet</p>
              <p className="text-text-secondary text-sm mt-1">
                Start sharing your thoughts with the community!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <div
                  key={post._id}
                  className="border border-border rounded-lg p-6 hover:shadow-sm transition-shadow bg-background"
                >
                  {editingPostId === post._id ? (
                    <div className="space-y-4">
                      <textarea
                        value={updatedPost}
                        onChange={(e) => setUpdatedPost(e.target.value)}
                        rows={4}
                        className="input w-full resize-none"
                        placeholder="Edit your post..."
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleUpdatePost(post._id)}
                          disabled={updatePostMutation.isPending}
                          className="btn px-4 py-2 disabled:opacity-50"
                        >
                          {updatePostMutation.isPending
                            ? "Updating..."
                            : "Update Post"}
                        </button>
                        <button
                          onClick={() => {
                            setEditingPostId(null);
                            setUpdatedPost("");
                          }}
                          className="btn-secondary px-4 py-2"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="mb-4">
                        <p className="text-text leading-relaxed whitespace-pre-wrap mb-4">
                          {post.content}
                        </p>

                        {/* Media Display */}
                        {post.mediaType !== "none" && post.mediaUrl && (
                          <div className="w-full max-h-[400px] overflow-hidden rounded-lg border border-border">
                            {post.mediaType === "image" ? (
                              <img
                                src={post.mediaUrl}
                                alt="Post media"
                                className="w-full h-auto object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() =>
                                  window.open(post.mediaUrl, "_blank")
                                }
                              />
                            ) : post.mediaType === "video" ? (
                              <video controls className="w-full rounded-lg">
                                <source src={post.mediaUrl} type="video/mp4" />
                                Your browser does not support the video tag.
                              </video>
                            ) : null}
                          </div>
                        )}
                      </div>

                      {/* Post Actions */}
                      <div className="flex gap-3 pt-4 border-t border-border">
                        <button
                          onClick={() => {
                            setEditingPostId(post._id);
                            setUpdatedPost(post.content);
                          }}
                          className="flex items-center gap-2 px-3 py-1.5 text-text-secondary hover:text-primary hover:bg-background rounded-lg transition-colors"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeletePost(post._id)}
                          disabled={deletePostMutation.isPending}
                          className="flex items-center gap-2 px-3 py-1.5 text-text-secondary hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          {deletePostMutation.isPending
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
