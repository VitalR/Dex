pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import "./Wallet.sol";

contract Dex is Wallet {

    using SafeMath for uint;

    enum Side {
        BUY, // 0
        SELL // 1
    }

    struct Order {
        uint id;
        address trader;
        Side side;
        bytes32 ticker;
        uint amount;
        uint price;
    }

    uint public nextOrderId = 0;

    // ticker => Side => Order[];
    mapping(bytes32 => mapping(uint  => Order[])) public orderBook;

    function depositETH(uint value) public {

    }

    function getOrderBook(bytes32 ticker, Side side) view public returns (Order[] memory) {
        return orderBook[ticker][uint(side)];
        // getOrderBook(bytes32("LINK"), Side.BUY)
    }

    function createLimitOrder(Side side, bytes32 ticker, uint amount, uint price) public {
        if(side == Side.BUY) {
            require(balances[msg.sender]["ETH"] >= amount.mul(price));
        }
        else if(side == Side.SELL) {
            require(balances[msg.sender][ticker] >= amount);
        }

        // [Order1, Order2, ...] - list of Orders
        Order[] storage orders = orderBook[ticker][uint(side)];
        orders.push(
            Order(nextOrderId, msg.sender, side, ticker, amount, price)
        );

        // Bubble sort
        uint i = orders.length > 0 ? orders.length - 1 : 0;

        if(side == Side.BUY) {          
            while(i > 0) {
                if(orders[i - 1].price > orders[i].price) {
                    break;
                }
                Order memory orderToMove = orders[i - 1];
                orders[i - 1] = orders[i];
                orders[i] = orderToMove;
                i--;
            }
        } 
        else if(side == Side.SELL) {
            while(i > 0) {
                if(orders[i - 1].price < orders[i].price) {
                    break;
                }
                Order memory orderToMove = orders[i - 1];
                orders[i - 1] = orders[i];
                orders[i] = orderToMove;
                i--;
            }
        }
        nextOrderId++;
    }

    function createMarketOrder(Side side, bytes32 ticker, uint amount) public {
        
    }

}