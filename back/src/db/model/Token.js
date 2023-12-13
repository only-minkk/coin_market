import { db } from "../db";

//todo 로그아웃하면 토큰 DB에서 삭제해야하나?
//todo DB에 토큰을 저장해놓는게 좋나?
class Token {
  static async createdTokenDb(data) {
    const token = db.userToken.create({
      data,
    });
    return token;
  }

  static async findTokenById(userId) {
    const token = db.userToken.findUnique({
      where: {
        userId,
      },
    });
    return token;
  }

  static async updateToken(userId, refreshToken) {
    const updatedToken = db.userToken.update({
      where: {
        userId,
      },
      data: {
        refreshToken,
      },
    });
    return updatedToken;
  }

  static async deleteToken(userId) {
    const deletedToken = db.userToken.deleteToken({
      where: {
        userId,
      },
    });
    return deletedToken;
  }
}

export { Token };
