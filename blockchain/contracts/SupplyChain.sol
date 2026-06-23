// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./ProductRegistry.sol";
import "./SellerRegistry.sol";

/**
 * @title SupplyChain
 * @notice Tracks the full lifecycle of a product:
 *         Manufactured → Sold to Seller → Supply Chain Updated → Sold to Consumer
 *
 *         Every state change appends an immutable event to the product's history.
 */
contract SupplyChain {
    // ─── Enums ──────────────────────────────────────────────────────────────

    enum ProductStatus {
        Manufactured,       // 0 - registered by manufacturer
        SoldToSeller,       // 1 - manufacturer sold to seller
        InTransit,          // 2 - seller marked as in transit
        InStock,            // 3 - seller marked as in stock
        SoldToConsumer      // 4 - sold to end consumer
    }

    // ─── Structs ────────────────────────────────────────────────────────────

    struct HistoryEvent {
        ProductStatus status;
        string        location;
        string        notes;
        string        actorCode;   // sellerCode or consumerCode depending on step
        address       actor;       // wallet address of who triggered this
        uint256       timestamp;
    }

    struct ProductState {
        ProductStatus currentStatus;
        string        currentSellerCode;
        string        consumerCode;
        bool          exists;
    }

    // ─── State ──────────────────────────────────────────────────────────────

    ProductRegistry public productRegistry;
    SellerRegistry  public sellerRegistry;

    // serialNumber => current state
    mapping(string => ProductState) private productStates;

    // serialNumber => ordered history
    mapping(string => HistoryEvent[]) private productHistory;

    // ─── Events ─────────────────────────────────────────────────────────────

    event SoldToSeller(
        string indexed serialNumber,
        string indexed sellerCode,
        address actor,
        uint256 timestamp
    );

    event SupplyChainUpdated(
        string indexed serialNumber,
        string indexed sellerCode,
        ProductStatus  newStatus,
        string         location,
        uint256        timestamp
    );

    event SoldToConsumer(
        string indexed serialNumber,
        string indexed consumerCode,
        address actor,
        uint256 timestamp
    );

    // ─── Errors ─────────────────────────────────────────────────────────────

    error ProductNotRegistered(string serialNumber);
    error SellerNotRegistered(string sellerCode);
    error InvalidStatusTransition(string serialNumber, ProductStatus current, ProductStatus attempted);
    error ProductAlreadySoldToConsumer(string serialNumber);
    error EmptyField(string fieldName);

    // ─── Constructor ────────────────────────────────────────────────────────

    constructor(address _productRegistry, address _sellerRegistry) {
        productRegistry = ProductRegistry(_productRegistry);
        sellerRegistry  = SellerRegistry(_sellerRegistry);
    }

    // ─── Internal helpers ───────────────────────────────────────────────────

    function _initProductState(string calldata _serialNumber) internal {
        if (!productStates[_serialNumber].exists) {
            productStates[_serialNumber] = ProductState({
                currentStatus:     ProductStatus.Manufactured,
                currentSellerCode: "",
                consumerCode:      "",
                exists:            true
            });
            // seed history with manufactured event
            productHistory[_serialNumber].push(HistoryEvent({
                status:    ProductStatus.Manufactured,
                location:  "Manufacturer",
                notes:     "Product registered on blockchain.",
                actorCode: "",
                actor:     msg.sender,
                timestamp: block.timestamp
            }));
        }
    }

    // ─── Functions ──────────────────────────────────────────────────────────

    /**
     * @notice Manufacturer sells product to a registered seller.
     * @param _serialNumber Product serial number
     * @param _sellerCode   Seller code
     */
    function sellToSeller(
        string calldata _serialNumber,
        string calldata _sellerCode
    ) external {
        if (!productRegistry.productExists(_serialNumber))
            revert ProductNotRegistered(_serialNumber);
        if (!sellerRegistry.sellerExists(_sellerCode))
            revert SellerNotRegistered(_sellerCode);

        _initProductState(_serialNumber);

        ProductState storage state = productStates[_serialNumber];

        // Can only sell to seller from Manufactured state
        if (state.currentStatus != ProductStatus.Manufactured)
            revert InvalidStatusTransition(_serialNumber, state.currentStatus, ProductStatus.SoldToSeller);

        state.currentStatus     = ProductStatus.SoldToSeller;
        state.currentSellerCode = _sellerCode;

        productHistory[_serialNumber].push(HistoryEvent({
            status:    ProductStatus.SoldToSeller,
            location:  "Seller Warehouse",
            notes:     string(abi.encodePacked("Sold to seller: ", _sellerCode)),
            actorCode: _sellerCode,
            actor:     msg.sender,
            timestamp: block.timestamp
        }));

        emit SoldToSeller(_serialNumber, _sellerCode, msg.sender, block.timestamp);
    }

    /**
     * @notice Seller updates the supply chain status of a product.
     * @param _serialNumber Product serial number
     * @param _sellerCode   Seller code (must match current owner)
     * @param _newStatus    Either InTransit (2) or InStock (3)
     * @param _location     Current physical location
     * @param _notes        Any additional notes
     */
    function updateSupplyChain(
        string calldata _serialNumber,
        string calldata _sellerCode,
        ProductStatus   _newStatus,
        string calldata _location,
        string calldata _notes
    ) external {
        if (!productRegistry.productExists(_serialNumber))
            revert ProductNotRegistered(_serialNumber);
        if (!sellerRegistry.sellerExists(_sellerCode))
            revert SellerNotRegistered(_sellerCode);
        if (bytes(_location).length == 0) revert EmptyField("location");

        ProductState storage state = productStates[_serialNumber];

        // Must be InTransit or InStock update
        if (_newStatus != ProductStatus.InTransit && _newStatus != ProductStatus.InStock)
            revert InvalidStatusTransition(_serialNumber, state.currentStatus, _newStatus);

        // Must not be sold to consumer already
        if (state.currentStatus == ProductStatus.SoldToConsumer)
            revert ProductAlreadySoldToConsumer(_serialNumber);

        state.currentStatus = _newStatus;

        productHistory[_serialNumber].push(HistoryEvent({
            status:    _newStatus,
            location:  _location,
            notes:     _notes,
            actorCode: _sellerCode,
            actor:     msg.sender,
            timestamp: block.timestamp
        }));

        emit SupplyChainUpdated(_serialNumber, _sellerCode, _newStatus, _location, block.timestamp);
    }

    /**
     * @notice Seller sells product to a consumer.
     * @param _serialNumber  Product serial number
     * @param _consumerCode  Consumer code given to the buyer
     */
    function sellToConsumer(
        string calldata _serialNumber,
        string calldata _consumerCode
    ) external {
        if (!productRegistry.productExists(_serialNumber))
            revert ProductNotRegistered(_serialNumber);
        if (bytes(_consumerCode).length == 0) revert EmptyField("consumerCode");

        ProductState storage state = productStates[_serialNumber];

        if (state.currentStatus == ProductStatus.SoldToConsumer)
            revert ProductAlreadySoldToConsumer(_serialNumber);

        // Must have been sold to seller first
        if (state.currentStatus == ProductStatus.Manufactured)
            revert InvalidStatusTransition(_serialNumber, state.currentStatus, ProductStatus.SoldToConsumer);

        state.currentStatus = ProductStatus.SoldToConsumer;
        state.consumerCode  = _consumerCode;

        productHistory[_serialNumber].push(HistoryEvent({
            status:    ProductStatus.SoldToConsumer,
            location:  "Consumer",
            notes:     string(abi.encodePacked("Sold to consumer code: ", _consumerCode)),
            actorCode: _consumerCode,
            actor:     msg.sender,
            timestamp: block.timestamp
        }));

        emit SoldToConsumer(_serialNumber, _consumerCode, msg.sender, block.timestamp);
    }

    // ─── View functions ─────────────────────────────────────────────────────

    /**
     * @notice Get current state of a product.
     */
    function getProductState(string calldata _serialNumber)
        external
        view
        returns (ProductState memory)
    {
        return productStates[_serialNumber];
    }

    /**
     * @notice Get full history of a product (all events).
     */
    function getProductHistory(string calldata _serialNumber)
        external
        view
        returns (HistoryEvent[] memory)
    {
        return productHistory[_serialNumber];
    }

    /**
     * @notice Verify product authenticity.
     *         Returns true only if the product is sold to consumer
     *         AND the consumer code matches.
     */
    function verifyProduct(
        string calldata _serialNumber,
        string calldata _consumerCode
    ) external view returns (bool isAuthentic, ProductStatus status) {
        ProductState storage state = productStates[_serialNumber];
        status = state.currentStatus;

        if (
            state.currentStatus == ProductStatus.SoldToConsumer &&
            keccak256(bytes(state.consumerCode)) == keccak256(bytes(_consumerCode))
        ) {
            isAuthentic = true;
        } else {
            isAuthentic = false;
        }
    }
}
