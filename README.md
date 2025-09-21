🛂 Reputation Passport - Decentralized Gig Worker Reputation System

A blockchain-based reputation system that allows gig workers to own, manage, and transfer their reputation across multiple platforms. Built for hackathon in 1 day using Solidity, Hardhat, and vanilla JavaScript.


🎯 Problem Statement
Gig workers lose their reputation when switching between platforms like Uber, DoorDash, TaskRabbit, and Fiverr. A 5-star Uber driver becomes a "new user" on Lyft. Our solution creates portable, worker-owned reputation that works across all platforms.

✨ Key Features
- **Wallet-based Authentication**: Connect with MetaMask
- **Worker Registration**: One-time blockchain registration
- **Cross-platform Job History**: Add jobs from any gig platform
- **Universal Reputation Score**: Aggregated rating across all platforms
- **Immutable Records**: Tamper-proof reputation data
- **Profile Exploration**: Search other workers' reputations

🏗️ Tech Stack
- **Smart Contract**: Solidity 0.8.19
- **Development**: Hardhat, Ganache
- **Frontend**: Vanilla JavaScript, HTML, CSS (TailwindCSS-inspired)
- **Blockchain Interaction**: Ethers.js
- **Wallet**: MetaMask integration


## 🛠️ Setup Instructions

### Prerequisites
- Node.js (≥16.0.0)
- npm (≥7.0.0)
- MetaMask browser extension
- Ganache (for local blockchain)

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Project Structure
```bash
npm run setup
```

### 3. Start Local Blockchain

#### Option A: Using Ganache 
1. Download and install [Ganache](https://trufflesuite.com/ganache/)
2. Start Ganache on `http://127.0.0.1:7545`
3. Note down the private keys for testing

#### Option B: Using Hardhat Node
```bash
npm run node
```

### 4. Update Configuration
Edit `hardhat.config.js` and add your Ganache private keys:
```javascript
accounts: [
  "YOUR_GANACHE_PRIVATE_KEY_1",
  "YOUR_GANACHE_PRIVATE_KEY_2",
  // ... more keys
]
```

### 5. Compile Smart Contract
```bash
npm run compile
```

### 6. Run Tests
```bash
npm test
```

### 7. Deploy Contract
```bash
# Deploy to Ganache
npm run deploy:ganache

# Deploy to Hardhat local node
npm run deploy:localhost
```

### 8. Update Frontend
After deployment, update the contract address in `frontend/app.js`:
```javascript
const contractAddress = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
```

### 9. Run Frontend
```bash
npm run frontend
```
Visit `http://localhost:3000`

## 🎮 Demo Flow

### 1. **Connect Wallet**
- Click "Connect Wallet" button
- Approve MetaMask connection
- Ensure you're on the correct network (Ganache/Localhost)

### 2. **Register as Worker**
- Go to Register page
- Click "Register as Worker"
- Confirm transaction in MetaMask
- Wait for blockchain confirmation

### 3. **Add Job History**
- Navigate to "Add Job" page
- Fill in platform details (Uber, DoorDash, etc.)
- Select rating (1-5 stars)
- Choose job type
- Submit transaction

### 4. **View Dashboard**
- Check your universal reputation score
- View complete job history across platforms
- See real-time score updates

### 5. **Explore Other Workers**
- Use "Explore" page
- Enter another wallet address
- View their reputation and job history
- Demonstrate portability



**Built with ❤️ for the Web3 hackathon by Future Crafters**
