// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title SellerRegistry
 * @notice Handles seller registration by manufacturers.
 *         Each seller is identified by a unique seller code (string).
 */
contract SellerRegistry {
    // ─── Structs ────────────────────────────────────────────────────────────

    struct Seller {
        string  sellerCode;
        string  name;
        string  brand;
        string  phone;
        string  sellerAddress;  // physical address (not wallet)
        address registeredBy;   // manufacturer wallet
        uint256 registeredAt;
        bool    exists;
    }

    // ─── State ──────────────────────────────────────────────────────────────

    // sellerCode => Seller
    mapping(string => Seller) private sellers;

    string[] private sellerCodes;

    // ─── Events ─────────────────────────────────────────────────────────────

    event SellerRegistered(
        string  indexed sellerCode,
        string  name,
        string  brand,
        address indexed registeredBy,
        uint256 registeredAt
    );

    // ─── Errors ─────────────────────────────────────────────────────────────

    error SellerAlreadyExists(string sellerCode);
    error SellerNotFound(string sellerCode);
    error EmptyField(string fieldName);

    // ─── Functions ──────────────────────────────────────────────────────────

    /**
     * @notice Register a new seller on-chain.
     * @param _sellerCode    Unique seller code (e.g. S123456)
     * @param _name          Seller name
     * @param _brand         Seller brand
     * @param _phone         Seller phone number
     * @param _sellerAddress Seller physical address
     */
    function registerSeller(
        string calldata _sellerCode,
        string calldata _name,
        string calldata _brand,
        string calldata _phone,
        string calldata _sellerAddress
    ) external {
        if (bytes(_sellerCode).length == 0)  revert EmptyField("sellerCode");
        if (bytes(_name).length == 0)        revert EmptyField("name");
        if (sellers[_sellerCode].exists)     revert SellerAlreadyExists(_sellerCode);

        sellers[_sellerCode] = Seller({
            sellerCode:     _sellerCode,
            name:           _name,
            brand:          _brand,
            phone:          _phone,
            sellerAddress:  _sellerAddress,
            registeredBy:   msg.sender,
            registeredAt:   block.timestamp,
            exists:         true
        });

        sellerCodes.push(_sellerCode);

        emit SellerRegistered(_sellerCode, _name, _brand, msg.sender, block.timestamp);
    }

    /**
     * @notice Fetch full seller details by seller code.
     */
    function getSeller(string calldata _sellerCode)
        external
        view
        returns (Seller memory)
    {
        if (!sellers[_sellerCode].exists) revert SellerNotFound(_sellerCode);
        return sellers[_sellerCode];
    }

    /**
     * @notice Check whether a seller code is already registered.
     */
    function sellerExists(string calldata _sellerCode)
        external
        view
        returns (bool)
    {
        return sellers[_sellerCode].exists;
    }

    /**
     * @notice Returns total number of registered sellers.
     */
    function totalSellers() external view returns (uint256) {
        return sellerCodes.length;
    }
}
