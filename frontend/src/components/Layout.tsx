import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper,
  useTheme,
  useMediaQuery,
  Fade
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Add as AddIcon,
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  Logout as LogoutIcon,
  Token as TokenIcon,
  Chat as ChatIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useToken } from '../contexts/TokenContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { balance } = useToken();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    handleCloseUserMenu();
    logout();
    navigate('/login');
  };

  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' ||
        (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }

    setDrawerOpen(open);
  };

  const drawerContent = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        <ListItem component={RouterLink} to="/">
          <ListItemIcon>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary="Home" />
        </ListItem>
        <ListItem component={RouterLink} to="/create-post">
          <ListItemIcon>
            <AddIcon />
          </ListItemIcon>
          <ListItemText primary="Create Post" />
        </ListItem>
        <ListItem component={RouterLink} to={`/profile/${user?.id}`}>
          <ListItemIcon>
            <PersonIcon />
          </ListItemIcon>
          <ListItemText primary="Profile" />
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem>
          <ListItemIcon>
            <TokenIcon />
          </ListItemIcon>
          <ListItemText primary={`Tokens: ${balance}`} />
        </ListItem>
        <ListItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="fixed" color="primary" elevation={3}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {isMobile ? (
              <>
                <IconButton
                  size="large"
                  edge="start"
                  color="inherit"
                  aria-label="menu"
                  onClick={toggleDrawer(true)}
                  sx={{ mr: 2 }}
                >
                  <MenuIcon />
                </IconButton>
                <Typography
                  variant="h5"
                  noWrap
                  component={RouterLink}
                  to="/"
                  sx={{
                    mr: 2,
                    flexGrow: 1,
                    fontWeight: 700,
                    letterSpacing: '.2rem',
                    color: 'inherit',
                    textDecoration: 'none',
                  }}
                >
                  VARTA
                </Typography>
              </>
            ) : (
              <>
                <Typography
                  variant="h5"
                  noWrap
                  component={RouterLink}
                  to="/"
                  sx={{
                    mr: 4,
                    display: { xs: 'none', md: 'flex' },
                    fontWeight: 700,
                    letterSpacing: '.2rem',
                    color: 'inherit',
                    textDecoration: 'none',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05)'
                    }
                  }}
                >
                  VARTA
                </Typography>
                <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                  <Button
                    component={RouterLink}
                    to="/"
                    startIcon={<HomeIcon />}
                    sx={{ 
                      my: 2, 
                      color: 'white', 
                      display: 'block',
                      mx: 1,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.15)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    Home
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/create-post"
                    startIcon={<AddIcon />}
                    sx={{ 
                      my: 2, 
                      color: 'white', 
                      display: 'block',
                      mx: 1,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.15)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    Create Post
                  </Button>
                </Box>
              </>
            )}

            <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center' }}>
              {!isMobile && (
                <Paper 
                  elevation={0} 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    px: 2, 
                    py: 0.8, 
                    mr: 2, 
                    bgcolor: 'rgba(255,255,255,0.15)',
                    borderRadius: '20px',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.25)',
                    }
                  }}
                >
                  <TokenIcon sx={{ mr: 1, fontSize: 18 }} />
                  <Typography variant="body2" fontWeight="medium">{balance}</Typography>
                </Paper>
              )}
              
              <Tooltip title="Notifications">
                <IconButton 
                  sx={{ 
                    mx: 1,
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'scale(1.1)' }
                  }} 
                  color="inherit"
                >
                  <Badge badgeContent={0} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Messages">
                <IconButton 
                  sx={{ 
                    mx: 1,
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'scale(1.1)' }
                  }} 
                  color="inherit"
                >
                  <Badge badgeContent={0} color="error">
                    <ChatIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Profile settings">
                <IconButton 
                  onClick={handleOpenUserMenu} 
                  sx={{ 
                    p: 0.5,
                    ml: 1,
                    border: '2px solid rgba(255,255,255,0.5)',
                    transition: 'all 0.2s',
                    '&:hover': { 
                      transform: 'scale(1.1)',
                      border: '2px solid rgba(255,255,255,0.8)'
                    }
                  }}
                >
                  <Avatar 
                    alt={user?.username || 'User'} 
                    src={user?.profile?.profile_image_url || '/static/images/avatar/2.jpg'} 
                    sx={{ width: 32, height: 32 }}
                  />
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
                TransitionComponent={Fade}
              >
                <MenuItem component={RouterLink} to={`/profile/${user?.id}`} onClick={handleCloseUserMenu}>
                  <ListItemIcon>
                    <PersonIcon fontSize="small" />
                  </ListItemIcon>
                  <Typography>Profile</Typography>
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  <Typography>Logout</Typography>
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        PaperProps={{
          sx: {
            borderRadius: '0 16px 16px 0',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }
        }}
      >
        {drawerContent}
      </Drawer>
      
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          pt: { xs: 9, sm: 10 }, 
          px: { xs: 1, sm: 2 }, 
          pb: 4,
          minHeight: '100vh'
        }}
        className="fade-in"
      >
        <Container maxWidth="lg">
          {children}
        </Container>
      </Box>
    </>
  );
};

export default Layout;
