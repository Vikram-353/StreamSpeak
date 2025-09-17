import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import {
  HeartIcon,
  MessageSquareIcon,
  EditIcon,
  TrashIcon,
  MoreHorizontalIcon,
} from "lucide-react";
import { getPostComments } from "../lib/api";

import useAuthHook from "../hooks/useAuthHook";
import {
  getPostById,
  toggleLikePost,
  commentOnPost,
  updatePost,
  deletePost,
} from "../lib/api";
import { useParams } from "react-router";
import { CommentList } from "../components/CommentList";
function Post() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { authUser } = useAuthHook();
  const currentUserId = authUser?._id;

  const [commentText, setCommentText] = useState({});
  const [showComments, setShowComments] = useState({});
  const [editingPost, setEditingPost] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [showDropdown, setShowDropdown] = useState({});
  const [animatingLike, setAnimatingLike] = useState(null);
  console.log(id);

  // Fetch the single post by ID
  const { data: post, isLoading } = useQuery({
    queryKey: ["post", id],
    queryFn: () => getPostById(id),
    enabled: !!id,
  });
  console.log(post);
  // console.log(id);

  // Mutations
  const likeMutation = useMutation({
    mutationFn: toggleLikePost,
    onSuccess: () => queryClient.invalidateQueries(["post", id]),
  });

  const commentMutation = useMutation({
    mutationFn: ({ id, text }) => commentOnPost(id, text),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries(["post", id]);
      setCommentText((prev) => ({ ...prev, [id]: "" }));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, content, mediaUrl, mediaType }) =>
      updatePost(id, { content, mediaUrl, mediaType }),
    onSuccess: () => {
      queryClient.invalidateQueries(["post", id]);
      setEditingPost(null);
      setEditContent("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries(["post", id]);
    },
  });

  if (isLoading) return <p>Loading post...</p>;
  if (!post) return <p>Post not found.</p>;

  // Handlers
  const handleLike = () => {
    setAnimatingLike(id);
    likeMutation.mutate(id, { onSettled: () => setAnimatingLike(null) });
  };

  const handleComment = () => {
    if (commentText[id]?.trim()) {
      commentMutation.mutate({
        id: id,
        text: commentText[id].trim(),
      });
    }
  };

  const handleEditPost = () => {
    setEditingPost(id);
    setEditContent(post.content);
    setShowDropdown((prev) => ({ ...prev, [id]: false }));
  };

  const handleUpdatePost = () => {
    if (editContent.trim()) {
      updateMutation.mutate({
        id: id,
        content: editContent.trim(),
        mediaUrl: post.mediaUrl,
        mediaType: post.mediaType,
      });
    }
  };

  const handleDeletePost = () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      deleteMutation.mutate(id);
    }
    setShowDropdown({});
  };

  const toggleComments = () => {
    setShowComments((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleDropdown = () => {
    setShowDropdown((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const isPostLiked = () =>
    Array.isArray(post.likes) && post.likes.includes(currentUserId);
  const isPostOwner = () => post.user?._id === currentUserId;

  // Safe date formatting
  let formattedDate = "Unknown date";
  if (post.createdAt) {
    const dateObj = new Date(post.createdAt);
    if (!isNaN(dateObj.getTime()))
      formattedDate = formatDistanceToNow(dateObj, { addSuffix: true });
  }

  return (
    <div className="card-body space-y-3">
      {/* Post Header */}
      <div className="flex justify-between items-center">
        <div className="flex gap-3 items-center">
          <img
            className="h-10 w-10"
            src={post.user.profilePic}
            alt="profile pic"
          />
          <h3 className="font-semibold text-lg">{post.user.fullname}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm">{formattedDate}</span>
          {isPostOwner() && (
            <div className="relative">
              <button className="btn btn-ghost btn-sm" onClick={toggleDropdown}>
                <MoreHorizontalIcon className="size-4" />
              </button>
              {showDropdown[id] && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg z-10 border">
                  <button
                    className="w-full px-4 py-2 text-left hover:bg-gray-800 flex items-center gap-2"
                    onClick={handleEditPost}
                  >
                    <EditIcon className="size-4" />
                    Edit Post
                  </button>
                  <button
                    className="w-full px-4 py-2 text-left hover:bg-gray-800 text-red-600 flex items-center gap-2"
                    onClick={handleDeletePost}
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

      {/* Post Content */}
      {editingPost === id ? (
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
              onClick={handleUpdatePost}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Updating..." : "Update"}
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setEditingPost(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p>{post.content}</p>
      )}

      {/* Post Media */}
      {post.mediaType !== "none" && post.mediaUrl && (
        <div className="relative w-full rounded-xl overflow-hidden border">
          {post.mediaType === "image" ? (
            <img
              src={post.mediaUrl}
              alt="Post media"
              className="w-full h-auto max-h-[500px] object-contain cursor-pointer hover:opacity-95 transition-opacity"
              onClick={() => window.open(post.mediaUrl, "_blank")}
            />
          ) : post.mediaType === "video" ? (
            <video
              controls
              className="w-full h-auto max-h-[500px] object-contain"
            >
              <source src={post.mediaUrl} type="video/mp4" />
              <source src={post.mediaUrl} type="video/webm" />
              <source src={post.mediaUrl} type="video/ogg" />
              Your browser does not support the video tag.
            </video>
          ) : null}
        </div>
      )}

      {/* Post Actions */}
      <div className="flex gap-4 mt-2">
        <button
          className={`btn btn-sm ${
            isPostLiked() ? "btn-primary" : "btn-outline"
          } ${animatingLike === id ? "animate-pulse" : ""}`}
          onClick={handleLike}
          disabled={animatingLike === id}
        >
          <HeartIcon
            className={`size-4 mr-2 ${isPostLiked() ? "fill-current" : ""}`}
          />
          {post.likes.length} {post.likes.length === 1 ? "Like" : "Likes"}
        </button>

        <button className="btn btn-sm btn-outline" onClick={toggleComments}>
          <MessageSquareIcon className="size-4 mr-2" />
          Comments
        </button>

        <button
          className="btn btn-sm btn-outline"
          onClick={() => navigator.clipboard?.writeText(window.location.href)}
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

      {/* Comments Section */}
      {showComments[id] && (
        <div className="mt-4 space-y-3">
          <CommentList postId={id} />
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="Add a comment..."
              value={commentText[id] || ""}
              onChange={(e) =>
                setCommentText((prev) => ({
                  ...prev,
                  [id]: e.target.value,
                }))
              }
              onKeyPress={(e) => {
                if (e.key === "Enter") handleComment();
              }}
            />
            <button
              className="btn btn-primary"
              onClick={handleComment}
              disabled={commentMutation.isPending || !commentText[id]?.trim()}
            >
              {commentMutation.isPending ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

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

export default Post;
