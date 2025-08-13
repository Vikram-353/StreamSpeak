import React, { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAuthHook from "../hooks/useAuthHook";
import toast from "react-hot-toast";
import "react-confirm-alert/src/react-confirm-alert.css";
// import PageLoader from "../components/PageLoader.jsx";
import PageLoader from "../components/pageLoader.jsx";
import { PostCard } from "../components/PostCard.jsx";
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
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [isDeletingPost, setIsDeletingPost] = useState(false);

  const [editingPostId, setEditingPostId] = useState(null);
  const [updatedPost, setUpdatedPost] = useState("");

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
      setIsCreatingPost(true);

      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        const uploadResponse = await axiosInstance.post("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        mediaUrl = uploadResponse.data.url;
      }

      // Now save to DB with mediaUrl
      const postResponse = await axiosInstance.post("/posts", {
        content,
        mediaUrl,
        mediaType, // Or detect dynamically
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
      setIsCreatingPost(false);
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

  useEffect(() => {
    if (file) {
      const type = file.type.startsWith("video") ? "video" : "image";
      setMediaType(type);
    }
  }, [file]);

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
    setIsDeletingPost(true);

    toast.custom((t) => (
      <div className="bg-surface text-foreground shadow-lg rounded-lg p-4 w-[320px] border border-border transition-all duration-300">
        <h2 className="text-lg font-semibold mb-2">Confirm Deletion</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Are you sure you want to delete this post? This action cannot be
          undone.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            className="px-4 py-2 text-sm rounded-md bg-muted text-foreground hover:bg-muted/80 transition"
            onClick={() => toast.dismiss(t.id)}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 text-sm rounded-md bg-destructive text-white hover:bg-destructive/90 transition"
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

    setIsDeletingPost(false);
  };

  if (isPostsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Posting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <div className="container mx-auto px-4 py-4 sm:py-8 max-w-4xl">
        {/* Header */}
        <div className=" shadow-lg rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 border">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">
            Profile
          </h1>

          {/* Profile Section */}
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Profile Picture */}
            <div className="flex-shrink-0 text-center lg:text-left">
              <div className="relative inline-block">
                <img
                  src={user?.profilePic || "https://via.placeholder.com/150"}
                  alt="Profile"
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4  shadow-lg"
                />
                <div className="absolute bottom-0 right-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center">
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4 "
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-xs sm:text-sm font-medium uppercase tracking-wide">
                        Name
                      </h3>
                      <p className="text-base sm:text-lg  mt-1">
                        {user?.fullname || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-medium  uppercase tracking-wide">
                        Email
                      </h3>
                      <p className="text-base sm:text-lg mt-1 break-all">
                        {user?.email || "Not provided"}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Native Language
                      </label>
                      <input
                        name="nativeLanguage"
                        value={formData.nativeLanguage}
                        onChange={handleChange}
                        className="w-full p-3 border  rounded-lg focus:ring-2  focus:border-transparent"
                        placeholder="Your native language"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium  mb-1">
                        Learning Language
                      </label>
                      <input
                        name="learningLanguage"
                        value={formData.learningLanguage}
                        onChange={handleChange}
                        className="w-full p-3 border  rounded-lg focus:ring-2 focus:border-transparent"
                        placeholder="Language you're learning"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium  mb-1">
                        Location
                      </label>
                      <input
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="w-full p-3 border  rounded-lg focus:ring-2 focus:border-transparent"
                        placeholder="Your location"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium  mb-1">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      rows={3}
                      className="w-full p-3 border  rounded-lg resize-none focus:ring-2 focus:border-transparent"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button
                      onClick={handleUpdateUser}
                      disabled={!editMode}
                      className="px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {!editMode ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      onClick={handleEditToggle}
                      className="px-6 py-2   rounded-lg  transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <h3 className="text-xs sm:text-sm font-medium uppercase tracking-wide">
                        Name
                      </h3>
                      <p className="text-base sm:text-lg  mt-1">
                        {user?.fullname || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-medium  uppercase tracking-wide">
                        Email
                      </h3>
                      <p className="text-base sm:text-lg mt-1 break-all">
                        {user?.email || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-medium  uppercase tracking-wide">
                        Native Language
                      </h3>
                      <p className="text-base sm:text-lg mt-1">
                        {user?.nativeLanguage || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-medium  uppercase tracking-wide">
                        Learning
                      </h3>
                      <p className="text-base sm:text-lg mt-1">
                        {user?.learningLanguage || "Not specified"}
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <h3 className="text-xs sm:text-sm font-medium  uppercase tracking-wide">
                        Location
                      </h3>
                      <p className="text-base sm:text-lg mt-1">
                        {user?.location || "Not specified"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-medium  uppercase tracking-wide">
                      Bio
                    </h3>
                    <p className="text-base sm:text-lg mt-1 leading-relaxed">
                      {user?.bio || "No bio provided"}
                    </p>
                  </div>
                  <button
                    onClick={handleEditToggle}
                    className="mt-6 px-6 py-2  rounded-lg transition-colors"
                  >
                    Edit Profile
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Create Post Section */}
        <form action="" onSubmit={handleSubmit}>
          <div className=" shadow-lg rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 border ">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 flex items-center gap-2">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 "
                fill="none"
                // stroke="currentColor"
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

            <div className="space-y-4">
              <div>
                <textarea
                  className="w-full p-3 border  rounded-lg resize-none focus:ring-2 focus:border-transparent"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What's on your mind?"
                  rows={4}
                />
              </div>

              {/* Enhanced Media Preview */}
              {mediaPreview && (
                <div className="relative rounded-xl p-4 border-2 border-dashed ">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-sm font-medium ">Media Preview</h4>
                    <button
                      type="button"
                      onClick={removeMedia}
                      className=" p-1 rounded transition-colors"
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
                  <div className="w-full max-w-md mx-auto">
                    {mediaType === "image" ? (
                      <img
                        src={mediaPreview}
                        alt="Preview"
                        className="w-full h-auto max-h-64 object-contain rounded-lg shadow-sm border "
                      />
                    ) : (
                      <video
                        src={mediaPreview}
                        controls
                        className="w-full h-auto max-h-64 object-contain rounded-lg shadow-sm border "
                      />
                    )}
                  </div>
                  <p className="text-sm mt-2 text-center">
                    {mediaType === "image" ? "Image" : "Video"} ready to upload
                    {file && ` (${(file.size / 1024 / 1024).toFixed(2)} MB)`}
                  </p>
                </div>
              )}

              {/* File Input & Actions */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <label className="flex items-center gap-2 px-4 py-2 rounded-lg  cursor-pointer transition-colors border ">
                  <svg
                    className="w-5 h-5 "
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
                  <span className="text-sm">Add Media</span>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                <button
                  type="submit"
                  disabled={isCreatingPost}
                  className="w-full sm:w-auto px-8 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isCreatingPost ? (
                    <span className="flex items-center justify-center gap-2">
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
            </div>
          </div>
        </form>
        {/* Posts Section */}
        <div className=" shadow-lg rounded-xl p-4 sm:p-6 border ">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 flex items-center gap-2">
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 "
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

          {posts.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 mx-auto mb-4 opacity-50"
                fill="none"
                // stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className=" text-lg">No posts yet</p>
              <p className=" text-sm mt-1">
                Start sharing your thoughts with the community!
              </p>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  onEdit={() => {
                    setEditingPostId(post._id);
                    setUpdatedPost(post.content);
                  }}
                  onDelete={() => handleDeletePost(post._id)}
                  isDeleting={isDeletingPost}
                  isEditing={editingPostId === post._id}
                  editingContent={updatedPost}
                  onEditChange={setUpdatedPost}
                  onUpdate={() => handleUpdatePost(post._id)}
                  onCancelEdit={() => {
                    setEditingPostId(null);
                    setUpdatedPost("");
                  }}
                  // isUpdating={isUpdatingPost}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
