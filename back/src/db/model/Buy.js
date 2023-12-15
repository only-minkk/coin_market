import { db } from "../db";

class Buy {
  static async CountryIdByCountryCode(countryCode) {
    return await db.Country.findFirst({
      where: {
        countryCode: countryCode,
      },
      select: {
        id: true,
      },
    });
  }

  static async findCoinsByCountryId(countryId) {
    return await db.coin.findMany({
      where: {
        countryId: countryId["id"],
        isUsed: true,
      },
      select: {
        currencyType: true,
        stockAmount: true,
      },
    });
  }

  static async findAllCoins() {
    return await db.coin.findMany({
      select: {
        country: {
          select: {
            countryName: true,
          },
        },
        id: true,
        currencyType: true,
        stockAmount: true,
      },
    });
  }

  static async findCoin(coinId) {
    return await db.coin.findUnique({
      where: { id: coinId },
      select: { stockAmount: true },
    });
  }

  static async findStockOrderByCoinId(coinId) {
    return await db.orderCoin.findMany({
      where: {
        coinId,
        stockAmount: { not: 0 },
        deal: {
          is: {
            dealStatus: "SELL",
            isActivate: 1,
          },
        },
      },
      take: 10,
      orderBy: {
        deal: {
          updatedAt: "asc",
        },
      },
      select: {
        id: true,
        dealId: true,
        coinId: true,
        dealAmount: true,
        stockAmount: true,
        coin: {
          select: {
            id: true,
          },
        },
        deal: {
          select: {
            userId: true,
          },
        },
      },
    });
  }

  static async findCoinsUnitAmount(CoinIds) {
    return await db.coin.findMany({
      where: {
        id: { in: CoinIds },
      },
      select: {
        id: true,
        unitAmount: true,
        country: {
          select: {
            exchangeRateCode: true,
          },
        },
      },
    });
  }

  static async createDeal(dataToCreate) {
    const {
      userId,
      dealStatus,
      imageUrl,
      isActivate,
      delivery,
      createOrderCoinList,
      updateDealCoinList,
      addSellerPoint,
    } = dataToCreate;
    let orderTransactionList = [];
    const createDeal = db.deal.create({
      data: {
        userId,
        dealStatus,
        imageUrl,
        isActivate,
        delivery: {
          create: delivery,
        },
        orderCoin: {
          create: createOrderCoinList,
        },
      },
    });
    orderTransactionList.push(createDeal);
    let dateCoinStocks;
    for (let i of createOrderCoinList) {
      dateCoinStocks = db.coin.update({
        where: {
          id: i["coinId"],
        },
        data: {
          stockAmount: { increment: -i["dealAmount"] },
        },
      });
      orderTransactionList.push(dateCoinStocks);
    }

    if (updateDealCoinList["idList"].length != 1) {
      const bulkUpdateOrderCoinStocks = db.orderCoin.updateMany({
        where: {
          id: {
            in: updateDealCoinList["idList"],
          },
        },
        data: {
          stockAmount: 0,
        },
      });
      orderTransactionList.push(bulkUpdateOrderCoinStocks);
    }
    if (Object.keys(updateDealCoinList["notZero"]) != []) {
      let lastUpdateOrderCoinStocks;
      for (let i of Object.keys(updateDealCoinList["notZero"])) {
        lastUpdateOrderCoinStocks = db.orderCoin.update({
          where: {
            id: i,
          },
          data: {
            stockAmount: updateDealCoinList["notZero"][i],
          },
        });
        orderTransactionList.push(lastUpdateOrderCoinStocks);
      }
    }
    const addSellerPointList = Object.keys(addSellerPoint);
    const walletList = await db.Wallet.findMany({
      where: {
        userId: { in: [...addSellerPointList] },
        expirationDate: new Date("9999-12-31T23:59:59.000Z"),
      },
    });
    orderTransactionList.push(
      db.wallet.updateMany({
        where: {
          userId: { in: Object.keys(addSellerPoint) },
          expirationDate: new Date("9999-12-31T23:59:59.000Z"),
        },
        data: { expirationDate: new Date() },
      })
    );
    let createWalletList = [];
    for (let i of walletList) {
      i["krwAmount"] += addSellerPoint[i["userId"]];
      i["statement"] = "판매금액";
      delete i["id"];
      createWalletList.push(i);
    }
    orderTransactionList.push(
      db.wallet.createMany({
        data: createWalletList,
      })
    );

    return await db.$transaction(orderTransactionList);
  }
}

export { Buy };
