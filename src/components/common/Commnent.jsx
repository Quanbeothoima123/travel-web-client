import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Heart,
  ThumbsDown,
  Reply,
  Send,
  Eye,
  EyeOff,
  User,
  UserX,
  Loader2,
  ArrowDownWideNarrow,
  ChevronDown,
  ChevronUp,
  Trash2,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";

// Uncontrolled textarea component with IME support
const UncontrolledTextareaComponent = ({
  commentId,
  placeholder,
  className,
  rows,
  autoFocus,
  onFocus,
  onClick,
  onTextareaReady,
}) => {
  const textareaRef = useRef(null);
  const composingRef = useRef(false);

  useEffect(() => {
    if (textareaRef.current && onTextareaReady) {
      onTextareaReady(commentId, textareaRef.current);
      if (autoFocus) {
        setTimeout(() => {
          textareaRef.current?.focus();
        }, 100);
      }
    }
  }, [commentId, autoFocus, onTextareaReady]);

  const handleCompositionStart = useCallback(() => {
    composingRef.current = true;
  }, []);

  const handleCompositionEnd = useCallback(() => {
    composingRef.current = false;
  }, []);

  return (
    <textarea
      ref={textareaRef}
      placeholder={placeholder}
      className={className}
      rows={rows}
      onFocus={onFocus}
      onClick={onClick}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
    />
  );
};

const UncontrolledTextarea = React.memo(UncontrolledTextareaComponent);

