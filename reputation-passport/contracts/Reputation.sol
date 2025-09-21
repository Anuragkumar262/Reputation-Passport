// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Reputation {
    struct Job {
        string platformName;
        uint8 rating; // 1-5 stars
        uint256 timestamp;
        string jobType;
        bool exists;
    }
    
    struct Worker {
        bool isRegistered;
        uint256 totalScore;
        uint256 jobCount;
        mapping(uint256 => Job) jobs;
        mapping(string => bool) platformJobExists; // Prevent duplicate platform entries
    }
    
    mapping(address => Worker) public workers;
    address[] public workerAddresses;
    
    event WorkerRegistered(address indexed worker);
    event ScoreUpdated(address indexed worker, uint256 newScore, uint256 jobCount);
    event JobAdded(address indexed worker, string platform, uint8 rating, string jobType);
    
    modifier onlyRegistered(address worker) {
        require(workers[worker].isRegistered, "Worker not registered");
        _;
    }
    
    modifier validRating(uint8 rating) {
        require(rating >= 1 && rating <= 5, "Rating must be between 1 and 5");
        _;
    }
    
    // Register a new worker
    function registerWorker() external {
        require(!workers[msg.sender].isRegistered, "Worker already registered");
        
        workers[msg.sender].isRegistered = true;
        workers[msg.sender].totalScore = 0;
        workers[msg.sender].jobCount = 0;
        
        workerAddresses.push(msg.sender);
        
        emit WorkerRegistered(msg.sender);
    }
    
    // Add a new job/review for a worker
    function addJob(
        string memory platformName,
        uint8 rating,
        string memory jobType
    ) external onlyRegistered(msg.sender) validRating(rating) {
        require(bytes(platformName).length > 0, "Platform name cannot be empty");
        require(bytes(jobType).length > 0, "Job type cannot be empty");
        
        Worker storage worker = workers[msg.sender];
        uint256 jobIndex = worker.jobCount;
        
        // Create platform key for this job (platform + timestamp to allow multiple jobs per platform)
        string memory platformKey = string(abi.encodePacked(platformName, "_", toString(block.timestamp)));
        require(!worker.platformJobExists[platformKey], "Job already exists for this platform and time");
        
        // Add job
        worker.jobs[jobIndex] = Job({
            platformName: platformName,
            rating: rating,
            timestamp: block.timestamp,
            jobType: jobType,
            exists: true
        });
        
        worker.platformJobExists[platformKey] = true;
        worker.totalScore += rating;
        worker.jobCount++;
        
        emit JobAdded(msg.sender, platformName, rating, jobType);
        emit ScoreUpdated(msg.sender, worker.totalScore, worker.jobCount);
    }
    
    // Get worker's overall reputation score (average rating)
    function getScore(address worker) external view returns (uint256 averageScore, uint256 jobCount) {
        require(workers[worker].isRegistered, "Worker not registered");
        
        Worker storage w = workers[worker];
        if (w.jobCount == 0) {
            return (0, 0);
        }
        
        uint256 average = (w.totalScore * 100) / w.jobCount; // Multiply by 100 for 2 decimal places
        return (average, w.jobCount);
    }
    
    // Get worker's job history
    function getJob(address worker, uint256 jobIndex) 
        external 
        view 
        returns (string memory platformName, uint8 rating, uint256 timestamp, string memory jobType) 
    {
        require(workers[worker].isRegistered, "Worker not registered");
        require(jobIndex < workers[worker].jobCount, "Job index out of bounds");
        
        Job storage job = workers[worker].jobs[jobIndex];
        require(job.exists, "Job does not exist");
        
        return (job.platformName, job.rating, job.timestamp, job.jobType);
    }
    
    // Get total number of registered workers
    function getWorkerCount() external view returns (uint256) {
        return workerAddresses.length;
    }
    
    // Get worker address by index
    function getWorkerAddress(uint256 index) external view returns (address) {
        require(index < workerAddresses.length, "Index out of bounds");
        return workerAddresses[index];
    }
    
    // Check if worker is registered
    function isWorkerRegistered(address worker) external view returns (bool) {
        return workers[worker].isRegistered;
    }
    
    // Get worker's job count
    function getWorkerJobCount(address worker) external view returns (uint256) {
        require(workers[worker].isRegistered, "Worker not registered");
        return workers[worker].jobCount;
    }
    
    // Utility function to convert uint to string
    function toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}