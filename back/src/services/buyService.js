import { Buy } from "../db/model/Buy";
import axios from "axios";
import jwt from "jsonwebtoken";

const { db } = require("../db/db");

class buyService {
  static async getCountryInfo(countryCode) {
    const countryId = await Buy.CountryIdByCountryCode(countryCode);

    return Buy.findCoinsByCountryId(countryId);
  }

  static async getAllInfo() {
    const data = Buy.findAllCoins();
    let re_data = {};
    for (const i of data) {
      let country = i["country"]["countryName"];

      if (Object.keys(re_data).includes(country)) {
        delete i["country"];
        re_data[country].push(i);
      } else {
        delete i["country"];
        re_data[country] = [i];
      }
    }
    return re_data;
  }

  static async buyOrder(data) {
    let orderData = data["order"];
    const coins = data["coins"];
    let delivery = data["address"];
    delivery["resStatus"] = "waiting";
    const pay = data["pay"]; //결제정보
    const secretKey = process.env.JWT_SECRET_KEY || "secret-key";
    const exchangeRates = pay["exchangeRateToken"].map((exchangeRatedata) => {
      return jwt.verify(exchangeRatedata, secretKey, (err, decoded) => {
        if (err) {
          throw new Error(err);
        }
        return decoded;
      });
    });
    let exchangeRatesByCode = {};
    for (let i of exchangeRates) {
      exchangeRatesByCode[i["currencyCode"]] = {
        exchangeRate: i["exchangeRate"],
        modifiedAt: i["modifiedAt"],
      };
    }

    const getToken = await axios({
      url: "https://api.iamport.kr/users/getToken",
      method: "post", // POST method
      headers: { "Content-Type": "application/json" }, // "Content-Type": "application/json"
      data: {
        imp_key: "7372276348828376", // REST API 키
        imp_secret:
          "d34yLdhsn3pN1AeSVkUhn3BtiWpPOHFEgY8mUUWihTNq4MJd3A2KTMP7DB24llqFldQyT9oRt2xFoEss", // REST API Secret
      },
    });
    const { access_token } = getToken.data.response;
    const getPaymentData = await axios({
      url: "https://api.iamport.kr/payments/" + pay["payCode"],
      method: "get", // GET method
      headers: { Authorization: access_token },
    });

    let coindict = [];
    for (let i of coins) {
      coindict[i["coinId"]] = i;
    }
    const CoinsUnitAmount = await Buy.findCoinsUnitAmount(
      Object.keys(coindict)
    );
    let CoinsUnitAmountById = {};
    for (let i of CoinsUnitAmount) {
      CoinsUnitAmountById[i["id"]] = {
        unitAmount: i["unitAmount"],
        exchangeRateCode: i["country"]["exchangeRateCode"],
      };
    }
    let amount = 0;
    for (let i in coindict) {
      amount +=
        exchangeRatesByCode[CoinsUnitAmountById[i]["exchangeRateCode"]][
          "exchangeRate"
        ] *
        CoinsUnitAmountById[i]["unitAmount"] *
        coindict[i]["dealAmount"];
    }

    const paymentData = getPaymentData.data.response;
    if (
      pay["amount"] != paymentData["amount"] &&
      pay["amount"] != Math.floor(amount)
    ) {
      throw new Error("결제금액이상");
    }

    orderData["userId"] = data["userId"];
    orderData["isActivate"] = 1;
    if (orderData["dealStatus"] !== "BUY") {
      throw new Error("비정상적 요청 입니다");
    }

    if (
      !("resAddress1" in delivery) ||
      !("resAddress2" in delivery) ||
      !("resName" in delivery)
    ) {
      throw new Error("주소누락");
    }
    for (let i of coins) {
      const stockData = await Buy.findCoin(i["coinId"]);
      if (i["dealAmount"] > stockData["stockAmount"]) {
        throw new Error("재고부족");
      }
    }

    let createOrderCoinList = [];
    let addSellerPoint = {};
    let updateDealCoinList = { idList: [], notZero: {} };
    for (let i of coins) {
      createOrderCoinList.push({
        coinId: i["coinId"],
        dealAmount: i["dealAmount"],
      });
      while (true) {
        const stockOrder = await Buy.findStockOrderByCoinId(i["coinId"]);
        for (let j of stockOrder) {
          if (j["deal"]["userId"] in Object.keys(addSellerPoint)) {
            addSellerPoint[j["deal"]["userId"]] +=
              i["dealAmount"] *
              exchangeRatesByCode[
                CoinsUnitAmountById[j["coin"]["id"]]["exchangeRateCode"]
              ]["exchangeRate"] *
              CoinsUnitAmountById[j["coin"]["id"]]["unitAmount"];
          } else {
            addSellerPoint[j["deal"]["userId"]] =
              i["dealAmount"] *
              exchangeRatesByCode[
                CoinsUnitAmountById[j["coin"]["id"]]["exchangeRateCode"]
              ]["exchangeRate"] *
              CoinsUnitAmountById[j["coin"]["id"]]["unitAmount"];
          }
          if (j["stockAmount"] > i["dealAmount"]) {
            updateDealCoinList["notZero"][j["id"]] =
              j["stockAmount"] - i["dealAmount"];
            i["dealAmount"] = 0;
            break;
          } else if (j["stockAmount"] < i["dealAmount"]) {
            updateDealCoinList["idList"].push(j["id"]);
            i["dealAmount"] = i["dealAmount"] - j["stockAmount"];
          } else if (j["stockAmount"] == i["dealAmount"]) {
            updateDealCoinList["idList"].push(j["id"]);
            i["dealAmount"] = 0;
            break;
          }
        }
        if (i["dealAmount"] == 0) {
          break;
        }
      }
    }
    for (let i in addSellerPoint) {
      addSellerPoint[i] = Math.floor(addSellerPoint[i]);
    }

    const userId = data["userId"];
    const dealStatus = orderData["dealStatus"];
    const imageUrl = orderData["imageUrl"];
    const isActivate = orderData["isActivate"];

    const dataToCreate = {
      userId,
      dealStatus,
      imageUrl,
      isActivate,
      delivery,
      createOrderCoinList,
      updateDealCoinList,
      addSellerPoint,
    };
    let order = await Buy.createDeal(dataToCreate);
    return "구매가 완료 되었습니다 : " + order[0]["id"];
  }
}
export { buyService };
