import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider,
  IconButton,
  Chip
} from '@mui/material';
import { PhotoCamera, Close as CloseIcon } from '@mui/icons-material';
import { useToken } from '../contexts/TokenContext';
import axios from 'axios';

const CreatePost: React.FC = () => {
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<File[]>([]);
  const [mediaPreview, setMediaPreview] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [insufficientTokens, setInsufficientTokens] = useState(false);
  
  const { balance, getBalance } = useToken();
  const navigate = useNavigate();

  const handleContentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContent(e.target.value);
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setMedia(prev => [...prev, ...newFiles]);
      
      // Create previews for the files
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setMediaPreview(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveMedia = (index: number) => {
    setMedia(prev => prev.filter((_, i) => i !== index));
    setMediaPreview(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Post content cannot be empty');
      return;
    }
    
    if (balance < 1) {
      setInsufficientTokens(true);
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // First, upload any media files
      let mediaUrls: { type: string; url: string; thumbnail_url?: string }[] = [];
      
      if (media.length > 0) {
        const mediaPromises = media.map(async (file) => {
          const formData = new FormData();
          formData.append('file', file);
          
          const res = await axios.post('/api/media/upload', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          
          return {
            type: file.type.startsWith('image/') ? 'image' : 'video',
            url: res.data.url,
            thumbnail_url: res.data.thumbnail_url || undefined
          };
        });
        
        mediaUrls = await Promise.all(mediaPromises);
      }
      
      // Create the post
      await axios.post('/api/posts', {
        content,
        media: mediaUrls
      });
      
      // Refresh token balance
      await getBalance();
      
      // Redirect to home page
      navigate('/');
    } catch (err: any) {
      if (err.response?.status === 400 && err.response?.data?.message?.includes('token')) {
        setInsufficientTokens(true);
      } else {
        setError(err.response?.data?.message || 'Failed to create post');
      }
      console.error('Error creating post:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimReward = async () => {
    try {
      setLoading(true);
      await axios.post('/api/tokens/daily-reward');
      await getBalance();
      setInsufficientTokens(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to claim daily reward');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Create Post
        </Typography>
        
        <Divider sx={{ mb: 3 }} />
        
        {insufficientTokens ? (
          <Alert 
            severity="warning" 
            sx={{ mb: 3 }}
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={handleClaimReward}
                disabled={loading}
              >
                {loading ? <CircularProgress size={20} /> : 'Claim Daily Reward'}
              </Button>
            }
          >
            You need at least 1 token to create a post. Your current balance: {balance} tokens.
          </Alert>
        ) : (
          <Chip 
            label={`Token Cost: 1 • Your Balance: ${balance}`} 
            color={balance >= 1 ? "primary" : "error"}
            sx={{ mb: 3 }}
          />
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            multiline
            rows={6}
            placeholder="What's on your mind?"
            variant="outlined"
            value={content}
            onChange={handleContentChange}
            disabled={loading}
            sx={{ mb: 3 }}
          />
          
          {mediaPreview.length > 0 && (
            <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {mediaPreview.map((preview, index) => (
                <Card key={index} sx={{ position: 'relative', width: 100, height: 100 }}>
                  <CardContent sx={{ p: 0, height: '100%' }}>
                    <img 
                      src={preview} 
                      alt={`Preview ${index}`} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                    <IconButton
                      size="small"
                      sx={{ position: 'absolute', top: 0, right: 0, bgcolor: 'rgba(0,0,0,0.5)' }}
                      onClick={() => handleRemoveMedia(index)}
                    >
                      <CloseIcon fontSize="small" sx={{ color: 'white' }} />
                    </IconButton>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              component="label"
              startIcon={<PhotoCamera />}
              disabled={loading}
            >
              Add Media
              <input
                type="file"
                accept="image/*,video/*"
                hidden
                onChange={handleMediaChange}
                multiple
              />
            </Button>
            
            <Box>
              <Button 
                variant="outlined" 
                sx={{ mr: 2 }}
                onClick={() => navigate('/')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained"
                disabled={loading || !content.trim() || balance < 1}
              >
                {loading ? <CircularProgress size={24} /> : 'Post'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default CreatePost;
