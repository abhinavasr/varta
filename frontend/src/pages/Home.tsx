import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Button, 
  Fab, 
  Divider,
  Paper,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PostCard from '../components/PostCard';
import { useToken } from '../contexts/TokenContext';

const Home: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const { balance, claimDailyReward } = useToken();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [showDailyReward, setShowDailyReward] = useState(false);
  const [claimingReward, setClaimingReward] = useState(false);
  const [rewardClaimed, setRewardClaimed] = useState(false);

  useEffect(() => {
    fetchPosts();
    checkDailyReward();
  }, []);

  const checkDailyReward = async () => {
    try {
      const res = await axios.get('/api/tokens/daily-reward/check');
      setShowDailyReward(!res.data.claimed);
    } catch (error) {
      console.error('Error checking daily reward:', error);
      setShowDailyReward(true); // Show anyway if we can't check
    }
  };

  const fetchPosts = async (pageToFetch = 1) => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/posts?page=${pageToFetch}&limit=10`);
      
      if (pageToFetch === 1) {
        setPosts(res.data.posts);
      } else {
        setPosts(prev => [...prev, ...res.data.posts]);
      }
      
      setHasMore(res.data.pagination.currentPage < res.data.pagination.totalPages);
      setPage(pageToFetch);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch posts');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    fetchPosts(page + 1);
  };

  const handleLike = (postId: string) => {
    // Update UI optimistically, backend call is handled in PostCard
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              likes: [...(post.likes || []), { user_id: 'temp-id' }] 
            } 
          : post
      )
    );
  };

  const handleUnlike = (postId: string) => {
    // Update UI optimistically, backend call is handled in PostCard
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              likes: (post.likes || []).filter((like: {user_id: string}) => like.user_id !== 'temp-id')
            } 
          : post
      )
    );
  };

  const handleClaimDailyReward = async () => {
    try {
      setClaimingReward(true);
      await claimDailyReward();
      setRewardClaimed(true);
      setShowDailyReward(false);
      setTimeout(() => setRewardClaimed(false), 3000);
    } catch (error) {
      console.error('Error claiming daily reward:', error);
    } finally {
      setClaimingReward(false);
    }
  };

  return (
    <Box>
      {showDailyReward && (
        <Paper 
          elevation={3} 
          sx={{ 
            p: 2, 
            mb: 3, 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: 'center', 
            justifyContent: 'space-between',
            borderRadius: 2,
            bgcolor: 'primary.light',
            color: 'primary.contrastText'
          }}
        >
          <Typography variant="body1" sx={{ mb: isMobile ? 2 : 0 }}>
            Welcome back! Claim your daily reward of 0.5 tokens.
          </Typography>
          <Button 
            variant="contained" 
            color="secondary" 
            onClick={handleClaimDailyReward}
            disabled={claimingReward}
          >
            {claimingReward ? <CircularProgress size={24} /> : 'Claim Reward'}
          </Button>
        </Paper>
      )}

      {rewardClaimed && (
        <Paper 
          elevation={3} 
          sx={{ 
            p: 2, 
            mb: 3, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            borderRadius: 2,
            bgcolor: 'success.light',
            color: 'success.contrastText'
          }}
        >
          <Typography variant="body1">
            You've successfully claimed 0.5 tokens! Your new balance: {balance} tokens
          </Typography>
        </Paper>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">
          Feed
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => navigate('/create-post')}
        >
          Create Post
        </Button>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {loading && page === 1 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" sx={{ textAlign: 'center', my: 4 }}>
          {error}
        </Typography>
      ) : posts.length === 0 ? (
        <Typography sx={{ textAlign: 'center', my: 4 }}>
          No posts yet. Be the first to create a post!
        </Typography>
      ) : (
        <>
          {posts.map(post => (
            <PostCard 
              key={post.id} 
              post={post} 
              onLike={handleLike}
              onUnlike={handleUnlike}
              refreshPosts={() => fetchPosts(1)}
            />
          ))}
          
          {hasMore && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 4 }}>
              <Button 
                variant="outlined" 
                onClick={handleLoadMore}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Load More'}
              </Button>
            </Box>
          )}
        </>
      )}

      <Fab 
        color="primary" 
        aria-label="add"
        sx={{ 
          position: 'fixed', 
          bottom: 16, 
          right: 16,
          display: { xs: 'flex', md: 'none' }
        }}
        onClick={() => navigate('/create-post')}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default Home;
