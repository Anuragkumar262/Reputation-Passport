const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Reputation Contract", function () {
  let reputation;
  let owner, worker1, worker2;
  
  beforeEach(async function () {
    // Get test accounts
    [owner, worker1, worker2] = await ethers.getSigners();
    
    // Deploy the contract
    const Reputation = await ethers.getContractFactory("Reputation");
    reputation = await Reputation.deploy();
    await reputation.waitForDeployment();
  });
  
  describe("Worker Registration", function () {
    it("Should register a new worker", async function () {
      await reputation.connect(worker1).registerWorker();
      
      const isRegistered = await reputation.isWorkerRegistered(worker1.address);
      expect(isRegistered).to.be.true;
      
      const [score, jobCount] = await reputation.getScore(worker1.address);
      expect(score).to.equal(0);
      expect(jobCount).to.equal(0);
    });
    
    it("Should not allow duplicate registration", async function () {
      await reputation.connect(worker1).registerWorker();
      
      await expect(
        reputation.connect(worker1).registerWorker()
      ).to.be.revertedWith("Worker already registered");
    });
    
    it("Should track worker count", async function () {
      expect(await reputation.getWorkerCount()).to.equal(0);
      
      await reputation.connect(worker1).registerWorker();
      expect(await reputation.getWorkerCount()).to.equal(1);
      
      await reputation.connect(worker2).registerWorker();
      expect(await reputation.getWorkerCount()).to.equal(2);
    });
  });
  
  describe("Job Management", function () {
    beforeEach(async function () {
      // Register worker1 for job tests
      await reputation.connect(worker1).registerWorker();
    });
    
    it("Should add a job successfully", async function () {
      await reputation.connect(worker1).addJob("Uber", 5, "Driver");
      
      const [score, jobCount] = await reputation.getScore(worker1.address);
      expect(jobCount).to.equal(1);
      expect(score).to.equal(500); // 5.00 * 100 (scaled by 100)
      
      // Get job details
      const [platform, rating, timestamp, jobType] = await reputation.getJob(worker1.address, 0);
      expect(platform).to.equal("Uber");
      expect(rating).to.equal(5);
      expect(jobType).to.equal("Driver");
      expect(timestamp).to.be.gt(0);
    });
    
    it("Should calculate average score correctly", async function () {
      // Add multiple jobs
      await reputation.connect(worker1).addJob("Uber", 5, "Driver");
      await reputation.connect(worker1).addJob("DoorDash", 4, "Delivery");
      await reputation.connect(worker1).addJob("TaskRabbit", 3, "Assembly");
      
      const [score, jobCount] = await reputation.getScore(worker1.address);
      expect(jobCount).to.equal(3);
      expect(score).to.equal(400); // (5+4+3)/3 = 4.00 * 100
    });
    
    it("Should reject invalid ratings", async function () {
      await expect(
        reputation.connect(worker1).addJob("Uber", 0, "Driver")
      ).to.be.revertedWith("Rating must be between 1 and 5");
      
      await expect(
        reputation.connect(worker1).addJob("Uber", 6, "Driver")
      ).to.be.revertedWith("Rating must be between 1 and 5");
    });
    
    it("Should reject empty platform name", async function () {
      await expect(
        reputation.connect(worker1).addJob("", 5, "Driver")
      ).to.be.revertedWith("Platform name cannot be empty");
    });
    
    it("Should reject empty job type", async function () {
      await expect(
        reputation.connect(worker1).addJob("Uber", 5, "")
      ).to.be.revertedWith("Job type cannot be empty");
    });
    
    it("Should not allow unregistered workers to add jobs", async function () {
      await expect(
        reputation.connect(worker2).addJob("Uber", 5, "Driver")
      ).to.be.revertedWith("Worker not registered");
    });
  });
  
  describe("Data Retrieval", function () {
    beforeEach(async function () {
      await reputation.connect(worker1).registerWorker();
      await reputation.connect(worker1).addJob("Uber", 5, "Driver");
      await reputation.connect(worker1).addJob("DoorDash", 4, "Delivery");
    });
    
    it("Should get job count correctly", async function () {
      const jobCount = await reputation.getWorkerJobCount(worker1.address);
      expect(jobCount).to.equal(2);
    });
    
    it("Should get worker addresses", async function () {
      await reputation.connect(worker2).registerWorker();
      
      const worker1Addr = await reputation.getWorkerAddress(0);
      const worker2Addr = await reputation.getWorkerAddress(1);
      
      expect(worker1Addr).to.equal(worker1.address);
      expect(worker2Addr).to.equal(worker2.address);
    });
    
    it("Should handle out of bounds job index", async function () {
      await expect(
        reputation.getJob(worker1.address, 5)
      ).to.be.revertedWith("Job index out of bounds");
    });
    
    it("Should handle unregistered worker queries", async function () {
      await expect(
        reputation.getScore(worker2.address)
      ).to.be.revertedWith("Worker not registered");
    });
  });
  
  describe("Events", function () {
    it("Should emit WorkerRegistered event", async function () {
      await expect(reputation.connect(worker1).registerWorker())
        .to.emit(reputation, "WorkerRegistered")
        .withArgs(worker1.address);
    });
    
    it("Should emit JobAdded and ScoreUpdated events", async function () {
      await reputation.connect(worker1).registerWorker();
      
      await expect(reputation.connect(worker1).addJob("Uber", 5, "Driver"))
        .to.emit(reputation, "JobAdded")
        .withArgs(worker1.address, "Uber", 5, "Driver")
        .and.to.emit(reputation, "ScoreUpdated")
        .withArgs(worker1.address, 5, 1);
    });
  });
});