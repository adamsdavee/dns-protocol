// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

// Uncomment this line to use console.log
// import "hardhat/console.sol";


// This Contract stores the record of each domain

error ENSRegistry__NotAuthorized();

contract ENSRegistry {
    
    struct Record {
        address owner;
        uint256 expiration;
        address resolver; // holds other contact information of the domain
    }

    mapping(bytes32 => Record) public records;

    Record[] private allRecords;

    // set record function.
    // This function sets, stores and updates domains
    function setRecord(bytes32 domainName, address _owner, uint256 _expiration, address _resolver) external {

        if(records[domainName].owner != address(0) || msg.sender != records[domainName].owner) revert ENSRegistry__NotAuthorized();

        records[domainName] = Record(_owner, _expiration, _resolver);

        allRecords.push(records[domainName]);
    }

    function transferOwnership(bytes32 _domainName, address _newOwner) external {
        if(msg.sender != records[_domainName].owner) revert ENSRegistry__NotAuthorized();

        records[_domainName].owner = newOwner;
    }

    function setResolver(bytes32 _domainName, address newResolver) external {
        if(records[_domainName].owner != msg.sender || records[_domainName].owner == address(0)) revert ENSRegistry__NotAuthorized();

        records[_domainName].resolver = newResolver;
    }

    function getAllRecords() external return (Record[] memory) {

        return allRecords;
    }

}
