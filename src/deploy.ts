import "@nomicfoundation/hardhat-ethers";

export async function deployContract() {
    const campaignFactory = await ethers.deployContract("CampaignFactory");
    console.log("CampaignFactory deployed to: ", campaignFactory.target);
}

deployContract()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
