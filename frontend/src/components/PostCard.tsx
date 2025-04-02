import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Avatar,
  IconButton,
  Typography,
  Box,
  Chip,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tooltip
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Share as ShareIcon,
  ArrowLeft as LeftIcon,
  ArrowRight as RightIcon,
  MoreVert as MoreVertIcon,
  Comment as CommentIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useToken } from '../contexts/TokenContext';
import axios from 'axios';

interface PostCardProps {
  post: {
    id: string;
    content: string;
    created_at: string;
    author: {
      id: string;
      username: string;
      profile_image_url?: string;
    };
    likes?: any[];
    left_rating_count?: number;
    right_rating_count?: number;
    is_reshare?: boolean;
    original_post_id?: string;
    originalPost?: any;
  };
  onLike?: (postId: string) => void;
  onUnlike?: (postId: string) => void;
  onReshare?: (postId: string) => void;
  refreshPosts?: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ 
  post, 
  onLike, 
  onUnlike, 
  onReshare,
  refreshPosts
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { balance } = useToken();
  
  const [liked, setLiked] = useState(post.likes?.some((like: {user_id: string}) => like.user_id === user?.id) || false);
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  const [openReshareDialog, setOpenReshareDialog] = useState(false);
  const [openInsufficientDialog, setOpenInsufficientDialog] = useState(false);
  const [actionType, setActionType] = useState<'like' | 'reshare' | null>(null);
  
  const handleLikeClick = async () => {
    if (liked) {
      try {
        await axios.delete(`/api/likes/posts/${post.id}`);
        setLiked(false);
        setLikeCount(prev => prev - 1);
        if (onUnlike) onUnlike(post.id);
      } catch (error) {
        console.error('Error unliking post:', error);
      }
    } else {
      if (balance < 0.1) {
        setActionType('like');
        setOpenInsufficientDialog(true);
        return;
      }
      
      try {
        await axios.post(`/api/likes/posts/${post.id}`);
        setLiked(true);
        setLikeCount(prev => prev + 1);
        if (onLike) onLike(post.id);
      } catch (error) {
        console.error('Error liking post:', error);
      }
    }
  };
  
  const handleReshareClick = () => {
    if (balance < 1) {
      setActionType('reshare');
      setOpenInsufficientDialog(true);
      return;
    }
    
    setOpenReshareDialog(true);
  };
  
  const handleConfirmReshare = async () => {
    setOpenReshareDialog(false);
    
    try {
      await axios.post(`/api/posts/${post.id}/reshare`);
      if (onReshare) onReshare(post.id);
      if (refreshPosts) refreshPosts();
    } catch (error) {
      console.error('Error resharing post:', error);
    }
  };
  
  const handlePostClick = () => {
    navigate(`/post/${post.id}`);
  };
  
  const handleAuthorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/profile/${post.author.id}`);
  };

  return (
    <>
      <Card 
        sx={{ 
          mb: 2, 
          cursor: 'pointer',
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: 3
          }
        }}
        onClick={handlePostClick}
      >
        <CardHeader
          avatar={
            <Avatar 
              src={post.author.profile_image_url} 
              alt={post.author.username}
              onClick={handleAuthorClick}
              sx={{ cursor: 'pointer' }}
            >
              {post.author.username.charAt(0).toUpperCase()}
            </Avatar>
          }
          action={
            <IconButton aria-label="settings">
              <MoreVertIcon />
            </IconButton>
          }
          title={
            <Typography 
              variant="subtitle1" 
              component="span" 
              onClick={handleAuthorClick}
              sx={{ 
                fontWeight: 600, 
                cursor: 'pointer',
                '&:hover': { textDecoration: 'underline' } 
              }}
            >
              {post.author.username}
            </Typography>
          }
          subheader={new Date(post.created_at).toLocaleString()}
        />
        
        {post.is_reshare && post.originalPost && (
          <Box sx={{ mx: 2, my: 1, p: 1, bgcolor: 'background.default', borderRadius: 1, border: '1px solid #eee' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Reshared from <b>{post.originalPost.author.username}</b>
            </Typography>
            <Typography variant="body2">
              {post.originalPost.content}
            </Typography>
          </Box>
        )}
        
        <CardContent onClick={e => e.stopPropagation()}>
          <Typography variant="body1" component="div">
            {post.content}
          </Typography>
          
          {(post.left_rating_count || post.right_rating_count) && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
              <Chip
                icon={<LeftIcon />}
                label={post.left_rating_count || 0}
                variant="outlined"
                size="small"
                sx={{ mr: 1 }}
              />
              <Chip
                icon={<RightIcon />}
                label={post.right_rating_count || 0}
                variant="outlined"
                size="small"
              />
            </Box>
          )}
        </CardContent>
        
        <Divider />
        
        <CardActions disableSpacing onClick={e => e.stopPropagation()}>
          <Tooltip title={liked ? "Unlike" : "Like (costs 0.1 token)"}>
            <IconButton 
              aria-label="like" 
              onClick={handleLikeClick}
              color={liked ? "secondary" : "default"}
            >
              {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </IconButton>
          </Tooltip>
          <Typography variant="body2" color="text.secondary">
            {likeCount}
          </Typography>
          
          <Tooltip title="Comment">
            <IconButton aria-label="comment" sx={{ ml: 1 }}>
              <CommentIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Reshare (costs 1 token)">
            <IconButton 
              aria-label="reshare" 
              onClick={handleReshareClick}
              sx={{ ml: 1 }}
            >
              <ShareIcon />
            </IconButton>
          </Tooltip>
        </CardActions>
      </Card>
      
      {/* Reshare Confirmation Dialog */}
      <Dialog
        open={openReshareDialog}
        onClose={() => setOpenReshareDialog(false)}
      >
        <DialogTitle>Reshare Post</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Resharing this post will cost 1 token, which will be transferred to the original author.
            Do you want to continue?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReshareDialog(false)}>Cancel</Button>
          <Button onClick={handleConfirmReshare} variant="contained">Reshare</Button>
        </DialogActions>
      </Dialog>
      
      {/* Insufficient Tokens Dialog */}
      <Dialog
        open={openInsufficientDialog}
        onClose={() => setOpenInsufficientDialog(false)}
      >
        <DialogTitle>Insufficient Tokens</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {actionType === 'like' 
              ? 'You need at least 0.1 tokens to like a post.' 
              : 'You need at least 1 token to reshare a post.'}
            Would you like to claim your daily reward or purchase tokens?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenInsufficientDialog(false)}>Cancel</Button>
          <Button 
            onClick={() => {
              setOpenInsufficientDialog(false);
              navigate('/tokens');
            }} 
            variant="contained"
          >
            Get Tokens
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PostCard;
