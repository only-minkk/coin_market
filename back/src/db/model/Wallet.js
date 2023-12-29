import { db } from "../db";

class Wallet {
  // 포인트 내역 조회
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

  // 환전 내역 생성
  static async letChanges(data) {
    const wallet = db.wallet.create({
      data,
    });
    return wallet;
  }

  // 최신 내역 Date 업데이트
  static async updateData(id) {
    // 최신 내역 조회
    const latestRecord = await db.wallet.findFirst({
      where: { id },
      orderBy: { expirationDate: "desc" },
    });

    // 최신 내역 수정
    const updatedWallet = db.wallet.update({
      where: {
        id: latestRecord.id,
      },
      data: {
        expirationDate: new Date(),
      },
    });
    return updatedWallet;
  }
}

export { Wallet };
