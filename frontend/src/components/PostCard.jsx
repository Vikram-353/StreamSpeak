export const PostCard = ({
  post,
  onEdit,
  onDelete,
  isDeleting,
  isEditing,
  editingContent,
  onEditChange,
  onUpdate,
  onCancelEdit,
  isUpdating,
}) => {
  return (
    <div className="border  rounded-xl p-4 sm:p-6 hover:shadow-lg transition-all duration-200 ">
      {isEditing ? (
        <div className="space-y-4">
          <textarea
            value={editingContent}
            onChange={(e) => onEditChange(e.target.value)}
            rows={4}
            className="w-full p-3 border  rounded-lg resize-none focus:ring-2  focus:border-transparent"
            placeholder="Edit your post..."
          />
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={onUpdate}
              disabled={isUpdating}
              className="px-4 py-2 rounded-lg  disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isUpdating ? "Updating..." : "Update Post"}
            </button>
            <button
              onClick={onCancelEdit}
              className="px-4 py-2  rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <p className=" leading-relaxed whitespace-pre-wrap mb-4 text-sm sm:text-base">
              {post.content}
            </p>

            {/* Enhanced Media Display */}
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
          </div>

          {/* Post Actions */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 border-t ">
            <button
              onClick={onEdit}
              className="flex items-center justify-center sm:justify-start gap-2 px-3 py-2   rounded-lg transition-colors"
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
              <span className="text-sm">Edit</span>
            </button>
            <button
              onClick={onDelete}
              disabled={isDeleting}
              className="flex items-center justify-center sm:justify-start gap-2 px-3 py-2  hover:text-red-600  rounded-lg transition-colors disabled:opacity-50"
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
              <span className="text-sm">
                {isDeleting ? "Deleting..." : "Delete"}
              </span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};
