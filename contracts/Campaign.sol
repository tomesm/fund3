// SPDX-License-Identifier: MIT
pragma solidity >=0.8.19;

contract Campaign {
    struct Request {
        string description; // Describes why the request is being created
        uint value; // Amount of money thath the manager wants to send to the vendor
        address payable recipient; // Address that the money will be sent to
        bool complete; // True if the request has already been processed (money sent)
        uint approvalCount;
        mapping(address => bool) approvals;
    }

    Request[] public requests;
    address public manager;
    address[] public players;
    uint public minimumContribution;
    mapping(address => bool) public approvers;
    uint public approversCount;

    modifier restricted() {
        require(msg.sender == manager);
        _;
    }

    constructor(uint minimum, address creator) {
        manager = creator;
        minimumContribution = minimum;
    }

    function contribute() public payable {
        require(msg.value >= minimumContribution, "Minimum contribution must be grater than or equal to 100 wei");
        approvers[msg.sender] = true;
        approversCount++;
    }

    function createRequest(string memory description, uint value, address recipient) public restricted {
        Request storage newRequest = requests.push(); // Push a new Request and get a reference to it

        newRequest.description = description;
        newRequest.value = value;
        newRequest.recipient = payable(recipient);
        newRequest.complete = false;
        newRequest.approvalCount = 0;
    }

    function approveRequest(uint index) public {
        Request storage request = requests[index];

        require(approvers[msg.sender], "Only a donator address can approve the request!");
        // We check for false here
        require(!request.approvals[msg.sender], "A same person can not wote twice on the same request!");
        request.approvals[msg.sender] = true;
        request.approvalCount++;
    }

    function finalizeRequest(uint index) public restricted {
        Request storage request = requests[index];

        require(request.approvalCount > (approversCount / 2), "More than 50% contributors must vote YES!");
        require(!request.complete, "Request must not be completed!");
        // Send money to recipient
        request.recipient.transfer(request.value);
        request.complete = true;
    }
}
