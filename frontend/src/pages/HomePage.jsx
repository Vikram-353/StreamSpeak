import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import useAuthHook from "../hooks/useAuthHook";
import {
  getAllPosts,
  toggleLikePost,
  commentOnPost,
  getPostComments,
  updatePost,
  deletePost,
} from "../lib/api";
import {
  HeartIcon,
  MessageSquareIcon,
  EditIcon,
  TrashIcon,
  MoreHorizontalIcon,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const HomePage = () => {
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState({});
  const [showComments, setShowComments] = useState({});
  const [editingPost, setEditingPost] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [showDropdown, setShowDropdown] = useState({});
  const { authUser } = useAuthHook();

  const currentUserId = authUser._id;

  // Fetch all posts
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: getAllPosts,
  });

  const likeMutation = useMutation({
    mutationFn: toggleLikePost,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["posts"] }),
  });

  const commentMutation = useMutation({
    mutationFn: ({ postId, text }) => commentOnPost(postId, text),
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setCommentText((prev) => ({ ...prev, [postId]: "" }));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ postId, content, mediaUrl, mediaType }) =>
      updatePost(postId, { content, mediaUrl, mediaType }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setEditingPost(null);
      setEditContent("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const handleLike = (postId) => {
    likeMutation.mutate(postId);
  };

  const handleComment = (postId) => {
    if (commentText[postId]?.trim()) {
      commentMutation.mutate({ postId, text: commentText[postId].trim() });
    }
  };

  const handleEditPost = (post) => {
    setEditingPost(post._id);
    setEditContent(post.content);
    setShowDropdown((prev) => ({ ...prev, [post._id]: false }));
  };

  const handleUpdatePost = (postId) => {
    if (editContent.trim()) {
      const post = posts.find((p) => p._id === postId);
      updateMutation.mutate({
        postId,
        content: editContent.trim(),
        mediaUrl: post.mediaUrl,
        mediaType: post.mediaType,
      });
    }
  };

  const handleDeletePost = (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      deleteMutation.mutate(postId);
    }
    setShowDropdown((prev) => ({ ...prev, [postId]: false }));
  };

  const toggleComments = (postId) => {
    setShowComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const toggleDropdown = (postId) => {
    setShowDropdown((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const isPostLiked = (post) => {
    return post.likes.includes(currentUserId);
  };

  const isPostOwner = (post) => {
    return post?.user?._id === currentUserId;
    // return true;
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Latest Posts</h2>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <span className="loading loading-spinner loading-lg" />
        </div>
      ) : posts.length === 0 ? (
        <p className="text-center text-gray-500">No posts available.</p>
      ) : (
        posts.map((post) => (
          <div
            key={post._id}
            className="card bg-base-100 shadow-sm mb-6 border border-gray-200"
          >
            <div className="card-body space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg">{post.user.fullname}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">
                    {formatDistanceToNow(new Date(post.createdAt))} ago
                  </span>

                  {/* Post Actions Dropdown - Only for post owner */}
                  {isPostOwner(post) && (
                    <div className="relative">
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => toggleDropdown(post._id)}
                      >
                        <MoreHorizontalIcon className="size-4" />
                      </button>

                      {showDropdown[post._id] && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                          <button
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                            onClick={() => handleEditPost(post)}
                          >
                            <EditIcon className="size-4" />
                            Edit Post
                          </button>
                          <button
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 text-red-600 flex items-center gap-2"
                            onClick={() => handleDeletePost(post._id)}
                          >
                            <TrashIcon className="size-4" />
                            Delete Post
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Post Content - Editable if in edit mode */}
              {editingPost === post._id ? (
                <div className="space-y-2">
                  <textarea
                    className="textarea textarea-bordered w-full"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleUpdatePost(post._id)}
                      disabled={updateMutation.isPending}
                    >
                      {updateMutation.isPending ? "Updating..." : "Update"}
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => {
                        setEditingPost(null);
                        setEditContent("");
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p>{post.content}</p>
              )}

              {/* Media Display */}
              {post.mediaType !== "none" && post.mediaUrl && (
                <div className="w-full max-h-[400px] overflow-hidden rounded">
                  {post.mediaType === "image" ? (
                    <img
                      src={post.mediaUrl}
                      alt="Post media"
                      className="rounded object-cover w-full cursor-pointer"
                      onClick={() => window.open(post.mediaUrl, "_blank")}
                    />
                  ) : post.mediaType === "video" ? (
                    <video controls className="w-full rounded">
                      <source src={post.mediaUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  ) : null}
                </div>
              )}

              {/* Like & Comment Buttons */}
              <div className="flex gap-4 mt-2">
                <button
                  className={`btn btn-sm ${
                    isPostLiked(post) ? "btn-primary" : "btn-outline"
                  }`}
                  onClick={() => handleLike(post._id)}
                  disabled={likeMutation.isPending}
                >
                  <HeartIcon
                    className={`size-4 mr-2 ${
                      isPostLiked(post) ? "fill-current" : ""
                    }`}
                  />
                  {post.likes.length}{" "}
                  {post.likes.length === 1 ? "Like" : "Likes"}
                </button>

                <button
                  className="btn btn-sm btn-outline"
                  onClick={() => toggleComments(post._id)}
                >
                  <MessageSquareIcon className="size-4 mr-2" />
                  Comments
                </button>
              </div>

              {/* Comment Section */}
              {showComments[post._id] && (
                <div className="mt-4 space-y-3">
                  <CommentList postId={post._id} />
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      className="input input-bordered w-full"
                      placeholder="Add a comment..."
                      value={commentText[post._id] || ""}
                      onChange={(e) =>
                        setCommentText((prev) => ({
                          ...prev,
                          [post._id]: e.target.value,
                        }))
                      }
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleComment(post._id);
                        }
                      }}
                    />
                    <button
                      className="btn btn-primary"
                      onClick={() => handleComment(post._id)}
                      disabled={
                        commentMutation.isPending ||
                        !commentText[post._id]?.trim()
                      }
                    >
                      {commentMutation.isPending ? "Posting..." : "Post"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))
      )}

      {/* Click outside to close dropdowns */}
      {Object.values(showDropdown).some(Boolean) && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowDropdown({})}
        />
      )}
    </div>
  );
};

// Enhanced Comment List Component
// const CommentList = ({ postId }) => {
//   const { data: comments = [], isLoading } = useQuery({
//     queryKey: ["comments", postId],
//     queryFn: () => getPostComments(postId),
//   });

//   if (isLoading)
//     return <p className="text-sm text-gray-500">Loading comments...</p>;

//   return (
//     <div className="space-y-2 max-h-60 overflow-y-auto">
//       {comments.length === 0 ? (
//         <p className="text-sm text-gray-400">
//           No comments yet. Be the first to comment!
//         </p>
//       ) : (
//         comments.map((comment) => (
//           <div
//             key={comment._id}
//             className="text-sm border-b pb-2 last:border-b-0"
//           >
//             <div className="flex justify-between items-start">
//               <div>
//                 <strong className="text-primary">{comment.user.name}:</strong>
//                 <span className="ml-2">{comment.text}</span>
//               </div>
//               {comment.createdAt && (
//                 <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
//                   {formatDistanceToNow(new Date(comment.createdAt))} ago
//                 </span>
//               )}
//             </div>
//           </div>
//         ))
//       )}
//     </div>
//   );
// };

const CommentList = ({ postId }) => {
  const {
    data: comments = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["comments", postId],
    queryFn: () => getPostComments(postId),
    retry: 1,
  });

  if (isLoading)
    return <p className="text-sm text-gray-500">Loading comments...</p>;

  if (error) {
    console.error("Error loading comments:", error);
    return <p className="text-sm text-red-500">Failed to load comments.</p>;
  }

  // Ensure comments is an array
  const commentsArray = Array.isArray(comments) ? comments : [];

  return (
    <div className="space-y-2 max-h-60 overflow-y-auto">
      {commentsArray.length === 0 ? (
        <p className="text-sm text-gray-400">
          No comments yet. Be the first to comment!
        </p>
      ) : (
        commentsArray.map((comment) => (
          <div
            key={comment._id}
            className="text-sm border-b pb-2 last:border-b-0"
          >
            <div className="flex justify-between items-start">
              <div>
                <strong className="text-primary">
                  {comment.user?.fullname || "Unknown User"}:
                </strong>
                <span className="ml-2">{comment.text}</span>
              </div>
              {comment.createdAt && (
                <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                  {formatDistanceToNow(new Date(comment.createdAt))} ago
                </span>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};
export default HomePage;
