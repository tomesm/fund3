// SPDX-License-Identifier: MIT
pragma solidity >=0.8.19;

import "./Campaign.sol";

contract CampaignFactory {
    address[] public deployedCampaigns; // Addresses of all deployed campaigns

    // Deploys a new instance of a Campaign and stores the resulting address
    function createCampaign(uint minimum) public {
        // msg.sender is an address of a person who is creating the new campaign
        address newCampaign = address(new Campaign(minimum, msg.sender));
        deployedCampaigns.push(newCampaign);
    }

    // Returns a list of all deployed campaigns
    function getDeployedCampaigns() public view returns (address[] memory) {
        return deployedCampaigns;
    }
}
