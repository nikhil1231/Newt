const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber } = require('ethers');

const KWEI = BigNumber.from(1000)
const MWEI = KWEI.mul(KWEI)
const GWEI = MWEI.mul(KWEI)
const ETH = GWEI.mul(GWEI)
const KETH = ETH.mul(KWEI)

describe("Triton", function () {
  before(async function () {

    this.Triton = await ethers.getContractFactory("Triton");
    this.Wbnb = await ethers.getContractFactory("WBNB");
    this.Router = await ethers.getContractFactory("Router");
    this.signers = await ethers.getSigners();
  });

  beforeEach(async function () {
    this.wbnb = await this.Wbnb.deploy()
    await this.wbnb.deployed()
    this.router = await this.Router.deploy()
    await this.router.deployed()
    this.triton = await this.Triton.deploy(this.wbnb.address, this.router.address)
    await this.triton.deployed()

    this.owner = this.signers[0];
    this.anyone = this.signers[1];
    this.addr = this.signers[2].address;
    this.lp = this.signers[3];

    await this.wbnb.deposit({
      value: KETH
    })

    await this.wbnb.connect(this.lp).deposit({
      value: KETH
    })

    await this.triton.deposit({
      value: KETH
    })
  });

  describe("deposit", function () {
    it('should wrap BNB', async function () {
      const contractBalance = await this.wbnb.balanceOf(this.triton.address)
      expect(await ethers.provider.getBalance(this.triton.address)).to.equal(0)

      const depositAmount = KWEI
      await this.triton.deposit({
        value: depositAmount
      })

      expect(await this.wbnb.balanceOf(this.triton.address)).to.equal(contractBalance.add(depositAmount))
      expect(await ethers.provider.getBalance(this.triton.address)).to.equal(0)
    });

    it('should allow wbnb', async function () {
      const contractBalance = await this.wbnb.balanceOf(this.triton.address)
      expect(await ethers.provider.getBalance(this.triton.address)).to.equal(0)

      const depositAmount = KWEI
      await this.wbnb.transfer(this.triton.address, depositAmount)

      expect(await this.wbnb.balanceOf(this.triton.address)).to.equal(contractBalance.add(depositAmount))
      expect(await ethers.provider.getBalance(this.triton.address)).to.equal(0)
    });

    it('should not allow sending directly', async function () {
      const depositAmount = KWEI
      await expect(this.owner.sendTransaction({
        to: this.triton.address,
        value: depositAmount
      })).to.be.revertedWith("Can't deposit directly")
    });
  });

  // describe("withdraw", function () {
  //   it('should allow owner', async function () {
  //     const ownerBalance = await ethers.provider.getBalance(this.owner.address)
  //     const contractBalance = await this.wbnb.balanceOf(this.triton.address)
  //     expect(await ethers.provider.getBalance(this.triton.address)).to.equal(0)

  //     const withdrawAmount = KWEI
  //     const _tx = await this.triton.withdraw(withdrawAmount)
  //     const tx = await _tx.wait()

  //     const gas = tx.cumulativeGasUsed.mul(tx.effectiveGasPrice)

  //     expect(await ethers.provider.getBalance(this.owner.address)).to.equal(ownerBalance.add(withdrawAmount).sub(gas))
  //     expect(await this.wbnb.balanceOf(this.triton.address)).to.equal(contractBalance.sub(withdrawAmount))
  //     expect(await ethers.provider.getBalance(this.triton.address)).to.equal(0)
  //   });

  //   it('should not allow withdraw more than balance', async function () {
  //     const contractBalance = await this.wbnb.balanceOf(this.triton.address)
  //     await expect(
  //       this.triton.withdraw(contractBalance.add(1))
  //     ).to.be.revertedWith("Withdrawing too much")
  //   });

  //   it('should not allow anyone', async function () {
  //     await expect(
  //       this.triton.connect(this.anyone).withdraw(1)
  //     ).to.be.revertedWith(`ERROR 403`)
  //   });
  // });

  describe("buy/sell", function () {
    before(async function () {
      this.Token = await ethers.getContractFactory("TestERC20");
      this.Pair = await ethers.getContractFactory("Pair");
      this.Lib = await ethers.getContractFactory("TestIceLibrary");

      this.lib = await this.Lib.deploy()
      await this.lib.deployed()

      this.tokenA = await this.Token.deploy("Token A", "TA")
      await this.tokenA.deployed()

      this.lp = this.signers[3]

      await this.tokenA.connect(this.lp).mint(KETH)

    });

    beforeEach(async function () {
      this.pair = await this.Pair.deploy()
      await this.pair.deployed()
      await this.pair.initialize(this.wbnb.address, this.tokenA.address)

      await this.wbnb.connect(this.lp).approve(this.router.address, KETH)
      await this.tokenA.connect(this.lp).approve(this.router.address, KETH)

      await this.router.init(this.pair.address, this.wbnb.address)
      await this.router.connect(this.lp).setLiquidity(this.wbnb.address, this.tokenA.address, ETH.mul(100), ETH.mul(100))
    });

    it('should allow owner', async function () {
      const path = [this.wbnb.address, this.tokenA.address]

      await this.triton.buy(ETH, path)

      const balance = await this.tokenA.balanceOf(this.triton.address)

      console.log("Balance after buying: " + balance);

      await this.triton.sell(balance, [this.tokenA.address, this.wbnb.address])

      expect(await this.tokenA.balanceOf(this.triton.address)).to.be.equal(0)

    });

    it("should not allow buying honeypot", async function () {
      const Honey = await ethers.getContractFactory("BadERC20");
      const honeyToken = await Honey.deploy("Honey token", "H", this.triton.address)
      await honeyToken.deployed()
      await honeyToken.connect(this.lp).mint(KETH)

      const honeyPair = await this.Pair.deploy()
      await honeyPair.deployed()
      await honeyPair.initialize(this.wbnb.address, honeyToken.address)

      const honeyRouter = await this.Router.deploy()
      await honeyRouter.deployed()

      await this.wbnb.connect(this.lp).approve(honeyRouter.address, KETH)
      await honeyToken.connect(this.lp).approve(honeyRouter.address, KETH)

      await honeyRouter.init(honeyPair.address, this.wbnb.address)
      await honeyRouter.connect(this.lp).setLiquidity(this.wbnb.address, honeyToken.address, ETH.mul(100), ETH.mul(100))

      const path = [this.wbnb.address, honeyToken.address]

      await expect(
        this.triton.buy(GWEI, path)
      ).to.be.reverted;

    })

    it('should not allow anyone', async function () {
      await expect(
        this.triton.connect(this.anyone).buy(1, [])
      ).to.be.revertedWith(`ERROR 403`)
    });
  });

});
