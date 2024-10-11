const { ethers, run } = require("hardhat");

async function main() {
    // ZoraGift
    const ZoraGiftContract = await hre.ethers.getContractFactory("ZoraGift");
    console.log("Deploying ZoraGift Contract...");
    const zoraGift = await ZoraGiftContract.deploy(
        {
            gasPrice: 33000000000,
        }
    );
    await zoraGift.waitForDeployment();
    const zoraGiftAddress = await zoraGift.getAddress();
    console.log("ZoraGift Contract Address:", zoraGiftAddress);
    console.log("----------------------------------------------------------");

    // Verify ZoraGift
    console.log("Verifying ZoraGift...");
    await run("verify:verify", {
        address: zoraGiftAddress,
        constructorArguments: [],
    });
    console.log("----------------------------------------------------------");

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

// yarn hardhat run scripts/deploy.js --network zoraSepolia
// yarn hardhat verify --network zoraSepolia ADDRESS