// The user must have ETH deposited such that deposited eth >= buy order value
// The user must have enough tokens deposited such that token balance >= sell order amount
// The BUY order book should be ordered on price from highest to lowest starting at index 0 

const Dex = artifacts.require("Dex")
const Link = artifacts.require("Link")
const truffleAssert = require("truffle-assertions")

contract("Dex", accounts => {

    let dex
    let link

    before(async () => {
        dex = await Dex.deployed()
        link = await Link.deployed()
    })

    it("should throw an error if ETH balance is too low when creating BUY limit order", async () => {    
        await truffleAssert.reverts( 
            dex.createLimitOrder(0, web3.utils.fromUtf8("LINK"), 10, 1)
        )
        dex.depositETH({ value: 10 })
        await truffleAssert.passes(
            dex.createLimitOrder(0, web3.utils.fromUtf8("LINK"), 10, 1)
        )
    })

    it("should throw an error if token balance is too low when creating SELL limit order", async () => {
        await truffleAssert.reverts( 
            dex.createLimitOrder(1, web3.utils.fromUtf8("LINK"), 10, 1)
        )

        await link.approve(dex.address, 500)
        await dex.addToken(web3.utils.fromUtf8("LINK"), link.address, {from: accounts[0]})
        await dex.deposit(10, web3.utils.fromUtf8("LINK"))
        await truffleAssert.passes(
            dex.createLimitOrder(1, web3.utils.fromUtf8("LINK"), 10, 1)
        )
    })

    it("The BUY order book should be ordered on price from highest to lowest starting at index 0", async () => {
        await link.approve(dex.address, 500)
        await dex.depositETH({ value: 3000 })
        await dex.createLimitOrder(0, web3.utils.fromUtf8("LINK"), 1, 300)
        await dex.createLimitOrder(0, web3.utils.fromUtf8("LINK"), 1, 100)
        await dex.createLimitOrder(0, web3.utils.fromUtf8("LINK"), 1, 200)

        let orderBook = await dex.getOrderBook(web3.utils.fromUtf8("LINK"), 0)
        assert(orderBook.length > 0)
        console.log(orderBook);
        for (let i = 0; i < orderBook.length - 1; i++) {
            assert(orderBook[i].price >= orderBook[i+1].price, "not right order in buy book")
        }
    })

    it("The SELL order book should be ordered on price from lowest to highest starting at index 0", async () => {
        await link.approve(dex.address, 500)
        await dex.createLimitOrder(1, web3.utils.fromUtf8("LINK"), 1, 300)
        await dex.createLimitOrder(1, web3.utils.fromUtf8("LINK"), 1, 100)
        await dex.createLimitOrder(1, web3.utils.fromUtf8("LINK"), 1, 200)

        let orderBook = await dex.getOrderBook(web3.utils.fromUtf8("LINK"), 1)
        assert(orderBook.length > 0)
        console.log(orderBook);
        for (let i = 0; i < orderBook.length - 1; i++) {
            assert(orderBook[i].price <= orderBook[i+1].price, "not right order in sell book")
        }
    })
})