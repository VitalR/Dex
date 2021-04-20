const Dex = artifacts.require("Dex")
const Link = artifacts.require("Link")
const truffleAssert = require("truffle-assertions")

contract.skip("Dex", accounts => {

    let dex
    let link

    before(async () => {
        dex = await Dex.deployed()
        link = await Link.deployed()
    })

    it("should be possible only for owner to add tokens", async () => {
        await truffleAssert.passes( 
            dex.addToken(web3.utils.fromUtf8("LINK"), link.address, { from: accounts[0] })
        )
        await truffleAssert.reverts( 
            dex.addToken(web3.utils.fromUtf8("LINK"), link.address, { from: accounts[1] })
        )
    })

    it("should handle deposits correctly", async () => {
        await link.approve(dex.address, 500)
        await dex.deposit(100, web3.utils.fromUtf8("LINK"))
        let balance = await dex.balances(accounts[0], web3.utils.fromUtf8("LINK"))
        assert.equal( balance.toNumber(), 100 )
    })

    it("should handle faulty withdrawals correctly", async () => {
        await truffleAssert.reverts(
            dex.deposit(500, web3.utils.fromUtf8("LINK"))
        ) 
    })

    it("should handle correct withdrawals correctly", async () => {
        await truffleAssert.passes(
            dex.deposit(100, web3.utils.fromUtf8("LINK"))
        ) 
    })
})