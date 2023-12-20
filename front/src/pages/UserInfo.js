import styled from 'styled-components';
import { useEffect, useState } from 'react';

import * as Api from 'api/api';

import Footer from 'components/UI/Footer';
import Header from 'components/UI/Header';
import { useNavigate } from 'react-router-dom';
import ROUTE from 'utils/ROUTE';

function UserInfo() {
  const navigate = useNavigate();

  const initialValue = {
    email: '0000@0000.com',
    isEmailAuthorized: false,
    role: 'user',
    userName: '',
    phoneNumber: '010-0000-0000',
    createdAt: '',
    updatedAt: '',
  };
  const [user, setUser] = useState(initialValue);
  const [isPwClick, setIsPwClick] = useState(false);
  const [passWord, setPassWord] = useState({ currentPw: '', newPw: '', checkPw: '' });

  const { email, isEmailAuthorized, role, userName, phoneNumber, createdAt, updatedAt } =
    user;

  const handleChange = (e) => {
    const newUser = { ...user };
    newUser[e.target.name] = e.target.value;
    return setUser(newUser);
  };
  const handlePwChange = (e) => {
    const newPassWord = { ...passWord };
    newPassWord[e.target.name] = e.target.value;
    return setPassWord(newPassWord);
  };

  const handleClick = async () => {
    try {
      const response = await Api.put('users', { userName, phoneNumber });
      setUser(response.data);
      alert('회원정보가 수정되었습니다.');
    } catch (err) {
      console.log(err);
    }
  };

  const handlePwChangeClick = async () => {
    try {
      const response = await Api.post('users/pass/vrfct', {
        password: passWord.currentPw,
      });
      await changePassWord();
    } catch (err) {
      console.log(err);
      alert('비밀번호가 맞지 않습니다.');
      setPassWord({ currentPw: '', newPw: '', checkPw: '' });
    }
  };

  const changePassWord = async () => {
    try {
      const response = await Api.put('users/pass/update', { password: passWord.newPw });
      alert('비밀번호 변경이 완료되었습니다.');
      setPassWord({ currentPw: '', newPw: '', checkPw: '' });
      setIsPwClick((preState) => !preState);
    } catch (err) {
      console.log(err);
      alert('비밀번호가 일치하지 않습니다.');
      setPassWord({ currentPw: '', newPw: '', checkPw: '' });
    }
  };

  useEffect(() => {
    if (!sessionStorage.getItem('ACCESS_TOKEN')) {
      alert('로그인이 필요합니다.');
      navigate(ROUTE.LOGIN);
    }

    const fetchUserData = async () => {
      try {
        const response = await Api.get('users');
        console.log(response.data);
        setUser(response.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchUserData();
  }, [navigate]);

  return (
    <>
      <Header></Header>
      <StyledMain>
        <StyledUserInfoWrapper>
          <StyledTitleWrapper>
            <h1>나의 정보</h1>
            <p>
              안전한 거래 안내와 배송 안내를 위하여 핸드폰 번호와 이메일 주소를 필히 확인
              부탁드립니다.
            </p>
          </StyledTitleWrapper>
          {isPwClick ? (
            <StyledContentWrapper>
              <label htmlFor="currentPw">현재 비밀번호</label>
              <StyledInput
                name="currentPw"
                value={passWord.currentPw}
                id="currentPw"
                onChange={handlePwChange}
                type="password"></StyledInput>
              <label htmlFor="newPw">새로운 비밀번호</label>
              <StyledInput
                name="newPw"
                value={passWord.newPw}
                onChange={handlePwChange}
                id="newPw"
                type="password"></StyledInput>
              <label htmlFor="checkPw">새로운 비밀번호 확인</label>
              <StyledInput
                name="checkPw"
                value={passWord.checkPw}
                onChange={handlePwChange}
                id="checkPw"
                type="password"></StyledInput>
            </StyledContentWrapper>
          ) : (
            <StyledContentWrapper>
              <h2>회원 정보</h2>
              <StyledContent>
                <label htmlFor="userName">성명</label>
                <input name="userName" value={userName} onChange={handleChange}></input>
              </StyledContent>
              <StyledContent>
                <div>이메일</div>
                <div>{email}</div>
              </StyledContent>
              <StyledContent>
                <label htmlFor="phoneNumber">휴대폰 번호</label>
                <input
                  name="phoneNumber"
                  value={phoneNumber}
                  onChange={handleChange}></input>
              </StyledContent>
              <StyledContent>
                <StyledPwBtn
                  onClick={() => {
                    setIsPwClick((preState) => !preState);
                  }}>
                  비밀번호 변경
                </StyledPwBtn>
              </StyledContent>
              <StyledContent>
                <div>사용자 권한</div>
                <div>{role}</div>
              </StyledContent>
              <StyledContent>
                <div>아이디 생성일자</div>
                <div>{createdAt}</div>
              </StyledContent>
            </StyledContentWrapper>
          )}
        </StyledUserInfoWrapper>
        <StyledBtnWrapper>
          {isPwClick ? (
            <StyledBtn onClick={() => setIsPwClick((preState) => !preState)}>
              이전
            </StyledBtn>
          ) : (
            <StyledBtn onClick={() => navigate(ROUTE.MAIN)}>홈화면</StyledBtn>
          )}
          {isPwClick ? (
            <StyledBtn onClick={handlePwChangeClick}>변경</StyledBtn>
          ) : (
            <StyledBtn onClick={handleClick}>수정</StyledBtn>
          )}
        </StyledBtnWrapper>
      </StyledMain>
      <Footer></Footer>
    </>
  );
}

export default UserInfo;

const StyledMain = styled.main`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  min-height: calc(100vh - 200px);
  min-width: 600px;

  @media (max-width: 600px) {
    min-width: 440px;
  }
  @media (max-width: 450px) {
    min-width: 400px;
  }
  @media (max-width: 400px) {
    min-width: 380px;
  }
`;

const StyledUserInfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-self: center;
  width: 400px;
  @media (max-width: 500px) {
    width: 340px;
  }
`;

const StyledTitleWrapper = styled.div`
  & h1 {
    font-size: 30px;
    margin-bottom: 20px;
  }
`;

const StyledContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 35px;
  margin-bottom: 20px;

  & h2 {
    font-size: 20px;
    padding-bottom: 10px;
    border-bottom: 3px solid rgba(0, 0, 0, 0.2);
  }
`;

const StyledContent = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 20px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
`;

const StyledBtn = styled.button`
  width: 140px;
  height: 50px;
  border: 0;
  border-radius: 10px;
  background-color: rgba(42, 193, 188, 0.5);
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;

  &:hover {
    background-color: rgba(42, 193, 188, 0.3);
  }
`;

const StyledBtnWrapper = styled.div`
  display: flex;
  justify-content: space-evenly;
  width: 700px;
  margin: 30px 0;

  @media (max-width: 500px) {
    width: 300px;
  }
`;

const StyledPwBtn = styled.button`
  width: 120px;
  height: 50px;
  border: none;
  font-size: 15px;
  font-weight: bold;
  cursor: pointer;
  background-color: rgba(42, 193, 188, 0.2);

  &:hover {
    background-color: rgba(42, 193, 188, 0.6);
  }
`;

const StyledInput = styled.input`
  margin-top: 10px;
  margin-bottom: 20px;
  height: 30px;
`;
