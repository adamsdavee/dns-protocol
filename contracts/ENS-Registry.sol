// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title ENSRegistry
 * @notice This contract acts as the primary directory for domain names.
 *         It stores ownership information, pointers to resolver contracts, and expiration times.
 */
contract ENSRegistry {
    // A record for each domain name
    struct Record {
        address owner;    // The wallet address that owns the domain
        address resolver; // Address of the resolver contract for this domain
        uint256 expiration; // When the domain registration expires
    }

    // Mapping from a domain node (e.g., keccak256 hash of the domain name) to its record.
    mapping(bytes32 => Record) public records;

    Record[] private allRecords;

    // Events to log changes in the registry.
    event NewDomain(bytes32 indexed domain, address owner);
    event Transfer(bytes32 indexed domain, address newOwner);
    event SetResolver(bytes32 indexed domain, address resolver);
    event RenewDomain(bytes32 indexed domain, uint256 expiration);

    /**
     * @notice Sets or updates the record for a domain.
     * @param domainHash The unique identifier for the domain.
     * @param owner The wallet address of the domain owner.
     * @param resolver The resolver contract address associated with this domain.
     * @param expiration The timestamp when the registration expires.
     */
    function setRecord(
        bytes32 domainHash,
        address owner,
        address resolver,
        uint256 expiration
    ) external {
        // Allow update if the caller is the current owner or if the domain is unregistered.
        require(msg.sender == records[domainHash].owner || records[domainHash].owner == address(0), "Not authorized");
        Record memory record = Record(owner, resolver, expiration);
        records[domainHash] = record;
        allRecorods.push(record);
        emit NewDomain(domainHash, owner);
    }

    /**
     * @notice Transfers domain ownership to a new address.
     * @param domainHash The unique identifier for the domain.
     * @param newOwner The wallet address of the new owner.
     */
    function transferOwnership(bytes32 domainHash, address newOwner) external {
        require(msg.sender == records[domainHash].owner, "Not authorized");
        records[domainHash].owner = newOwner;
        emit Transfer(domainHash, newOwner);
    }

    /**
     * @notice Sets or updates the resolver for a domain.
     * @param domainHash The unique identifier for the domain.
     * @param resolver The new resolver contract address.
     */
    function setResolver(bytes32 domainHash, address resolver) external {
        require(msg.sender == records[domainHash].owner, "Not authorized");
        records[domainHash].resolver = resolver;
        emit SetResolver(domainHash, resolver);
    }

    function getSpecificRecord(bytes32 domainHash) external view returns (Record) {
        return records[domainHash];
    }

    function getAllRecords() external view returns (Record[] memory) {
        return allRecords;
    }
}