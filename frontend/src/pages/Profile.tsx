import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Avatar,
  Paper,
  Tabs,
  Tab,
  Divider,
  CircularProgress,
  Button,
  Chip,
  Grid,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  Person as PersonIcon, 
  Token as TokenIcon, 
  Edit as EditIcon 
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import PostCard from '../components/PostCard';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const Profile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [tokenHistory, setTokenHistory] = useState<any[]>([]);
  const [loadingTokens, setLoadingTokens] = useState(false);

  const isOwnProfile = user?.id === userId;

  useEffect(() => {
    fetchProfile();
    fetchUserPosts();
    if (isOwnProfile) {
      fetchTokenBalance();
      fetchTokenHistory();
    }
  }, [userId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/auth/profile/${userId}`);
      setProfile(res.data.user);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch profile');
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/posts/user/${userId}`);
      setPosts(res.data.posts);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch posts');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTokenBalance = async () => {
    try {
      setLoadingTokens(true);
      const res = await axios.get('/api/tokens/balance');
      setTokenBalance(res.data.balance);
    } catch (err: any) {
      console.error('Error fetching token balance:', err);
    } finally {
      setLoadingTokens(false);
    }
  };

  const fetchTokenHistory = async () => {
    try {
      setLoadingTokens(true);
      const res = await axios.get('/api/tokens/transactions');
      setTokenHistory(res.data.transactions);
    } catch (err: any) {
      console.error('Error fetching token history:', err);
    } finally {
      setLoadingTokens(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
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

  if (loading && !profile) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" sx={{ textAlign: 'center', my: 4 }}>
        {error}
      </Typography>
    );
  }

  return (
    <Box>
      {/* Profile Header */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={3} alignItems="center">
          <Box sx={{ width: { xs: '100%', sm: '16.66%' }, textAlign: 'center' }}>
            <Avatar
              src={profile?.profile_image_url}
              alt={profile?.username}
              sx={{ 
                width: isMobile ? 80 : 100, 
                height: isMobile ? 80 : 100,
                mx: 'auto'
              }}
            >
              {profile?.username?.charAt(0).toUpperCase()}
            </Avatar>
          </Box>
          <Box sx={{ width: { xs: '100%', sm: '83.33%' } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
              <Typography variant="h5" component="h1">
                {profile?.username}
              </Typography>
              {isOwnProfile && (
                <Button 
                  variant="outlined" 
                  size="small" 
                  startIcon={<EditIcon />}
                >
                  Edit Profile
                </Button>
              )}
            </Box>
            
            <Typography variant="body1" gutterBottom>
              {profile?.profile?.bio || 'No bio available'}
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
              {isOwnProfile && tokenBalance !== null && (
                <Chip 
                  icon={<TokenIcon />} 
                  label={`${tokenBalance} tokens`} 
                  color="primary" 
                  variant="outlined" 
                />
              )}
              <Chip 
                icon={<PersonIcon />} 
                label={`${posts.length} posts`} 
                variant="outlined" 
              />
            </Box>
          </Box>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Paper elevation={0} sx={{ borderRadius: 2 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="profile tabs"
          variant={isMobile ? "fullWidth" : "standard"}
          centered={!isMobile}
        >
          <Tab label="Posts" />
          {isOwnProfile && <Tab label="Token History" />}
        </Tabs>
        
        <Divider />
        
        <TabPanel value={tabValue} index={0}>
          {posts.length === 0 ? (
            <Typography sx={{ textAlign: 'center', my: 4 }}>
              No posts yet.
            </Typography>
          ) : (
            posts.map(post => (
              <PostCard 
                key={post.id} 
                post={post} 
                onLike={handleLike}
                onUnlike={handleUnlike}
                refreshPosts={fetchUserPosts}
              />
            ))
          )}
        </TabPanel>
        
        {isOwnProfile && (
          <TabPanel value={tabValue} index={1}>
            {loadingTokens ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : tokenHistory.length === 0 ? (
              <Typography sx={{ textAlign: 'center', my: 4 }}>
                No token transactions yet.
              </Typography>
            ) : (
              <Box>
                {tokenHistory.map((transaction, index) => (
                  <Paper 
                    key={index} 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      mb: 2, 
                      border: 1, 
                      borderColor: 'divider',
                      borderRadius: 2
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle1">
                        {transaction.transaction_type.replace('_', ' ')}
                      </Typography>
                      <Typography 
                        variant="subtitle1" 
                        color={transaction.amount > 0 ? 'success.main' : 'error.main'}
                      >
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount} tokens
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(transaction.created_at).toLocaleString()}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            )}
          </TabPanel>
        )}
      </Paper>
    </Box>
  );
};

export default Profile;
