# Ethereum Integration Documentation for Varta Platform

## Overview

This document outlines the integration points where the current database-based token system can be replaced with an Ethereum-based implementation in the future. The Varta platform currently uses a database to track token balances and transactions, but is designed with future blockchain integration in mind.

## Integration Points

### 1. Token Balance Management

**Current Implementation:**
- Token balances are stored in the `token_balances` table in PostgreSQL
- Balance updates are performed through SQL transactions

**Ethereum Integration:**
- Replace `TokenBalance` model with an Ethereum wallet address field in the `User` model
- Token balances would be queried directly from the Ethereum blockchain using web3.js or ethers.js
- Update the `getTokenBalance` controller method in `tokenController.js` to fetch balances from Ethereum

```javascript
// Example integration in tokenController.js
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.ETHEREUM_PROVIDER));
const tokenContract = new web3.eth.Contract(TOKEN_ABI, TOKEN_CONTRACT_ADDRESS);

exports.getTokenBalance = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);
    
    if (!user || !user.ethereum_address) {
      return res.status(404).json({ message: 'Ethereum wallet not found' });
    }
    
    const balance = await tokenContract.methods.balanceOf(user.ethereum_address).call();
    const formattedBalance = web3.utils.fromWei(balance, 'ether');
    
    res.status(200).json({
      balance: formattedBalance,
      wallet_address: user.ethereum_address
    });
  } catch (error) {
    console.error('Get token balance error:', error);
    res.status(500).json({ message: 'Error fetching token balance', error: error.message });
  }
};
```

### 2. Token Transactions

**Current Implementation:**
- Token transactions are recorded in the `token_transactions` table
- Transactions are executed through database operations

**Ethereum Integration:**
- Replace database transactions with Ethereum smart contract calls
- Implement a smart contract for the Varta token (ERC-20 standard)
- Update transaction-related methods in controllers to interact with the smart contract

```javascript
// Example smart contract function call in likeController.js
exports.likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;
    
    // Get post and user data
    const post = await Post.findByPk(postId, {
      include: [{ model: User, as: 'author' }]
    });
    const user = await User.findByPk(userId);
    
    if (!post || !user || !user.ethereum_address || !post.author.ethereum_address) {
      return res.status(404).json({ message: 'Post or user not found' });
    }
    
    // Create transaction parameters
    const likeAmount = web3.utils.toWei('0.1', 'ether');
    const data = tokenContract.methods.transferFrom(
      user.ethereum_address,
      post.author.ethereum_address,
      likeAmount
    ).encodeABI();
    
    // Send transaction to frontend for signing
    res.status(200).json({
      transaction: {
        to: TOKEN_CONTRACT_ADDRESS,
        from: user.ethereum_address,
        data: data,
        value: '0x0',
        gasLimit: web3.utils.toHex(100000)
      },
      post_id: postId
    });
    
    // Note: The actual transaction would be signed by the user's wallet
    // and the backend would listen for the transaction event
    
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ message: 'Error liking post', error: error.message });
  }
};
```

### 3. User Registration and Wallet Integration

**Current Implementation:**
- Users are registered with email/password and a token balance is created
- No wallet integration currently exists

**Ethereum Integration:**
- Add Ethereum wallet address field to the `User` model
- Implement wallet connect functionality in the frontend
- Update registration and login flows to associate wallets with user accounts

```javascript
// Example schema update for User model
const User = sequelize.define('User', {
  // ... existing fields
  ethereum_address: {
    type: DataTypes.STRING(42), // Ethereum address length
    allowNull: true,
    validate: {
      isEthereumAddress(value) {
        if (value && !web3.utils.isAddress(value)) {
          throw new Error('Invalid Ethereum address');
        }
      }
    }
  }
});

// Example registration update in authController.js
exports.connectWallet = async (req, res) => {
  try {
    const userId = req.user.id;
    const { ethereum_address, signature } = req.body;
    
    // Verify signature to ensure user owns the wallet
    const isValid = await verifySignature(ethereum_address, signature);
    
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid signature' });
    }
    
    // Update user with Ethereum address
    await User.update(
      { ethereum_address },
      { where: { id: userId } }
    );
    
    res.status(200).json({
      message: 'Wallet connected successfully',
      ethereum_address
    });
  } catch (error) {
    console.error('Connect wallet error:', error);
    res.status(500).json({ message: 'Error connecting wallet', error: error.message });
  }
};
```

### 4. Smart Contract for Token Economy

**Current Implementation:**
- Token economy rules are enforced by backend code
- Token costs and rewards are hardcoded in controllers

**Ethereum Integration:**
- Implement a smart contract to enforce token economy rules
- Define token costs and rewards in the smart contract
- Create functions for post creation, liking, resharing, etc.

