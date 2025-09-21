const hre = require("hardhat");

async function main() {
  console.log("Starting deployment of Reputation contract...");
  
  // Get the ContractFactory and Signers
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());
  
  // Deploy the Reputation contract
  const Reputation = await hre.ethers.getContractFactory("Reputation");
  const reputation = await Reputation.deploy();
  
  await reputation.waitForDeployment();
  
  const contractAddress = await reputation.getAddress();
  console.log("Reputation contract deployed to:", contractAddress);
  
  // Optional: Add some sample data for demo purposes
  console.log("\n--- Adding sample data for demo ---");
  
  try {
    // Register the deployer as a worker
    console.log("Registering deployer as worker...");
    await reputation.registerWorker();
    console.log("✅ Deployer registered successfully");
    
    // Add some sample jobs
    const sampleJobs = [
      { platform: "Uber", rating: 5, jobType: "Driver" },
      { platform: "DoorDash", rating: 4, jobType: "Delivery" },
      { platform: "TaskRabbit", rating: 5, jobType: "Assembly" },
      { platform: "Fiverr", rating: 5, jobType: "Design" }
    ];
    
    for (const job of sampleJobs) {
      console.log(`Adding job: ${job.platform} - ${job.rating} stars`);
      await reputation.addJob(job.platform, job.rating, job.jobType);
      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log("✅ Sample jobs added successfully");
    
    // Get and display the worker's score
    const [score, jobCount] = await reputation.getScore(deployer.address);
    console.log(`\n📊 Worker Score: ${score/100} (${jobCount} jobs)`);
    
  } catch (error) {
    console.log("⚠️ Could not add sample data:", error.message);
  }
  
  console.log("\n--- Deployment Summary ---");
  console.log("Contract Address:", contractAddress);
  console.log("Network:", hre.network.name);
  console.log("Deployer:", deployer.address);
  console.log("Gas Used: Check transaction receipt");
  
  // Save deployment info for frontend
  const fs = require('fs');
  const deploymentInfo = {
    contractAddress: contractAddress,
    network: hre.network.name,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address
  };
  
  try {
    fs.writeFileSync('deployment.json', JSON.stringify(deploymentInfo, null, 2));
    console.log("✅ Deployment info saved to deployment.json");
  } catch (error) {
    console.log("⚠️ Could not save deployment info:", error.message);
  }
  
  console.log("\n🚀 Deployment completed successfully!");
  console.log("You can now connect your frontend to the deployed contract.");
}

// Run the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });