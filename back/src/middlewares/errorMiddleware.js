import { Prisma } from "@prisma/client";

function errorMiddleware(error, req, res, next) {
  // 터미널에 노란색으로 출력됨.

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // console.log("에러핸들러 출동");
    if (error.code === "P2002") {
      console.log("{constraint}에서 고유한 제약 조건이 실패했습니다.");

      if (error.message.includes("email")) {
        const error = "email이 중복되었습니다.";

        console.log("\x1b[33m%s\x1b[0m", "email이 중복되었습니다.");
        return res.status(400).send(error);
      }
    }
  }

  console.log("\x1b[33m%s\x1b[0m", error);
  res.status(400).send(error.message);
}

export { errorMiddleware };
