import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPostComments } from "../lib/api";

import { formatDistanceToNow } from "date-fns";

export const CommentList = ({ postId }) => {
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
