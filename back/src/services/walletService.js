import { Wallet } from "../db/model/Wallet";

class walletService {
  //포인트 내역 조회
  static async checkChanges(userId) {
    const changes = await Wallet.findWalletByUserId(userId);

    return changes;
  }

  //환전
  static async letChanges(wallet, newChanges) {
    const newKrwAmount = wallet.krwAmount - newChanges;
    const updatedChanges = await Wallet.updateData(wallet.id);

    wallet.krwAmount = newKrwAmount;
    delete wallet.id;
    delete wallet.expirationDate;
    wallet.statement = `${newChanges}원 환전`;
    const changes = await Wallet.letChanges(wallet);
    return changes;
  }
}

export { walletService };
