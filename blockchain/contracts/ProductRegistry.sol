// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ProductRegistry
 * @notice Handles product registration by manufacturers.
 *         Each product is identified by its serial number (string).
 *         Once registered, core fields are immutable on-chain.
 */
contract ProductRegistry {
    // ─── Structs ────────────────────────────────────────────────────────────

    struct Product {
        string  serialNumber;
        string  name;
        string  brand;
        string  description;
        uint256 price;          // stored in smallest unit (e.g. paisa / cents)
        address manufacturer;   // wallet that registered the product
        uint256 registeredAt;   // block timestamp
        bool    exists;
    }

    // ─── State ──────────────────────────────────────────────────────────────

    // serialNumber => Product
    mapping(string => Product) private products;

    // keep an ordered list of all serial numbers for enumeration
    string[] private serialNumbers;

    // ─── Events ─────────────────────────────────────────────────────────────

    event ProductRegistered(
        string  indexed serialNumber,
        string  name,
        string  brand,
        address indexed manufacturer,
        uint256 registeredAt
    );

    // ─── Errors ─────────────────────────────────────────────────────────────

    error ProductAlreadyExists(string serialNumber);
    error ProductNotFound(string serialNumber);
    error EmptyField(string fieldName);

    // ─── Functions ──────────────────────────────────────────────────────────

    /**
     * @notice Register a new product on-chain.
     * @param _serialNumber Unique product serial number
     * @param _name         Product name
     * @param _brand        Product brand
     * @param _description  Product description
     * @param _price        Product price (in smallest currency unit)
     */
    function registerProduct(
        string calldata _serialNumber,
        string calldata _name,
        string calldata _brand,
        string calldata _description,
        uint256 _price
    ) external {
        if (bytes(_serialNumber).length == 0) revert EmptyField("serialNumber");
        if (bytes(_name).length == 0)         revert EmptyField("name");
        if (bytes(_brand).length == 0)        revert EmptyField("brand");
        if (products[_serialNumber].exists)   revert ProductAlreadyExists(_serialNumber);

        products[_serialNumber] = Product({
            serialNumber:  _serialNumber,
            name:          _name,
            brand:         _brand,
            description:   _description,
            price:         _price,
            manufacturer:  msg.sender,
            registeredAt:  block.timestamp,
            exists:        true
        });

        serialNumbers.push(_serialNumber);

        emit ProductRegistered(_serialNumber, _name, _brand, msg.sender, block.timestamp);
    }

    /**
     * @notice Fetch full product details by serial number.
     */
    function getProduct(string calldata _serialNumber)
        external
        view
        returns (Product memory)
    {
        if (!products[_serialNumber].exists) revert ProductNotFound(_serialNumber);
        return products[_serialNumber];
    }

    /**
     * @notice Check whether a product serial number is already registered.
     */
    function productExists(string calldata _serialNumber)
        external
        view
        returns (bool)
    {
        return products[_serialNumber].exists;
    }

    /**
     * @notice Returns total number of registered products.
     */
    function totalProducts() external view returns (uint256) {
        return serialNumbers.length;
    }
}
