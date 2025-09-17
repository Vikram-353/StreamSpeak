import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import useAuthHook from "../hooks/useAuthHook";
import { CommentList } from "../components/CommentList";
import {
  getAllPosts,
  toggleLikePost,
  commentOnPost,
  updatePost,
  deletePost,
  getPostById,
} from "../lib/api";
import {
  HeartIcon,
  MessageSquareIcon,
  EditIcon,
  TrashIcon,
  MoreHorizontalIcon,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";

const HomePage = () => {
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState({});
  const [showComments, setShowComments] = useState({});
  const [editingPost, setEditingPost] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [showDropdown, setShowDropdown] = useState({});
  const [animatingLike, setAnimatingLike] = useState(null);

  const { authUser } = useAuthHook();

  const currentUserId = authUser._id;

  // Fetch all posts
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: getAllPosts,
  });
  const { data: postsById = {} } = useQuery({
    queryKey: ["post"],
    queryFn: getPostById,
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
    // likeMutation.mutate(postId);
    setAnimatingLike(postId); // only this post animates
    likeMutation.mutate(postId, {
      onSettled: () => {
        setAnimatingLike(null); // reset after mutation completes
      },
    });
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

  const handleShare = (post) => {
    const postUrl = `${window.location.origin}/posts/${post._id}`;

    if (navigator.share) {
      navigator
        .share({
          title: `${post.user.fullname}'s Post`,
          text: post.content,
          url: postUrl,
        })
        .catch((err) => console.warn("Share cancelled or failed:", err));
    } else if (navigator.clipboard) {
      navigator.clipboard
        .writeText(postUrl)
        .then(() => {
          toast.success("✅ Post link copied to clipboard!");
        })
        .catch((err) => {
          console.error("Clipboard write failed:", err);
          prompt("Copy this link manually:", postUrl);
        });
    } else {
      // ultimate fallback
      prompt("Copy this link manually:", postUrl);
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
        <p className="text-center ">No posts available.</p>
      ) : (
        posts.map((post) => (
          <div
            key={post._id}
            className="card bg-base-100 shadow-sm mb-6 border "
          >
            <div className="card-body space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex justify-between gap-3 items-center">
                  <img
                    className="h-10 w-10"
                    src={post.user.profilePic}
                    alt="profile pic"
                  />
                  <h3 className="font-semibold text-lg">
                    {post.user.fullname}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm ">
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
                        <div className="absolute right-0 mt-2  w-48 rounded-md shadow-lg z-10 border">
                          <button
                            className="w-full px-4 py-2 text-left hover:bg-gray-800 flex items-center gap-2"
                            onClick={() => handleEditPost(post)}
                          >
                            <EditIcon className="size-4" />
                            Edit Post
                          </button>
                          <button
                            className="w-full px-4 py-2 text-left hover:bg-gray-800  text-red-600 flex items-center gap-2"
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

              {post.mediaType !== "none" && post.mediaUrl && (
                <div className="relative w-full  rounded-xl overflow-hidden border ">
                  {post.mediaType === "image" ? (
                    <div className="relative w-full">
                      <img
                        src={post.mediaUrl}
                        alt="Post media"
                        className="w-full h-auto max-h-[300px] sm:max-h-[400px] md:max-h-[500px] object-contain cursor-pointer hover:opacity-95 transition-opacity"
                        onClick={() => window.open(post.mediaUrl, "_blank")}
                        style={{ display: "block" }}
                      />
                      <div className="absolute top-2 right-2 bg-black bg-opacity-50 px-2 py-1 rounded text-xs">
                        Click to expand
                      </div>
                    </div>
                  ) : post.mediaType === "video" ? (
                    <div className="relative w-full">
                      <video
                        controls
                        className="w-full h-auto max-h-[300px] sm:max-h-[400px] md:max-h-[500px] object-contain"
                        preload="metadata"
                      >
                        <source src={post.mediaUrl} type="video/mp4" />
                        <source src={post.mediaUrl} type="video/webm" />
                        <source src={post.mediaUrl} type="video/ogg" />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  ) : null}
                </div>
              )}

              {/* Like & Comment Buttons */}
              <div className="flex gap-4 mt-2">
                <button
                  className={`btn btn-sm ${
                    isPostLiked(post) ? "btn-primary" : "btn-outline"
                  } ${animatingLike === post._id ? "animate-pulse" : ""}`}
                  onClick={() => handleLike(post._id)}
                  disabled={animatingLike === post._id} // disable only clicked one
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
                <button
                  className="btn btn-sm btn-outline"
                  onClick={() => handleShare(post)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="size-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 8a3 3 0 100-6 3 3 0 000 6zM6 14a3 3 0 100-6 3 3 0 000 6zm9 8a3 3 0 100-6 3 3 0 000 6zM8.59 13.51l6.83-3.41M8.59 10.49l6.83 3.41"
                    />
                  </svg>
                  Share
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

// const CommentList = ({ postId }) => {
//   const {
//     data: comments = [],
//     isLoading,
//     error,
//   } = useQuery({
//     queryKey: ["comments", postId],
//     queryFn: () => getPostComments(postId),
//     retry: 1,
//   });

//   if (isLoading)
//     return <p className="text-sm text-gray-500">Loading comments...</p>;

//   if (error) {
//     console.error("Error loading comments:", error);
//     return <p className="text-sm text-red-500">Failed to load comments.</p>;
//   }

//   // Ensure comments is an array
//   const commentsArray = Array.isArray(comments) ? comments : [];

//   return (
//     <div className="space-y-2 max-h-60 overflow-y-auto">
//       {commentsArray.length === 0 ? (
//         <p className="text-sm text-gray-400">
//           No comments yet. Be the first to comment!
//         </p>
//       ) : (
//         commentsArray.map((comment) => (
//           <div
//             key={comment._id}
//             className="text-sm border-b pb-2 last:border-b-0"
//           >
//             <div className="flex justify-between items-start">
//               <div>
//                 <strong className="text-primary">
//                   {comment.user?.fullname || "Unknown User"}:
//                 </strong>
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
export default HomePage;
