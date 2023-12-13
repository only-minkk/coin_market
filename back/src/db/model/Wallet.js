import { db } from "../db";

class Wallet {
  static async findWalletByUserId(userId) {
    const wallet = db.wallet.findMany({
      where: {
        userId,
      },
      orderBy: {
        expirationDate: "desc",
      },
    });
    return wallet;
  }

  static async letChanges(data) {
    const wallet = db.wallet.create({
      data,
    });
    return wallet;
  }

  static async updateData(id) {
    const updatedWallet = db.wallet.update({
      where: {
        id,
      },
      data: {
        expirationDate: new Date(),
      },
    });
    return updatedWallet;
  }
}

export { Wallet };
