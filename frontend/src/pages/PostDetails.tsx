import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Divider,
  CircularProgress,
  Button,
  TextField,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Alert
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import PostCard from '../components/PostCard';

const PostDetails: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState('');

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [postId]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/posts/${postId}`);
      setPost(res.data.post);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch post');
      console.error('Error fetching post:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await axios.get(`/api/posts/${postId}/comments`);
      setComments(res.data.comments || []);
    } catch (err: any) {
      console.error('Error fetching comments:', err);
    }
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setComment(e.target.value);
    if (commentError) setCommentError('');
  };

  const handleSubmitComment = async () => {
    if (!comment.trim()) {
      setCommentError('Comment cannot be empty');
      return;
    }
    
    try {
      setSubmittingComment(true);
      setCommentError('');
      
      await axios.post(`/api/posts/${postId}/comments`, { content: comment });
      
      setComment('');
      fetchComments();
    } catch (err: any) {
      setCommentError(err.response?.data?.message || 'Failed to post comment');
      console.error('Error posting comment:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleLike = () => {
    if (post) {
      // Update UI optimistically, backend call is handled in PostCard
      setPost({
        ...post,
        likes: [...(post.likes || []), { user_id: 'temp-id' }]
      });
    }
  };

  const handleUnlike = () => {
    if (post) {
      // Update UI optimistically, backend call is handled in PostCard
      setPost({
        ...post,
        likes: (post.likes || []).filter((like: {user_id: string}) => like.user_id !== 'temp-id')
      });
    }
  };

  if (loading && !post) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
        <Button 
          color="inherit" 
          size="small" 
          onClick={() => navigate('/')}
          sx={{ ml: 2 }}
        >
          Go Home
        </Button>
      </Alert>
    );
  }

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
      >
        Back
      </Button>

      {post && (
        <>
          <PostCard 
            post={post} 
            onLike={handleLike}
            onUnlike={handleUnlike}
            refreshPosts={fetchPost}
          />
          
          <Paper elevation={0} sx={{ p: 3, mt: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Comments
            </Typography>
            
            <Divider sx={{ mb: 3 }} />
            
            <Box sx={{ display: 'flex', mb: 3 }}>
              <Avatar 
                src={user?.profile?.profile_image_url} 
                alt={user?.username}
                sx={{ mr: 2 }}
              >
                {user?.username?.charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <TextField
                  fullWidth
                  placeholder="Add a comment..."
                  variant="outlined"
                  size="small"
                  value={comment}
                  onChange={handleCommentChange}
                  error={!!commentError}
                  helperText={commentError}
                  disabled={submittingComment}
                  sx={{ mb: commentError ? 0 : 1 }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    size="small"
                    endIcon={<SendIcon />}
                    onClick={handleSubmitComment}
                    disabled={submittingComment || !comment.trim()}
                  >
                    {submittingComment ? <CircularProgress size={20} /> : 'Comment'}
                  </Button>
                </Box>
              </Box>
            </Box>
            
            {comments.length === 0 ? (
              <Typography sx={{ textAlign: 'center', my: 4, color: 'text.secondary' }}>
                No comments yet. Be the first to comment!
              </Typography>
            ) : (
              <List>
                {comments.map((comment) => (
                  <ListItem key={comment.id} alignItems="flex-start" sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar 
                        src={comment.user.profile_image_url} 
                        alt={comment.user.username}
                      >
                        {comment.user.username.charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2" component="span">
                          {comment.user.username}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography
                            variant="body2"
                            component="span"
                            color="text.primary"
                            sx={{ display: 'block', my: 0.5 }}
                          >
                            {comment.content}
                          </Typography>
                          <Typography
                            variant="caption"
                            component="span"
                            color="text.secondary"
                          >
                            {new Date(comment.created_at).toLocaleString()}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </>
      )}
    </Box>
  );
};

export default PostDetails;
