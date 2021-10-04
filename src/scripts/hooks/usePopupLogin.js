import React, { useState } from 'react';
import ModalWrapper from '../components/ModalWrapper';
import Login from '../modules/LOGIN';

export default function usePopupLogin() {
  const [isLoginPopup, setIsLoginPopup] = useState(false);
  const handleCloseLoginPopup = () => setIsLoginPopup(false);
  const handleOpenLoginPopup = () => setIsLoginPopup(true);
  const loginFormPopup = () => {
    return (
      <ModalWrapper
        children={<Login isForm={true} afterLogin={handleCloseLoginPopup} />}
        maxWidth="sm"
        fullScreen={false}
        show={isLoginPopup}
        hide={handleCloseLoginPopup}
      />
    );
  };

  return {
    isLoginPopup,
    loginFormPopup,
    handleOpenLoginPopup,
  };
}
