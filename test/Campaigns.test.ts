import { expect } from "chai";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-chai-matchers";

import type { Campaign } from "../typechain-types/Campaign";
import type { CampaignFactory } from "../typechain-types/CampaignFactory";

let signers: ethers.Signer[];
let campaignAddress: string;
let campaign: Campaign;
let campaignFactory: CampaignFactory;

beforeEach(async () => {
    // Signer in etherjs is a wallet/account
    // equivalent to web3.eth.getAccounts()
    signers = await ethers.getSigners();
    // console.log("Signers 1: ", signers[0].address);
    campaignFactory = await ethers.deployContract("CampaignFactory");
    await campaignFactory.createCampaign(100);
    // Get first deployed campaign address fro mthe returned array
    [campaignAddress] = await campaignFactory.getDeployedCampaigns();
    campaign = await ethers.getContractAt("Campaign", campaignAddress);
});

describe("Campaign Testing", () => {
    it("deploys a factory and a campaign", async () => {
        expect(campaignFactory.target).to.properAddress;
        expect(campaign.BaseContract.target).to.properAddress;
    });

    it("marks caller as the campaign manager", async () => {
        const manager = await campaign.manager();
        expect(manager).to.equal(await signers[0].getAddress());
    });

    it("allows people to contribute money and marks them as approvers", async () => {
        await campaign.connect(signers[1]).contribute({ value: ethers.parseEther("0.0002") });
        const isContributor = await campaign.approvers(await signers[1].getAddress());
        expect(isContributor).to.be.true;
    });

    it("requires a minimum contribution", async () => {
        try {
            await campaign.connect(signers[1]).contribute({ value: ethers.parseEther("0.000005") });
            expect.fail("Transaction should have failed");
        } catch (err) {
            expect(err).to.exist;
        }
    });

    it("allows a manager to make a payment request", async () => {
        // signers[0] is the manager
        await campaign.createRequest("Buy a new car", ethers.parseEther("0.0001"), await signers[0].getAddress());
        const request = await campaign.requests(0);
        expect(request.description).to.equal("Buy a new car");
    });

    it("processes the whole request flow", async () => {
        await campaign.contribute({ value: ethers.parseEther("10") });

        await campaign.createRequest("A", ethers.parseEther("5"), await signers[1].getAddress());

        await campaign.approveRequest(0);

        await campaign.finalizeRequest(0);

        let balance = await ethers.provider.getBalance(await signers[1].getAddress());
        balance = parseFloat(ethers.formatEther(balance));

        expect(balance).to.be.greaterThan(104);
    });
});