const Commnent = ({ targetId, targetType = "news", currentUser }) => {
  // States
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState(null);
  const [sortBy, setSortBy] = useState("newest");
  const [repliesData, setRepliesData] = useState({});
  const [showReplies, setShowReplies] = useState({});
  const [newComment, setNewComment] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingComment, setDeletingComment] = useState(null);
  const [totalCommentsCount, setTotalCommentsCount] = useState(0);
  const [replyAnonymousStates, setReplyAnonymousStates] = useState({});

  // Refs
  const replyTextareaRefs = useRef(new Map());
  const mainTextareaRef = useRef(null);
  const activeReplyRef = useRef(null);
  const clickTimeoutRef = useRef(null);

  // Textarea management
  const registerTextarea = useCallback((commentId, textareaElement) => {
    if (textareaElement) {
      replyTextareaRefs.current.set(commentId, textareaElement);
      activeReplyRef.current = commentId;
    }
  }, []);

  const getReplyContent = useCallback((commentId) => {
    const textarea = replyTextareaRefs.current.get(commentId);
    return textarea ? textarea.value : "";
  }, []);

  const setReplyContent = useCallback((commentId, content) => {
    const textarea = replyTextareaRefs.current.get(commentId);
    if (textarea) {
      textarea.value = content;
    }
  }, []);

  const clearReplyData = useCallback((commentId) => {
    replyTextareaRefs.current.delete(commentId);
    setReplyAnonymousStates((prev) => {
      const updated = { ...prev };
      delete updated[commentId];
      return updated;
    });
  }, []);

  const getReplyAnonymousState = useCallback(
    (commentId) => replyAnonymousStates[commentId] || false,
    [replyAnonymousStates]
  );

  const setReplyAnonymousState = useCallback((commentId, value) => {
    setReplyAnonymousStates((prev) => ({
      ...prev,
      [commentId]: value,
    }));
  }, []);

  // Load comments
  useEffect(() => {
    if (targetId) {
      fetchComments(1, sortBy, true);
      fetchTotalCommentsCount();
    }
  }, [targetId, sortBy]);

  // Fetch total comments count
  const fetchTotalCommentsCount = async () => {
    if (!targetId) return;

    try {
      const response = await fetch(
        `${API_BASE}/api/v1/comments/count?targetId=${targetId}&targetType=${targetType}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (response.ok) {
        const result = await response.json();
        setTotalCommentsCount(result.data.totalCount || 0);
      }
    } catch (error) {
      console.error("Lỗi khi lấy tổng số bình luận:", error);
      setTotalCommentsCount(pagination?.totalComments || 0);
    }
  };

  // Helper functions
  const formatTime = (timestamp) => {
    const now = new Date();
    const commentTime = new Date(timestamp);
    const diff = now - commentTime;

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Vừa xong";
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;

    return commentTime.toLocaleDateString("vi-VN");
  };

  const getDisplayName = (comment) => {
    if (comment.privateInfoUser?.isAnonymous === true) {
      return comment.privateInfoUser.displayName || "Người dùng ẩn danh";
    }
    return comment.userId?.fullName || "Người dùng";
  };

  const getDisplayAvatar = (comment) => {
    if (comment.privateInfoUser?.isAnonymous === true) {
      return comment.privateInfoUser.avatar || "https://via.placeholder.com/40";
    }
    return comment.userId?.avatar || "https://via.placeholder.com/40";
  };

  const canDeleteComment = (comment) => {
    if (!currentUser) return false;
    if (currentUser.role === "admin") return true;

    if (comment.privateInfoUser?.isAnonymous === true) {
      return comment.privateInfoUser.userId === currentUser._id;
    } else {
      return comment.userId?._id === currentUser._id;
    }
  };

  // Fetch main comments
  const fetchComments = async (page = 1, newSortBy = sortBy, reset = false) => {
    if (!targetId) return;

    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        targetId,
        targetType,
        page,
        limit: 10,
        sortBy: newSortBy,
        loadReplies: "false",
      });

      const response = await fetch(
        `${API_BASE}/api/v1/comments/getComments?${queryParams}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (response.ok) {
        const result = await response.json();

        if (reset || page === 1) {
          setComments(result.data.comments);
          fetchTotalCommentsCount();
        } else {
          setComments((prev) => [...prev, ...result.data.comments]);
        }

        setPagination(result.data.pagination);
      }
    } catch (error) {
      console.error("Lỗi khi tải bình luận:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch replies (only 1 level)
  const fetchReplies = async (commentId, page = 1) => {
    setRepliesData((prev) => ({
      ...prev,
      [commentId]: {
        ...prev[commentId],
        loading: true,
      },
    }));

    try {
      const queryParams = new URLSearchParams({
        page,
        limit: 5,
        sortBy: "newest",
        includeNested: "false", // Only get direct replies
      });

      const response = await fetch(
        `${API_BASE}/api/v1/comments/replies/${commentId}?${queryParams}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (response.ok) {
        const result = await response.json();

        setRepliesData((prev) => ({
          ...prev,
          [commentId]: {
            replies:
              page === 1
                ? result.data.replies
                : [...(prev[commentId]?.replies || []), ...result.data.replies],
            pagination: result.data.pagination,
            loading: false,
          },
        }));
      }
    } catch (error) {
      console.error("Lỗi khi tải phản hồi:", error);
      setRepliesData((prev) => ({
        ...prev,
        [commentId]: {
          ...prev[commentId],
          loading: false,
        },
      }));
    }
  };

  // Handle sort change
  const handleSortChange = (newSort) => {
    if (newSort !== sortBy) {
      setSortBy(newSort);
    }
  };

  // Submit new comment
  const handleSubmitComment = async () => {
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE}/api/v1/comments/create`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetId,
          targetType,
          content: newComment,
          isAnonymous,
        }),
      });

      if (response.ok) {
        setNewComment("");
        setIsAnonymous(false);
        fetchComments(1, sortBy, true);
        fetchTotalCommentsCount();
      }
    } catch (error) {
      console.error("Lỗi khi gửi bình luận:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Submit reply
  const handleSubmitReply = async (parentId) => {
    const replyContent = getReplyContent(parentId);
    const isReplyAnonymous = getReplyAnonymousState(parentId);

    if (!replyContent.trim() || submitting) return;

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE}/api/v1/comments/create`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetId,
          targetType,
          content: replyContent,
          parentCommentId: parentId,
          isAnonymous: isReplyAnonymous,
        }),
      });

      if (response.ok) {
        setReplyContent(parentId, "");
        setReplyAnonymousState(parentId, false);
        setReplyingTo(null);
        clearReplyData(parentId);
        activeReplyRef.current = null;

        await fetchReplies(parentId, 1);
        fetchTotalCommentsCount();
        setShowReplies((prev) => ({
          ...prev,
          [parentId]: true,
        }));
      }
    } catch (error) {
      console.error("Lỗi khi gửi phản hồi:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId) => {
    setDeletingComment(commentId);
    try {
      const response = await fetch(
        `${API_BASE}/api/v1/comments/delete/${commentId}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        setComments((prev) =>
          prev.filter((comment) => comment._id !== commentId)
        );

        setRepliesData((prev) => {
          const updated = { ...prev };
          Object.keys(updated).forEach((parentId) => {
            if (updated[parentId]?.replies) {
              updated[parentId].replies = updated[parentId].replies.filter(
                (reply) => reply._id !== commentId
              );
            }
          });
          return updated;
        });

        clearReplyData(commentId);
        if (replyingTo === commentId) {
          setReplyingTo(null);
          activeReplyRef.current = null;
        }

        fetchTotalCommentsCount();
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Có lỗi xảy ra khi xóa bình luận");
      }
    } catch (error) {
      console.error("Lỗi khi xóa bình luận:", error);
      alert("Có lỗi xảy ra khi xóa bình luận");
    } finally {
      setDeletingComment(null);
    }
  };

  // Like/Unlike comment
  const handleLikeComment = async (commentId, isLiked) => {
    try {
      const endpoint = isLiked
        ? `${API_BASE}/api/v1/comments/unLike`
        : `${API_BASE}/api/v1/comments/like`;

      const response = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ commentId }),
      });

      if (response.ok) {
        const result = await response.json();
        updateCommentCounts(
          commentId,
          result.data.likeCount,
          result.data.dislikeCount,
          !isLiked,
          false
        );
      }
    } catch (error) {
      console.error("Lỗi khi like bình luận:", error);
    }
  };

  // Dislike/Undislike comment
  const handleDislikeComment = async (commentId, isDisliked) => {
    try {
      const endpoint = isDisliked
        ? `${API_BASE}/api/v1/comments/unDisLike`
        : `${API_BASE}/api/v1/comments/disLike`;

      const response = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ commentId }),
      });
      if (response.ok) {
        const result = await response.json();
        updateCommentCounts(
          commentId,
          result.data.likeCount,
          result.data.dislikeCount,
          false,
          !isDisliked
        );
      }
    } catch (error) {
      console.error("Lỗi khi dislike bình luận:", error);
    }
  };

  // Update comment counts
  const updateCommentCounts = (
    commentId,
    likeCount,
    dislikeCount,
    isLiked,
    isDisliked
  ) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment._id === commentId
          ? { ...comment, likeCount, dislikeCount, isLiked, isDisliked }
          : comment
      )
    );

    setRepliesData((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((parentId) => {
        if (updated[parentId]?.replies) {
          updated[parentId].replies = updated[parentId].replies.map((reply) =>
            reply._id === commentId
              ? { ...reply, likeCount, dislikeCount, isLiked, isDisliked }
              : reply
          );
        }
      });
      return updated;
    });
  };

  // Toggle replies visibility
  const toggleReplies = (commentId) => {
    const isShowing = showReplies[commentId];

    if (!isShowing) {
      if (!repliesData[commentId]) {
        fetchReplies(commentId, 1);
      }
    }

    setShowReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  // Load more replies
  const loadMoreReplies = (commentId) => {
    const currentData = repliesData[commentId];
    if (currentData?.pagination?.hasNextPage) {
      fetchReplies(commentId, currentData.pagination.currentPage + 1);
    }
  };

  // Load more comments
  const loadMoreComments = () => {
    if (pagination?.hasNextPage && !loading) {
      fetchComments(pagination.currentPage + 1, sortBy, false);
    }
  };

  // Handle cancel reply
  const handleCancelReply = useCallback(() => {
    if (!replyingTo) return;

    const currentReplyingTo = replyingTo;
    setReplyContent(currentReplyingTo, "");
    setReplyAnonymousState(currentReplyingTo, false);
    clearReplyData(currentReplyingTo);
    setReplyingTo(null);
    activeReplyRef.current = null;
  }, [replyingTo, setReplyContent, setReplyAnonymousState, clearReplyData]);

  // Handle reply button click
  const handleReplyClick = useCallback(
    (commentId) => {
      if (replyingTo && replyingTo !== commentId) {
        handleCancelReply();
      }
      setReplyingTo(commentId);
    },
    [replyingTo, handleCancelReply]
  );

  // Handle main textarea interaction
  const handleMainTextareaInteraction = useCallback((e) => {
    e.stopPropagation();

    if (activeReplyRef.current) {
      e.preventDefault();
      e.target.blur();

      const activeReplyTextarea = replyTextareaRefs.current.get(
        activeReplyRef.current
      );
      if (activeReplyTextarea) {
        setTimeout(() => {
          activeReplyTextarea.focus();
        }, 0);
      }
      return false;
    }
  }, []);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!replyingTo) return;

      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }

      clickTimeoutRef.current = setTimeout(() => {
        const replyForm = document.querySelector(
          `[data-reply-id="${replyingTo}"]`
        );
        const mainForm = document.querySelector(".new-comment-form");

        if (
          replyForm &&
          !replyForm.contains(event.target) &&
          !mainForm?.contains(event.target) &&
          !event.target.closest(".comment-actions") &&
          !event.target.closest(".action-btn")
        ) {
          const currentReplyingTo = replyingTo;
          setReplyContent(currentReplyingTo, "");
          setReplyAnonymousState(currentReplyingTo, false);
          clearReplyData(currentReplyingTo);
          setReplyingTo(null);
          activeReplyRef.current = null;
        }
      }, 150);
    };

    if (replyingTo) {
      document.addEventListener("click", handleClickOutside, true);
      return () => {
        document.removeEventListener("click", handleClickOutside, true);
        if (clickTimeoutRef.current) {
          clearTimeout(clickTimeoutRef.current);
        }
      };
    }
  }, [replyingTo, setReplyContent, setReplyAnonymousState, clearReplyData]);

  // Comment Item Component (2 levels only)
  const CommentItem = ({ comment, isReply = false, parentComment = null }) => {
    const displayName = getDisplayName(comment);
    const avatar = getDisplayAvatar(comment);

    const hasReplies = comment.repliesCount > 0;
    const replies = repliesData[comment._id]?.replies || [];
    const repliesPagination = repliesData[comment._id]?.pagination;
    const repliesLoading = repliesData[comment._id]?.loading || false;

    return (
      <div
        className={`flex gap-3 mb-4 ${
          isReply ? "ml-10 md:ml-12" : ""
        } relative`}
      >
        {isReply && (
          <>
            <div className="absolute left-[-28px] md:left-[-32px] top-[-6px] w-5 h-5 border-l-2 border-b-2 border-gray-300 rounded-bl-lg pointer-events-none"></div>
            <div className="absolute left-[-28px] md:left-[-32px] top-[-18px] w-0.5 h-[18px] bg-gray-300 pointer-events-none"></div>
          </>
        )}

        <div className="flex-shrink-0">
          <img
            src={avatar}
            alt={displayName}
            className="w-8 h-8 rounded-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="bg-gray-100 rounded-2xl px-3 py-2 inline-block max-w-full wrap-break-word">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <span className="font-semibold text-sm text-gray-900">
                {displayName}
              </span>
              {comment.privateInfoUser?.isAnonymous === true && (
                <UserX className="w-3 h-3 text-gray-500" />
              )}
              {isReply && parentComment && (
                <span className="text-xs text-blue-600 font-medium">
                  → {getDisplayName(parentComment)}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-900 leading-tight wrap-break-word">
              {comment.content}
            </p>
          </div>

          <div className="flex items-center gap-4 mt-1 text-xs text-gray-600 flex-wrap">
            <span className="font-semibold">
              {formatTime(comment.createdAt)}
            </span>

            <button
              onClick={() => handleLikeComment(comment._id, comment.isLiked)}
              className={`flex items-center gap-1 px-1.5 py-1 rounded transition-colors ${
                comment.isLiked
                  ? "text-red-500"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              disabled={!currentUser}
            >
              <Heart
                className={`w-3 h-3 ${comment.isLiked ? "fill-current" : ""}`}
              />
              <span className="font-semibold">{comment.likeCount || 0}</span>
            </button>

            <button
              onClick={() =>
                handleDislikeComment(comment._id, comment.isDisliked)
              }
              className={`flex items-center gap-1 px-1.5 py-1 rounded transition-colors ${
                comment.isDisliked
                  ? "text-blue-600"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              disabled={!currentUser}
            >
              <ThumbsDown
                className={`w-3 h-3 ${
                  comment.isDisliked ? "fill-current" : ""
                }`}
              />
              <span className="font-semibold">{comment.dislikeCount || 0}</span>
            </button>

            {currentUser && !isReply && (
              <button
                onClick={() => handleReplyClick(comment._id)}
                className="flex items-center gap-1 px-1.5 py-1 rounded text-gray-600 hover:bg-gray-100 hover:text-blue-600 transition-colors font-semibold"
              >
                <Reply className="w-3 h-3" />
                <span>Phản hồi</span>
              </button>
            )}

            {canDeleteComment(comment) && (
              <button
                onClick={() => handleDeleteComment(comment._id)}
                className="flex items-center gap-1 px-1.5 py-1 rounded text-gray-600 hover:bg-gray-100 hover:text-red-600 transition-colors font-semibold"
                disabled={deletingComment === comment._id}
              >
                {deletingComment === comment._id ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Trash2 className="w-3 h-3" />
                )}
                <span>Xóa</span>
              </button>
            )}

            {hasReplies && !isReply && (
              <button
                onClick={() => toggleReplies(comment._id)}
                className="flex items-center gap-1 px-1.5 py-1 rounded text-gray-600 hover:bg-gray-100 hover:text-blue-600 transition-colors font-semibold"
              >
                {showReplies[comment._id] ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
                {showReplies[comment._id] ? "Ẩn" : "Xem"} {comment.repliesCount}{" "}
                phản hồi
              </button>
            )}
          </div>

          {/* Reply Form */}
          {replyingTo === comment._id && currentUser && (
            <div className="flex gap-2 mt-3" data-reply-id={comment._id}>
              <img
                src={currentUser?.avatar || "https://via.placeholder.com/32"}
                alt="Avatar"
                className="w-6 h-6 rounded-full object-cover flex-shrink-0 mt-1"
              />
              <div className="flex-1">
                <div className="relative">
                  <UncontrolledTextarea
                    commentId={comment._id}
                    placeholder={`Phản hồi ${displayName}...`}
                    className="w-full min-h-[60px] px-2 py-2 pr-9 border border-gray-300 rounded-lg resize-none text-sm leading-tight outline-none focus:border-blue-600 transition-colors"
                    rows="2"
                    autoFocus={true}
                    onTextareaReady={registerTextarea}
                    onFocus={(e) => {
                      e.stopPropagation();
                      activeReplyRef.current = comment._id;
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  />
                  <button
                    onClick={() => handleSubmitReply(comment._id)}
                    className="absolute right-2 top-2 text-blue-600 hover:text-blue-700 hover:bg-gray-100 p-0.5 rounded transition-colors"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={getReplyAnonymousState(comment._id)}
                      onChange={(e) =>
                        setReplyAnonymousState(comment._id, e.target.checked)
                      }
                      className="w-4 h-4 cursor-pointer"
                    />
                    {getReplyAnonymousState(comment._id) ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                    Phản hồi ẩn danh
                  </label>
                  <button
                    onClick={handleCancelReply}
                    className="text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-1 py-0.5 rounded transition-colors"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Show replies (only direct replies, no nesting) */}
          {showReplies[comment._id] && (
            <div className="mt-2.5">
              {repliesLoading && replies.length === 0 && (
                <div className="flex items-center justify-center gap-2 py-4 text-gray-600 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang tải phản hồi...</span>
                </div>
              )}

              {replies.map((reply) => (
                <CommentItem
                  key={reply._id}
                  comment={reply}
                  isReply={true}
                  parentComment={comment}
                />
              ))}

              {repliesPagination?.hasNextPage && (
                <button
                  onClick={() => loadMoreReplies(comment._id)}
                  className="flex items-center justify-center gap-2 w-full mt-2.5 ml-10 md:ml-12 px-3 py-2 bg-gray-100 rounded-lg text-blue-600 text-sm font-semibold hover:bg-gray-200 transition-colors"
                  disabled={repliesLoading}
                >
                  {repliesLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Đang tải...
                    </>
                  ) : (
                    `Xem thêm phản hồi (${
                      repliesPagination.totalReplies - replies.length
                    })`
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto p-5 bg-white">
      <div className="border-b border-gray-200 pb-5 mb-7">
        <div className="flex justify-between items-center mb-5 flex-wrap gap-3">
          <h3 className="text-lg font-semibold text-gray-900 m-0">
            Bình luận ({totalCommentsCount || 0})
          </h3>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <ArrowDownWideNarrow className="w-4 h-4" />
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-md bg-gray-100 text-sm text-gray-900 cursor-pointer outline-none focus:border-blue-600 transition-colors"
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="mostLiked">Nhiều like nhất</option>
            </select>
          </div>
        </div>

        {currentUser ? (
          <div className="flex gap-3 new-comment-form">
            <img
              src={currentUser?.avatar || "https://via.placeholder.com/40"}
              alt="Avatar"
              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1">
              <div className="relative">
                <textarea
                  ref={mainTextareaRef}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Viết bình luận của bạn..."
                  className="w-full min-h-20 px-3 py-3 pr-11 border-2 border-gray-200 rounded-xl resize-vertical text-sm leading-tight outline-none focus:border-blue-600 focus:shadow-[0_0_0_3px_rgba(24,119,242,0.1)] transition-all"
                  rows="3"
                  onFocus={handleMainTextareaInteraction}
                  onClick={handleMainTextareaInteraction}
                />
                <button
                  onClick={handleSubmitComment}
                  className="absolute right-3 bottom-3 text-blue-600 hover:text-blue-700 hover:bg-gray-100 p-1 rounded transition-colors disabled:text-gray-400 disabled:cursor-not-allowed"
                  disabled={!newComment.trim() || submitting}
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
              <div className="flex justify-between items-center mt-2">
                <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="w-4 h-4 cursor-pointer"
                  />
                  {isAnonymous ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                  Bình luận ẩn danh
                </label>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-5 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-600 m-0">
              Vui lòng đăng nhập để bình luận
            </p>
          </div>
        )}
      </div>

      <div className="mt-5">
        {loading && comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2.5 py-5 text-gray-600 text-sm">
            <Loader2 className="w-6 h-6 animate-spin" />
            <p className="m-0">Đang tải bình luận...</p>
          </div>
        ) : comments.length > 0 ? (
          <>
            {comments.map((comment) => (
              <CommentItem key={comment._id} comment={comment} />
            ))}

            {pagination?.hasNextPage && (
              <button
                onClick={loadMoreComments}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 mt-4 bg-gray-100 rounded-lg text-blue-600 text-sm font-semibold hover:bg-gray-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang tải...
                  </>
                ) : (
                  `Xem thêm bình luận (${
                    pagination.totalComments - comments.length
                  })`
                )}
              </button>
            )}
          </>
        ) : (
          <div className="text-center py-10 text-gray-600">
            <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-base m-0">
              Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Commnent;
