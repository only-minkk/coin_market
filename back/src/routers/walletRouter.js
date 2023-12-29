import { Router } from "express";
import { walletService } from "../services/walletService";
import { loginRequired } from "../middlewares/loginRequired";

const walletRouter = Router();

//잔액 조회
walletRouter.get("/users/wallet", loginRequired, async (req, res, next) => {
  try {
    const wallet = await walletService.checkChanges(req.userId);
    const count = req.query.count;

    if (count == undefined) {
      res.status(200).json(wallet[0]);
    } else {
      res.status(200).json(wallet);
    }
  } catch (err) {
    next(err);
  }
});

// 환전 신청
walletRouter.post("/users/wallet", loginRequired, async (req, res, next) => {
  try {
    const wallet = await walletService.checkChanges(req.userId);
    const changes = req.body.krwAmount;

    const newWallet = await walletService.letChanges(wallet[0], changes);

    res.status(201).json(newWallet);
  } catch (err) {
    next(err);
  }
});
export { walletRouter };