```solidity
// Example Solidity smart contract (VartaToken.sol)
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract VartaToken is ERC20, Ownable {
    // Token costs
    uint256 public postCreationCost = 1 * 10**18; // 1 token
    uint256 public likeCost = 0.1 * 10**18; // 0.1 token
    uint256 public resharePostCost = 1 * 10**18; // 1 token
    
    // Event definitions
    event PostCreated(address indexed creator, bytes32 postId);
    event PostLiked(address indexed liker, address indexed creator, bytes32 postId);
    event PostReshared(address indexed resharer, address indexed creator, bytes32 postId);
    
    constructor() ERC20("Varta", "VRTA") {
        // Initial supply or minting logic
    }
    
    // Function to create a post
    function createPost(bytes32 postId) external {
        require(balanceOf(msg.sender) >= postCreationCost, "Insufficient tokens");
        _burn(msg.sender, postCreationCost);
        emit PostCreated(msg.sender, postId);
    }
    
    // Function to like a post
    function likePost(address creator, bytes32 postId) external {
        require(balanceOf(msg.sender) >= likeCost, "Insufficient tokens");
        _transfer(msg.sender, creator, likeCost);
        emit PostLiked(msg.sender, creator, postId);
    }
    
    // Function to reshare a post
    function resharePost(address creator, bytes32 postId) external {
        require(balanceOf(msg.sender) >= resharePostCost, "Insufficient tokens");
        _transfer(msg.sender, creator, resharePostCost);
        emit PostReshared(msg.sender, creator, postId);
    }
    
    // Function to claim daily rewards (could be restricted by time)
    function claimDailyReward() external {
        // Logic to verify eligibility
        _mint(msg.sender, 0.5 * 10**18); // 0.5 token daily reward
    }
    
    // Admin functions to update costs
    function updatePostCreationCost(uint256 newCost) external onlyOwner {
        postCreationCost = newCost;
    }
    
    function updateLikeCost(uint256 newCost) external onlyOwner {
        likeCost = newCost;
    }
    
    function updateResharePostCost(uint256 newCost) external onlyOwner {
        resharePostCost = newCost;
    }
}
```

### 5. Transaction History and Analytics

**Current Implementation:**
- Transaction history is stored in the database
- Analytics are calculated using SQL queries

**Ethereum Integration:**
- Query transaction history from the blockchain using event logs
- Implement analytics based on blockchain data
- Create a service to index and cache blockchain events for performance

```javascript
// Example transaction history retrieval in tokenController.js
exports.getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);
    
    if (!user || !user.ethereum_address) {
      return res.status(404).json({ message: 'Ethereum wallet not found' });
    }
    
    // Get events from blockchain
    const fromEvents = await tokenContract.getPastEvents('Transfer', {
      filter: { from: user.ethereum_address },
      fromBlock: 0,
      toBlock: 'latest'
    });
    
    const toEvents = await tokenContract.getPastEvents('Transfer', {
      filter: { to: user.ethereum_address },
      fromBlock: 0,
      toBlock: 'latest'
    });
    
    // Format events into transactions
    const transactions = [...fromEvents, ...toEvents].map(event => {
      const isIncoming = event.returnValues.to === user.ethereum_address;
      return {
        transaction_hash: event.transactionHash,
        block_number: event.blockNumber,
        from: event.returnValues.from,
        to: event.returnValues.to,
        amount: web3.utils.fromWei(event.returnValues.value, 'ether'),
        type: isIncoming ? 'incoming' : 'outgoing',
        timestamp: null // Would need to get block timestamp
      };
    });
    
    // Sort by block number (descending)
    transactions.sort((a, b) => b.block_number - a.block_number);
    
    res.status(200).json({ transactions });
  } catch (error) {
    console.error('Get transaction history error:', error);
    res.status(500).json({ message: 'Error fetching transaction history', error: error.message });
  }
};
```

## Frontend Integration

### 1. Wallet Connection

The frontend will need to integrate with Ethereum wallets like MetaMask, WalletConnect, or other web3 providers.

```javascript
// Example React component for connecting wallet
import { useEffect, useState } from 'react';
import Web3 from 'web3';

const WalletConnect = () => {
  const [account, setAccount] = useState(null);
  const [web3, setWeb3] = useState(null);
  
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const web3Instance = new Web3(window.ethereum);
        
        setAccount(accounts[0]);
        setWeb3(web3Instance);
        
        // Send to backend to associate with user
        await fetch('/api/auth/connect-wallet', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ ethereum_address: accounts[0] })
        });
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    } else {
      alert('Please install MetaMask or another Ethereum wallet');
    }
  };
  
  return (
    <div>
      {account ? (
        <div>Connected: {account}</div>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
    </div>
  );
};
```

### 2. Transaction Signing

For operations that cost tokens, the frontend will need to prompt users to sign transactions.

```javascript
// Example function to like a post with Ethereum
const likePost = async (postId) => {
  try {
    // Get transaction data from backend
    const response = await fetch(`/api/likes/posts/${postId}/prepare`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    const { transaction } = await response.json();
    
    // Send transaction to wallet for signing
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [transaction]
    });
    
    // Notify backend of successful transaction
    await fetch(`/api/likes/posts/${postId}/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ transaction_hash: txHash })
    });
    
    return txHash;
  } catch (error) {
    console.error('Error liking post:', error);
    throw error;
  }
};
```

## Deployment Considerations

### 1. Smart Contract Deployment

- Deploy smart contracts to Ethereum mainnet or a layer 2 solution like Polygon for lower fees
- Consider using a testnet for initial testing (Goerli, Sepolia)
- Use Hardhat or Truffle for deployment and testing

### 2. Infrastructure Updates

- Implement an Ethereum node or use a service like Infura or Alchemy
- Set up event listeners to monitor blockchain events
- Create a caching layer to improve performance when querying blockchain data

### 3. Security Considerations

- Implement proper signature verification for wallet connections
- Use secure methods for handling private keys (never store on server)
- Conduct thorough smart contract audits before deployment
- Implement rate limiting to prevent abuse

## Conclusion

This document outlines the key integration points for transitioning from the current database-based token system to an Ethereum-based implementation. The current architecture has been designed with this future migration in mind, with clear separation of concerns and modular components that can be replaced with blockchain equivalents.

When implementing the Ethereum integration, it's recommended to:

1. Start with wallet connection functionality
2. Deploy and test smart contracts on testnets
3. Gradually replace database token operations with blockchain calls
4. Implement proper error handling for blockchain interactions
5. Add comprehensive transaction status tracking

By following this approach, the Varta platform can be smoothly transitioned to a fully decentralized token economy based on Ethereum.
